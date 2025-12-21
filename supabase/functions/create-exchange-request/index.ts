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
  NOT_FOUND: 'Item not found',
  OWN_ITEM: 'You cannot request an exchange with your own item',
  NOT_YOUR_ITEM: 'You can only offer your own items',
  CREATE_FAILED: 'Failed to create exchange request',
  SERVER_ERROR: 'An error occurred processing your request'
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    // Get the session or user object
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

    const { owner_item_id, requester_item_id, message } = await req.json()

    // Input validation
    if (!owner_item_id || typeof owner_item_id !== 'string') {
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.INVALID_INPUT }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (requester_item_id !== undefined && requester_item_id !== null && typeof requester_item_id !== 'string') {
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.INVALID_INPUT }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (message !== undefined && message !== null) {
      if (typeof message !== 'string') {
        return new Response(
          JSON.stringify({ error: ERROR_MESSAGES.INVALID_INPUT }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      if (message.length > 1000) {
        return new Response(
          JSON.stringify({ error: 'Message must be 1000 characters or less' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
    }

    const sanitizedMessage = message ? message.trim() : null

    // Validate that the requester owns the requester_item (if provided)
    if (requester_item_id) {
      const { data: requesterItem } = await supabaseClient
        .from('items')
        .select('user_id')
        .eq('id', requester_item_id)
        .single()

      if (!requesterItem || requesterItem.user_id !== user.id) {
        return new Response(
          JSON.stringify({ error: ERROR_MESSAGES.NOT_YOUR_ITEM }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }
    }

    // Get the owner item details
    const { data: ownerItem } = await supabaseClient
      .from('items')
      .select('user_id, title')
      .eq('id', owner_item_id)
      .single()

    if (!ownerItem) {
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.NOT_FOUND }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Don't allow users to request exchange with their own items
    if (ownerItem.user_id === user.id) {
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.OWN_ITEM }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Create the exchange request
    const { data: exchange, error: exchangeError } = await supabaseClient
      .from('exchanges')
      .insert({
        requester_id: user.id,
        owner_id: ownerItem.user_id,
        owner_item_id,
        requester_item_id: requester_item_id || null,
        message: sanitizedMessage,
        status: 'pending'
      })
      .select()
      .single()

    if (exchangeError) {
      console.error('Exchange insert error:', exchangeError)
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.CREATE_FAILED }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Create notification for the owner using service role to bypass RLS
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await serviceClient
      .from('notifications')
      .insert({
        user_id: ownerItem.user_id,
        type: 'exchange_request',
        title: 'New Exchange Request',
        content: `Someone wants to exchange an item for your "${ownerItem.title}"`,
        related_id: exchange.id
      })

    return new Response(
      JSON.stringify({ data: exchange }),
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