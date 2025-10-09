-- المتنبي (Al-Mutanabbi) Stage 3: Library Rating System
-- Enhanced schema for library ratings and reviews

-- Create library reviews/ratings table
CREATE TABLE IF NOT EXISTS library_reviews (
    id SERIAL PRIMARY KEY,
    bookstore_id INTEGER NOT NULL REFERENCES bookstores(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_title VARCHAR(255),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(bookstore_id, user_id)
);

-- Create indexes for library reviews
CREATE INDEX IF NOT EXISTS idx_library_reviews_bookstore_id ON library_reviews(bookstore_id);
CREATE INDEX IF NOT EXISTS idx_library_reviews_user_id ON library_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_library_reviews_rating ON library_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_library_reviews_created_at ON library_reviews(created_at);

-- Add rating columns to bookstores table
ALTER TABLE bookstores ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE bookstores ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Create indexes for bookstore ratings
CREATE INDEX IF NOT EXISTS idx_bookstores_rating ON bookstores(rating);
CREATE INDEX IF NOT EXISTS idx_bookstores_total_reviews ON bookstores(total_reviews);

-- Create function to update library ratings
CREATE OR REPLACE FUNCTION update_library_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE bookstores 
    SET 
        rating = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM library_reviews 
            WHERE bookstore_id = COALESCE(NEW.bookstore_id, OLD.bookstore_id)
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM library_reviews 
            WHERE bookstore_id = COALESCE(NEW.bookstore_id, OLD.bookstore_id)
        )
    WHERE id = COALESCE(NEW.bookstore_id, OLD.bookstore_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update library ratings
DROP TRIGGER IF EXISTS trigger_update_library_rating ON library_reviews;
CREATE TRIGGER trigger_update_library_rating
    AFTER INSERT OR UPDATE OR DELETE ON library_reviews
    FOR EACH ROW EXECUTE FUNCTION update_library_rating();

-- Create view for library statistics with ratings
CREATE OR REPLACE VIEW library_stats_with_ratings AS
SELECT 
    bs.id,
    bs.name,
    bs.name_arabic,
    bs.governorate,
    bs.rating,
    bs.total_reviews,
    COUNT(DISTINCT b.id) as total_books,
    COUNT(DISTINCT CASE WHEN b.is_active = true THEN b.id END) as active_books,
    COALESCE(sales.total_revenue, 0) as total_revenue,
    COALESCE(sales.total_orders, 0) as total_orders,
    COALESCE(AVG(br.rating), 0) as avg_book_rating,
    COUNT(DISTINCT br.id) as total_book_reviews
FROM bookstores bs
LEFT JOIN books b ON bs.id = b.bookstore_id
LEFT JOIN book_reviews br ON b.id = br.book_id
LEFT JOIN (
    SELECT 
        b.bookstore_id,
        SUM(oi.quantity * oi.price) as total_revenue,
        COUNT(DISTINCT o.id) as total_orders
    FROM books b
    JOIN order_items oi ON b.id = oi.book_id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'completed'
    GROUP BY b.bookstore_id
) sales ON bs.id = sales.bookstore_id
WHERE bs.is_active = true
GROUP BY bs.id, bs.name, bs.name_arabic, bs.governorate, bs.rating, bs.total_reviews, sales.total_revenue, sales.total_orders;

-- Create view for top rated libraries
CREATE OR REPLACE VIEW top_rated_libraries AS
SELECT 
    bs.*,
    lr.recent_reviews
FROM bookstores bs
LEFT JOIN (
    SELECT 
        bookstore_id,
        json_agg(
            json_build_object(
                'id', lr.id,
                'rating', lr.rating,
                'review_title', lr.review_title,
                'review_text', lr.review_text,
                'user_name', u.full_name,
                'created_at', lr.created_at
            ) ORDER BY lr.created_at DESC
        ) as recent_reviews
    FROM library_reviews lr
    JOIN users u ON lr.user_id = u.id
    GROUP BY bookstore_id
) lr ON bs.id = lr.bookstore_id
WHERE bs.is_active = true 
    AND bs.is_approved = true 
    AND bs.rating > 0
ORDER BY bs.rating DESC, bs.total_reviews DESC;

-- Add updated_at trigger to library_reviews
CREATE TRIGGER update_library_reviews_updated_at 
    BEFORE UPDATE ON library_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update existing bookstores with calculated ratings from book reviews
UPDATE bookstores 
SET rating = subquery.avg_rating,
    total_reviews = subquery.review_count
FROM (
    SELECT 
        bs.id,
        COALESCE(ROUND(AVG(br.rating)::numeric, 2), 0) as avg_rating,
        COUNT(br.id) as review_count
    FROM bookstores bs
    LEFT JOIN books b ON bs.id = b.bookstore_id
    LEFT JOIN book_reviews br ON b.id = br.book_id
    GROUP BY bs.id
) subquery
WHERE bookstores.id = subquery.id;

-- Create completion log
INSERT INTO schema_migrations (version, applied_at) VALUES ('003-library-ratings', NOW())
ON CONFLICT (version) DO UPDATE SET applied_at = NOW();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'المتنبي Stage 3: Library Rating System applied successfully!';
    RAISE NOTICE 'Enhanced features: Library Reviews, Rating System, Analytics Views';
END $$;
