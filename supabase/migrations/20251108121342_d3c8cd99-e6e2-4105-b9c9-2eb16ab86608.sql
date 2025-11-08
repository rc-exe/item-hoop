-- Insert default categories if they don't exist
INSERT INTO public.categories (name, description, icon) VALUES
  ('Books', 'Books, magazines, and reading materials', 'BookOpen'),
  ('Electronics', 'Electronic devices and gadgets', 'Camera'),
  ('Gaming', 'Video games and gaming accessories', 'Gamepad2'),
  ('Clothing', 'Fashion and clothing items', 'Shirt'),
  ('Home & Garden', 'Home decor and garden supplies', 'Home'),
  ('Music', 'Musical instruments and equipment', 'Music'),
  ('Computers', 'Computers and technology', 'Laptop'),
  ('Sports', 'Sports equipment and gear', 'Dumbbell')
ON CONFLICT DO NOTHING;