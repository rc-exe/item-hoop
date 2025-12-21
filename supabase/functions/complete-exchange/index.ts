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

    const { exchange_id, completion_notes } = await req.json()

    // Input validation
    if (!exchange_id || typeof exchange_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid exchange_id' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (completion_notes && typeof completion_notes !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid completion_notes format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (completion_notes && completion_notes.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Completion notes must be 500 characters or less' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const sanitizedNotes = completion_notes ? completion_notes.trim() : null

    // Get the exchange details
    const { data: exchange, error: exchangeError } = await supabaseClient
      .from('exchanges')
      .select('*')
      .eq('id', exchange_id)
      .single()

    if (exchangeError || !exchange) {
      return new Response(
        JSON.stringify({ error: 'Exchange not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Check if user is part of the exchange
    if (exchange.owner_id !== user.id && exchange.requester_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized to complete this exchange' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      )
    }

    // Check if exchange is in accepted status
    if (exchange.status !== 'accepted') {
      return new Response(
        JSON.stringify({ error: 'Exchange must be accepted before completion' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Update exchange status to completed
    const { data: updatedExchange, error: updateError } = await supabaseClient
      .from('exchanges')
      .update({
        status: 'completed',
        completion_notes: sanitizedNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', exchange_id)
      .select()
      .single()

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Update item statuses to completed
    if (exchange.owner_item_id) {
      await supabaseClient
        .from('items')
        .update({ status: 'completed' })
        .eq('id', exchange.owner_item_id)
    }

    if (exchange.requester_item_id) {
      await supabaseClient
        .from('items')
        .update({ status: 'completed' })
        .eq('id', exchange.requester_item_id)
    }

    // Update user exchange counts
    await supabaseClient.rpc('update_user_rating_stats', {
      user_id_param: exchange.owner_id
    })

    await supabaseClient.rpc('update_user_rating_stats', {
      user_id_param: exchange.requester_id
    })

    // Create notifications for both users
    const otherUserId = exchange.owner_id === user.id ? exchange.requester_id : exchange.owner_id

    await supabaseClient
      .from('notifications')
      .insert({
        user_id: otherUserId,
        type: 'exchange_completed',
        title: 'Exchange Completed',
        content: 'Your exchange has been marked as completed. You can now rate your experience.',
        related_id: exchange.id
      })

    return new Response(
      JSON.stringify({ data: updatedExchange }),
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