import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
        JSON.stringify({ error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    const { owner_item_id, requester_item_id, message } = await req.json()

    // Validate that the requester owns the requester_item (if provided)
    if (requester_item_id) {
      const { data: requesterItem } = await supabaseClient
        .from('items')
        .select('user_id')
        .eq('id', requester_item_id)
        .single()

      if (!requesterItem || requesterItem.user_id !== user.id) {
        return new Response(
          JSON.stringify({ error: 'You can only offer your own items' }),
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
        JSON.stringify({ error: 'Item not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Don't allow users to request exchange with their own items
    if (ownerItem.user_id === user.id) {
      return new Response(
        JSON.stringify({ error: 'You cannot request an exchange with your own item' }),
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
        requester_item_id,
        message,
        status: 'pending'
      })
      .select()
      .single()

    if (exchangeError) {
      return new Response(
        JSON.stringify({ error: exchangeError.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Create notification for the owner
    await supabaseClient
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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})