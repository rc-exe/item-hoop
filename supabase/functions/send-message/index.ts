import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    const { receiver_id, content, exchange_id, message_type = 'text' } = await req.json()

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
        JSON.stringify({ error: 'Failed to create conversation' }),
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
        content,
        message_type
      })
      .select()
      .single()

    if (messageError) {
      console.error('Message error:', messageError)
      return new Response(
        JSON.stringify({ error: messageError.message }),
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
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: receiver_id,
        type: 'message',
        title: 'New Message',
        content: `You have a new message: ${content.slice(0, 50)}${content.length > 50 ? '...' : ''}`,
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
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})