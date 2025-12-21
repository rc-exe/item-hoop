import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generic error messages to avoid leaking internal details
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authentication required',
  INVALID_INPUT: 'Invalid request parameters',
  NOT_FOUND: 'Resource not found',
  FORBIDDEN: 'Access denied',
  SERVER_ERROR: 'An error occurred processing your request',
  SEND_FAILED: 'Failed to send message',
  CONVERSATION_FAILED: 'Failed to create conversation'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.UNAUTHORIZED }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    const { receiver_id, content, exchange_id, message_type = 'text' } = await req.json()

    // Input validation
    if (!receiver_id || typeof receiver_id !== 'string') {
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.INVALID_INPUT }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message content is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (content.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Message content must be 2000 characters or less' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const sanitizedContent = content.trim()

    // Check if this is a reply to calculate response time
    const { data: lastReceivedMessage } = await supabaseClient
      .from('messages')
      .select('created_at, sender_id')
      .eq('sender_id', receiver_id)
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // If user is replying to a message, calculate response time and update profile
    if (lastReceivedMessage) {
      const lastReceivedTime = new Date(lastReceivedMessage.created_at).getTime()
      const now = Date.now()
      const responseTimeHours = Math.round((now - lastReceivedTime) / (1000 * 60 * 60))
      
      // Get current profile response time to calculate average
      const { data: currentProfile } = await serviceClient
        .from('profiles')
        .select('response_time_hours')
        .eq('id', user.id)
        .single()
      
      if (currentProfile) {
        const currentResponseTime = currentProfile.response_time_hours || 24
        // Calculate weighted average (give more weight to recent responses)
        const newResponseTime = Math.round((currentResponseTime + responseTimeHours) / 2)
        
        // Update profile response time (cap at 168 hours = 1 week)
        await serviceClient
          .from('profiles')
          .update({ response_time_hours: Math.min(newResponseTime, 168) })
          .eq('id', user.id)
      }
    }

    // Get or create conversation
    const { data: conversationData, error: conversationError } = await supabaseClient
      .rpc('get_or_create_conversation', {
        participant_1: user.id,
        participant_2: receiver_id,
        exchange_id_param: exchange_id
      })

    if (conversationError) {
      console.error('Conversation error:', conversationError)
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.CONVERSATION_FAILED }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    const conversation_id = conversationData

    // Insert the message
    const { data: message, error: messageError } = await supabaseClient
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id,
        exchange_id,
        content: sanitizedContent,
        message_type
      })
      .select()
      .single()

    if (messageError) {
      console.error('Message error:', messageError)
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.SEND_FAILED }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Update conversation with last message
    await supabaseClient
      .from('conversations')
      .update({
        last_message_id: message.id,
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversation_id)

    // Create notification for the receiver
    await serviceClient
      .from('notifications')
      .insert({
        user_id: receiver_id,
        type: 'item_inquiry',
        title: 'New Message',
        content: `You have a new message: ${sanitizedContent.slice(0, 50)}${sanitizedContent.length > 50 ? '...' : ''}`,
        related_id: message.id
      })

    return new Response(
      JSON.stringify({ data: message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: ERROR_MESSAGES.SERVER_ERROR }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})