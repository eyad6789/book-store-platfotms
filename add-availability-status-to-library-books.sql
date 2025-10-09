-- Add availability_status column to library_books table
-- This allows library owners to manage book availability status

ALTER TABLE library_books 
ADD COLUMN availability_status VARCHAR(20) DEFAULT 'available' 
CHECK (availability_status IN ('available', 'unavailable', 'coming_soon'));

-- Update existing library books to be available by default
UPDATE library_books 
SET availability_status = 'available' 
WHERE availability_status IS NULL;
