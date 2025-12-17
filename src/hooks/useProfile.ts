import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  phone: string | null;
  website: string | null;
  is_verified: boolean;
  rating: number;
  total_exchanges: number;
  response_time_hours: number;
  created_at: string;
}

export interface UserItem {
  id: string;
  title: string;
  description: string | null;
  condition: string | null;
  estimated_value: number | null;
  status: 'available' | 'exchanged' | 'pending_exchange' | 'removed';
  images: string[];
  views_count: number;
  is_featured: boolean;
  created_at: string;
  category: {
    name: string;
    icon: string | null;
  } | null;
}

export interface UserActivity {
  id: string;
  type: 'item_listed' | 'exchange_completed' | 'review_received' | 'exchange_requested';
  title: string;
  description: string;
  created_at: string;
  related_id: string | null;
  item?: UserItem;
}

export interface UserReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  type: 'given' | 'received';
  otherUser: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  exchangeItem: string | null;
}

export const useProfile = (userId?: string) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<UserItem[]>([]);
  const [favorites, setFavorites] = useState<UserItem[]>([]);
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [exchangedItems, setExchangedItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    const loadData = async () => {
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchProfile(),
          fetchUserItems(),
          fetchExchangedItems(),
          fetchUserActivity(),
          fetchFavorites(),
          fetchReviews()
        ]);
      } catch (err) {
        console.error('Error loading profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Real-time subscriptions
    if (!targetUserId) return;

    const profileChannel = supabase
      .channel(`profile-${targetUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${targetUserId}`
        },
        () => {
          fetchProfile();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `user_id=eq.${targetUserId}`
        },
        () => {
          fetchUserItems();
          fetchExchangedItems();
          fetchUserActivity();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exchanges'
        },
        () => {
          fetchProfile();
          fetchExchangedItems();
          fetchUserActivity();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exchange_ratings'
        },
        () => {
          fetchProfile();
          fetchReviews();
          fetchUserActivity();
        }
      )
      .subscribe();

    const favoritesChannel = supabase
      .channel(`favorites-${targetUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${targetUserId}`
        },
        () => {
          fetchFavorites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(favoritesChannel);
    };
  }, [targetUserId]);

  const fetchProfile = async () => {
    if (!targetUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    }
  };

  const fetchUserItems = async () => {
    if (!targetUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          id,
          title,
          description,
          condition,
          estimated_value,
          status,
          images,
          views_count,
          is_featured,
          created_at,
          categories:category_id (
            name,
            icon
          )
        `)
        .eq('user_id', targetUserId)
        .neq('status', 'exchanged')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedItems: UserItem[] = (data || []).map(item => ({
        ...item,
        category: item.categories || null
      }));
      
      setItems(formattedItems);
    } catch (err) {
      console.error('Items fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
    }
  };

  const fetchExchangedItems = async () => {
    if (!targetUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          id,
          title,
          description,
          condition,
          estimated_value,
          status,
          images,
          views_count,
          is_featured,
          created_at,
          categories:category_id (
            name,
            icon
          )
        `)
        .eq('user_id', targetUserId)
        .eq('status', 'exchanged')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedItems: UserItem[] = (data || []).map(item => ({
        ...item,
        category: item.categories || null
      }));
      
      setExchangedItems(formattedItems);
    } catch (err) {
      console.error('Exchanged items fetch error:', err);
    }
  };

  const fetchFavorites = async () => {
    if (!targetUserId) return;
    
    try {
      const { data: favoritesData, error } = await supabase
        .from('favorites')
        .select(`
          item_id,
          items:item_id (
            id,
            title,
            description,
            condition,
            estimated_value,
            status,
            images,
            views_count,
            is_featured,
            created_at,
            categories:category_id (
              name,
              icon
            )
          )
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedFavorites: UserItem[] = (favoritesData || [])
        .map(fav => fav.items)
        .filter((item): item is any => item !== null)
        .map(item => ({
          ...item,
          category: item.categories || null
        }));
      
      setFavorites(formattedFavorites);
    } catch (err) {
      console.error('Favorites fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
    }
  };

  const fetchReviews = async () => {
    if (!targetUserId) return;
    
    try {
      // Get reviews received
      const { data: receivedReviews } = await supabase
        .from('exchange_ratings')
        .select(`
          id,
          rating,
          comment,
          created_at,
          rater_id,
          rater:rater_id (
            id,
            full_name,
            username,
            avatar_url
          ),
          exchanges:exchange_id (
            owner_items:owner_item_id (title)
          )
        `)
        .eq('rated_id', targetUserId)
        .order('created_at', { ascending: false });

      // Get reviews given
      const { data: givenReviews } = await supabase
        .from('exchange_ratings')
        .select(`
          id,
          rating,
          comment,
          created_at,
          rated_id,
          rated:rated_id (
            id,
            full_name,
            username,
            avatar_url
          ),
          exchanges:exchange_id (
            owner_items:owner_item_id (title)
          )
        `)
        .eq('rater_id', targetUserId)
        .order('created_at', { ascending: false });

      const formattedReviews: UserReview[] = [];

      receivedReviews?.forEach((review: any) => {
        formattedReviews.push({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          type: 'received',
          otherUser: review.rater || null,
          exchangeItem: review.exchanges?.owner_items?.title || null
        });
      });

      givenReviews?.forEach((review: any) => {
        formattedReviews.push({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          type: 'given',
          otherUser: review.rated || null,
          exchangeItem: review.exchanges?.owner_items?.title || null
        });
      });

      // Sort by date
      formattedReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setReviews(formattedReviews);
    } catch (err) {
      console.error('Reviews fetch error:', err);
    }
  };

  const fetchUserActivity = async () => {
    if (!targetUserId) return;
    
    try {
      // Get recent items listed (excluding exchanged)
      const { data: recentItems } = await supabase
        .from('items')
        .select('id, title, created_at')
        .eq('user_id', targetUserId)
        .neq('status', 'exchanged')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent completed exchanges
      const { data: recentExchanges } = await supabase
        .from('exchanges')
        .select(`
          id,
          status,
          created_at,
          updated_at,
          requester_id,
          owner_id,
          owner_items:owner_item_id (title),
          requester_items:requester_item_id (title)
        `)
        .or(`requester_id.eq.${targetUserId},owner_id.eq.${targetUserId}`)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false })
        .limit(5);

      // Format activity data
      const activities: UserActivity[] = [];

      // Add item listings
      recentItems?.forEach(item => {
        activities.push({
          id: `item_${item.id}`,
          type: 'item_listed',
          title: `Listed new item: ${item.title}`,
          description: 'New item available for exchange',
          created_at: item.created_at,
          related_id: item.id
        });
      });

      // Add completed exchanges
      recentExchanges?.forEach((exchange: any) => {
        const isRequester = exchange.requester_id === targetUserId;
        const itemTitle = exchange.owner_items?.title || exchange.requester_items?.title || 'Unknown item';
        
        activities.push({
          id: `exchange_${exchange.id}`,
          type: 'exchange_completed',
          title: `Completed exchange${isRequester ? ' as requester' : ' as owner'}`,
          description: `Exchange involving: ${itemTitle}`,
          created_at: exchange.updated_at,
          related_id: exchange.id
        });
      });

      // Sort all activities by date
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setActivity(activities.slice(0, 10));
    } catch (err) {
      console.error('Activity fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activity');
    }
  };

  const refreshData = async () => {
    if (!targetUserId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchProfile(),
        fetchUserItems(),
        fetchExchangedItems(),
        fetchUserActivity(),
        fetchFavorites(),
        fetchReviews()
      ]);
    } catch (err) {
      console.error('Error refreshing profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    items,
    favorites,
    activity,
    reviews,
    exchangedItems,
    loading,
    error,
    refreshData
  };
};