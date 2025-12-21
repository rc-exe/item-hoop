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

    const { exchange_id, action, message } = await req.json()

    // Input validation
    if (!exchange_id || typeof exchange_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid exchange_id' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!action || !['accept', 'reject'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Action must be either "accept" or "reject"' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (message !== undefined && message !== null) {
      if (typeof message !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Invalid message format' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      if (message.length > 500) {
        return new Response(
          JSON.stringify({ error: 'Message must be 500 characters or less' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
    }

    const sanitizedMessage = message ? message.trim() : null

    // Validate that the user owns this exchange
    const { data: exchange } = await supabaseClient
      .from('exchanges')
      .select('owner_id, requester_id, status')
      .eq('id', exchange_id)
      .single()

    if (!exchange || exchange.owner_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Exchange not found or unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    if (exchange.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Exchange request is no longer pending' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Update exchange status
    const newStatus = action === 'accept' ? 'accepted' : 'rejected'
    
    const { data: updatedExchange, error: updateError } = await supabaseClient
      .from('exchanges')
      .update({ 
        status: newStatus,
        ...(sanitizedMessage && { message: sanitizedMessage }) 
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

    // Create notification for the requester using service role to bypass RLS
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const notificationTitle = action === 'accept' 
      ? 'Exchange Request Accepted!'
      : 'Exchange Request Declined'
    
    const notificationContent = action === 'accept'
      ? 'Your exchange request has been accepted. You can now coordinate the exchange.'
      : 'Your exchange request has been declined.'

    await serviceClient
      .from('notifications')
      .insert({
        user_id: exchange.requester_id,
        type: action === 'accept' ? 'exchange_accepted' : 'exchange_rejected',
        title: notificationTitle,
        content: notificationContent,
        related_id: exchange_id
      })

    // If accepted, update item statuses to pending_exchange
    if (action === 'accept') {
      const itemsToUpdate = [updatedExchange.owner_item_id]
      if (updatedExchange.requester_item_id) {
        itemsToUpdate.push(updatedExchange.requester_item_id)
      }

      await supabaseClient
        .from('items')
        .update({ status: 'pending_exchange' })
        .in('id', itemsToUpdate)
    }

    return new Response(
      JSON.stringify({ data: updatedExchange }),
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