-- Remove stock_quantity from all book tables
-- This makes all books always available to all users

-- Remove stock_quantity from books table
ALTER TABLE books DROP COLUMN IF EXISTS stock_quantity;

-- Remove stock_quantity and availability_status from library_books table  
ALTER TABLE library_books DROP COLUMN IF EXISTS stock_quantity;
ALTER TABLE library_books DROP COLUMN IF EXISTS availability_status;

-- Update any existing cart items to have unlimited stock
-- (This ensures existing cart items continue to work)
UPDATE cart_items SET quantity = LEAST(quantity, 10) WHERE quantity > 10;

-- Optional: Add a comment to document the change
COMMENT ON TABLE books IS 'All books are always available - no stock limitations';
COMMENT ON TABLE library_books IS 'All library books are always available - no stock limitations';
