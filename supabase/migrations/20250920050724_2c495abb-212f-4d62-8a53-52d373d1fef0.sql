-- Create enum for item status
CREATE TYPE public.item_status AS ENUM ('available', 'pending_exchange', 'exchanged', 'removed');

-- Create enum for exchange status  
CREATE TYPE public.exchange_status AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'cancelled');

-- Create enum for notification types
CREATE TYPE public.notification_type AS ENUM ('exchange_request', 'exchange_accepted', 'exchange_rejected', 'exchange_completed', 'exchange_cancelled', 'item_inquiry', 'system');

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create items table
CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  estimated_value DECIMAL(10,2),
  images TEXT[] DEFAULT '{}',
  location TEXT,
  status public.item_status NOT NULL DEFAULT 'available',
  is_featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exchanges table
CREATE TABLE public.exchanges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  requester_item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  message TEXT,
  status public.exchange_status NOT NULL DEFAULT 'pending',
  meeting_location TEXT,
  meeting_time TIMESTAMP WITH TIME ZONE,
  completion_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT no_self_exchange CHECK (requester_id != owner_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exchange_ratings table for mutual ratings after exchanges
CREATE TABLE public.exchange_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exchange_id UUID NOT NULL REFERENCES public.exchanges(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rated_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(exchange_id, rater_id)
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_ratings ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

-- Items policies
CREATE POLICY "Items are viewable by everyone" 
ON public.items FOR SELECT USING (true);

CREATE POLICY "Users can insert their own items" 
ON public.items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" 
ON public.items FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" 
ON public.items FOR DELETE 
USING (auth.uid() = user_id);

-- Exchanges policies
CREATE POLICY "Users can view exchanges they are part of" 
ON public.exchanges FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = owner_id);

CREATE POLICY "Users can insert exchanges as requester" 
ON public.exchanges FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update exchanges they are part of" 
ON public.exchanges FOR UPDATE 
USING (auth.uid() = requester_id OR auth.uid() = owner_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications FOR DELETE 
USING (auth.uid() = user_id);

-- Exchange ratings policies
CREATE POLICY "Users can view ratings for exchanges they were part of" 
ON public.exchange_ratings FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.exchanges 
    WHERE id = exchange_id 
    AND (requester_id = auth.uid() OR owner_id = auth.uid())
  )
);

CREATE POLICY "Users can insert ratings for their exchanges" 
ON public.exchange_ratings FOR INSERT 
WITH CHECK (
  auth.uid() = rater_id 
  AND EXISTS (
    SELECT 1 FROM public.exchanges 
    WHERE id = exchange_id 
    AND (requester_id = auth.uid() OR owner_id = auth.uid())
    AND status = 'completed'
  )
);

-- Create indexes for better performance
CREATE INDEX idx_items_user_id ON public.items(user_id);
CREATE INDEX idx_items_category_id ON public.items(category_id);
CREATE INDEX idx_items_status ON public.items(status);
CREATE INDEX idx_items_created_at ON public.items(created_at DESC);

CREATE INDEX idx_exchanges_requester_id ON public.exchanges(requester_id);
CREATE INDEX idx_exchanges_owner_id ON public.exchanges(owner_id);
CREATE INDEX idx_exchanges_status ON public.exchanges(status);
CREATE INDEX idx_exchanges_created_at ON public.exchanges(created_at DESC);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Create triggers for updated_at columns
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exchanges_updated_at
  BEFORE UPDATE ON public.exchanges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();