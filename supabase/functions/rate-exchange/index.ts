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

    const { exchange_id, rating, comment } = await req.json()

    // Input validation
    if (!exchange_id || typeof exchange_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid exchange_id' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Validate rating
    if (!rating || typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({ error: 'Rating must be an integer between 1 and 5' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Validate comment
    if (comment !== undefined && comment !== null) {
      if (typeof comment !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Invalid comment format' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      if (comment.length > 500) {
        return new Response(
          JSON.stringify({ error: 'Comment must be 500 characters or less' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
    }

    const sanitizedComment = comment ? comment.trim() : null

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
        JSON.stringify({ error: 'Unauthorized to rate this exchange' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      )
    }

    // Check if exchange is completed
    if (exchange.status !== 'completed') {
      return new Response(
        JSON.stringify({ error: 'Exchange must be completed before rating' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Determine who is being rated
    const rated_id = exchange.owner_id === user.id ? exchange.requester_id : exchange.owner_id

    // Check if rating already exists
    const { data: existingRating } = await supabaseClient
      .from('exchange_ratings')
      .select('id')
      .eq('exchange_id', exchange_id)
      .eq('rater_id', user.id)
      .single()

    if (existingRating) {
      return new Response(
        JSON.stringify({ error: 'You have already rated this exchange' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Create the rating
    const { data: newRating, error: ratingError } = await supabaseClient
      .from('exchange_ratings')
      .insert({
        exchange_id,
        rater_id: user.id,
        rated_id,
        rating,
        comment: sanitizedComment
      })
      .select()
      .single()

    if (ratingError) {
      return new Response(
        JSON.stringify({ error: ratingError.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Update user rating stats
    await supabaseClient.rpc('update_user_rating_stats', {
      user_id_param: rated_id
    })

    // Create notification for the rated user
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: rated_id,
        type: 'rating_received',
        title: 'New Rating Received',
        content: `You received a ${rating}-star rating for your exchange.`,
        related_id: newRating.id
      })

    return new Response(
      JSON.stringify({ data: newRating }),
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