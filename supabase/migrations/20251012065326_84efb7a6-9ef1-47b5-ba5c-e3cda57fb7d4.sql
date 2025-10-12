-- Drop the existing check constraint on items.condition
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_condition_check;

-- Add updated check constraint with correct values
ALTER TABLE items ADD CONSTRAINT items_condition_check 
CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor'));