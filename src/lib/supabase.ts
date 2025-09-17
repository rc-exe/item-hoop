import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Profile {
  id: string
  username?: string
  full_name?: string
  bio?: string
  avatar_url?: string
  location?: string
  phone?: string
  website?: string
  rating: number
  total_exchanges: number
  response_time_hours: number
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Item {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  condition?: string
  estimated_value?: number
  images: string[]
  wanted_items: string[]
  location?: string
  status: 'available' | 'pending_exchange' | 'exchanged' | 'unavailable'
  views_count: number
  is_featured: boolean
  expires_at?: string
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Exchange {
  id: string
  requester_id: string
  owner_id: string
  requester_item_id?: string
  owner_item_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
  message?: string
  meeting_location?: string
  meeting_time?: string
  completed_at?: string
  rating_by_requester?: number
  rating_by_owner?: number
  review_by_requester?: string
  review_by_owner?: string
  created_at: string
  updated_at: string
  requester_profile?: Profile
  owner_profile?: Profile
  requester_item?: Item
  owner_item?: Item
}

export interface Message {
  id: string
  exchange_id: string
  sender_id: string
  content: string
  attachments: string[]
  is_read: boolean
  created_at: string
  sender_profile?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: 'exchange_request' | 'exchange_accepted' | 'exchange_rejected' | 'exchange_completed' | 'message' | 'system'
  title: string
  content: string
  related_id?: string
  is_read: boolean
  created_at: string
}

export interface Review {
  id: string
  reviewer_id: string
  reviewed_id: string
  exchange_id?: string
  rating: number
  comment?: string
  created_at: string
  reviewer_profile?: Profile
}