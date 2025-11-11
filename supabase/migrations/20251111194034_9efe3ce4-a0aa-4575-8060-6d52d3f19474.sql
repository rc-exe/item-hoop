-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view comments
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments
  FOR SELECT
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "Users can create comments"
  ON public.comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON public.comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Item owners can delete any comment on their items
CREATE POLICY "Item owners can delete comments on their items"
  ON public.comments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.items
      WHERE items.id = comments.item_id
      AND items.user_id = auth.uid()
    )
  );

-- Item owners can update (pin/unpin) comments on their items
CREATE POLICY "Item owners can update comments on their items"
  ON public.comments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.items
      WHERE items.id = comments.item_id
      AND items.user_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();