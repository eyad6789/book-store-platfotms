-- المتنبي (Al-Mutanabbi) Stage 2 Database Enhancements
-- Enhanced schema for categories, reviews, wishlists, and search analytics

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create categories table with hierarchy support
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    name_ku VARCHAR(255),
    description TEXT,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    icon_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for categories
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_name_ar ON categories(name_ar);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Create book reviews table
CREATE TABLE IF NOT EXISTS book_reviews (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_title VARCHAR(255),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(book_id, user_id)
);

-- Create indexes for book reviews
CREATE INDEX IF NOT EXISTS idx_book_reviews_book_id ON book_reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_user_id ON book_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_rating ON book_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_book_reviews_created_at ON book_reviews(created_at);

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- Create indexes for wishlists
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_book_id ON wishlists(book_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_created_at ON wishlists(created_at);

-- Create search queries table for analytics
CREATE TABLE IF NOT EXISTS search_queries (
    id SERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    results_count INTEGER DEFAULT 0,
    clicked_book_id INTEGER REFERENCES books(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for search queries
CREATE INDEX IF NOT EXISTS idx_search_queries_query ON search_queries(query);
CREATE INDEX IF NOT EXISTS idx_search_queries_user_id ON search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON search_queries(created_at);
CREATE INDEX IF NOT EXISTS idx_search_queries_results_count ON search_queries(results_count);
CREATE INDEX IF NOT EXISTS idx_search_queries_query_trgm ON search_queries USING gin(query gin_trgm_ops);

-- Add new columns to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id);
ALTER TABLE books ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES categories(id);
ALTER TABLE books ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE books ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE books ADD COLUMN IF NOT EXISTS condition VARCHAR(20) DEFAULT 'new' CHECK (condition IN ('new', 'like_new', 'good', 'acceptable'));
ALTER TABLE books ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Update language enum to include new languages
ALTER TABLE books ALTER COLUMN language TYPE VARCHAR(10);
UPDATE books SET language = 'ar' WHERE language = 'arabic';
UPDATE books SET language = 'en' WHERE language = 'english';

-- Create new indexes for books
CREATE INDEX IF NOT EXISTS idx_books_category_id ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_subcategory_id ON books(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_books_view_count ON books(view_count);
CREATE INDEX IF NOT EXISTS idx_books_condition ON books(condition);
CREATE INDEX IF NOT EXISTS idx_books_tags ON books USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_books_search_vector ON books USING gin(search_vector);

-- Add governorate column to bookstores if not exists
ALTER TABLE bookstores ADD COLUMN IF NOT EXISTS governorate VARCHAR(50);

-- Create index for governorate
CREATE INDEX IF NOT EXISTS idx_bookstores_governorate ON bookstores(governorate);

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_book_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('arabic', COALESCE(NEW.title_arabic, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('arabic', COALESCE(NEW.author_arabic, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.author, '')), 'B') ||
        setweight(to_tsvector('arabic', COALESCE(NEW.description_arabic, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
        setweight(to_tsvector('arabic', COALESCE(NEW.publisher_arabic, '')), 'D') ||
        setweight(to_tsvector('english', COALESCE(NEW.publisher, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
DROP TRIGGER IF EXISTS trigger_update_book_search_vector ON books;
CREATE TRIGGER trigger_update_book_search_vector
    BEFORE INSERT OR UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_book_search_vector();

-- Update existing books' search vectors
UPDATE books SET search_vector = 
    setweight(to_tsvector('arabic', COALESCE(title_arabic, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('arabic', COALESCE(author_arabic, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(author, '')), 'B') ||
    setweight(to_tsvector('arabic', COALESCE(description_arabic, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'C') ||
    setweight(to_tsvector('arabic', COALESCE(publisher_arabic, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(publisher, '')), 'D')
WHERE search_vector IS NULL;

-- Create function to update book ratings
CREATE OR REPLACE FUNCTION update_book_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE books 
    SET 
        rating = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM book_reviews 
            WHERE book_id = COALESCE(NEW.book_id, OLD.book_id)
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM book_reviews 
            WHERE book_id = COALESCE(NEW.book_id, OLD.book_id)
        )
    WHERE id = COALESCE(NEW.book_id, OLD.book_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update book ratings
DROP TRIGGER IF EXISTS trigger_update_book_rating ON book_reviews;
CREATE TRIGGER trigger_update_book_rating
    AFTER INSERT OR UPDATE OR DELETE ON book_reviews
    FOR EACH ROW EXECUTE FUNCTION update_book_rating();

-- Insert default categories
INSERT INTO categories (name, name_ar, name_ku, description, sort_order) VALUES
('Literature', 'الأدب', 'ئەدەبیات', 'كتب الأدب والشعر والقصص', 1),
('Religion', 'الدين', 'ئایین', 'الكتب الدينية والإسلامية', 2),
('History', 'التاريخ', 'مێژوو', 'كتب التاريخ والحضارة', 3),
('Science', 'العلوم', 'زانست', 'الكتب العلمية والتقنية', 4),
('Education', 'التعليم', 'پەروەردە', 'الكتب التعليمية والأكاديمية', 5),
('Children', 'الأطفال', 'منداڵان', 'كتب الأطفال والناشئة', 6),
('Philosophy', 'الفلسفة', 'فەلسەفە', 'كتب الفلسفة والفكر', 7),
('Politics', 'السياسة', 'سیاسەت', 'الكتب السياسية والاجتماعية', 8),
('Economics', 'الاقتصاد', 'ئابووری', 'كتب الاقتصاد والمال', 9),
('Health', 'الصحة', 'تەندروستی', 'كتب الطب والصحة', 10)
ON CONFLICT DO NOTHING;

-- Insert subcategories for Literature
INSERT INTO categories (name, name_ar, name_ku, parent_id, sort_order) VALUES
('Poetry', 'الشعر', 'شیعر', (SELECT id FROM categories WHERE name = 'Literature'), 1),
('Novels', 'الروايات', 'ڕۆمان', (SELECT id FROM categories WHERE name = 'Literature'), 2),
('Short Stories', 'القصص القصيرة', 'چیرۆکی کورت', (SELECT id FROM categories WHERE name = 'Literature'), 3),
('Drama', 'المسرح', 'شانۆ', (SELECT id FROM categories WHERE name = 'Literature'), 4)
ON CONFLICT DO NOTHING;

-- Insert subcategories for Science
INSERT INTO categories (name, name_ar, name_ku, parent_id, sort_order) VALUES
('Mathematics', 'الرياضيات', 'بیرکاری', (SELECT id FROM categories WHERE name = 'Science'), 1),
('Physics', 'الفيزياء', 'فیزیا', (SELECT id FROM categories WHERE name = 'Science'), 2),
('Chemistry', 'الكيمياء', 'کیمیا', (SELECT id FROM categories WHERE name = 'Science'), 3),
('Biology', 'الأحياء', 'زیندەوەرزانی', (SELECT id FROM categories WHERE name = 'Science'), 4),
('Computer Science', 'علوم الحاسوب', 'زانستی کۆمپیوتەر', (SELECT id FROM categories WHERE name = 'Science'), 5)
ON CONFLICT DO NOTHING;

-- Create daily analytics table for performance tracking
CREATE TABLE IF NOT EXISTS daily_analytics (
    id SERIAL PRIMARY KEY,
    bookstore_id INTEGER NOT NULL REFERENCES bookstores(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    avg_order_value DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(bookstore_id, date)
);

-- Create indexes for daily analytics
CREATE INDEX IF NOT EXISTS idx_daily_analytics_bookstore_id ON daily_analytics(bookstore_id);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON daily_analytics(date);

-- Create view for popular books
CREATE OR REPLACE VIEW popular_books AS
SELECT 
    b.*,
    bs.name as bookstore_name,
    bs.name_arabic as bookstore_name_arabic,
    c.name_ar as category_name,
    COALESCE(sales.total_sold, 0) as total_sold,
    COALESCE(sales.total_revenue, 0) as total_revenue
FROM books b
LEFT JOIN bookstores bs ON b.bookstore_id = bs.id
LEFT JOIN categories c ON b.category_id = c.id
LEFT JOIN (
    SELECT 
        oi.book_id,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.price) as total_revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'completed'
        AND o.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY oi.book_id
) sales ON b.id = sales.book_id
WHERE b.is_active = true
    AND bs.is_active = true
    AND bs.is_approved = true
ORDER BY COALESCE(sales.total_sold, 0) DESC, b.view_count DESC;

-- Create view for bookstore statistics
CREATE OR REPLACE VIEW bookstore_stats AS
SELECT 
    bs.id,
    bs.name,
    bs.name_arabic,
    bs.governorate,
    COUNT(DISTINCT b.id) as total_books,
    COUNT(DISTINCT CASE WHEN b.is_active = true THEN b.id END) as active_books,
    COALESCE(AVG(br.rating), 0) as avg_rating,
    COUNT(DISTINCT br.id) as total_reviews,
    COALESCE(sales.total_revenue, 0) as total_revenue,
    COALESCE(sales.total_orders, 0) as total_orders
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
GROUP BY bs.id, bs.name, bs.name_arabic, bs.governorate, sales.total_revenue, sales.total_orders;

-- Create function to get search suggestions
CREATE OR REPLACE FUNCTION get_search_suggestions(search_term TEXT, suggestion_limit INTEGER DEFAULT 10)
RETURNS TABLE(
    suggestion TEXT,
    suggestion_type VARCHAR(20),
    relevance_score REAL
) AS $$
BEGIN
    RETURN QUERY
    (
        -- Book titles
        SELECT DISTINCT
            COALESCE(b.title_arabic, b.title) as suggestion,
            'book'::VARCHAR(20) as suggestion_type,
            similarity(search_term, COALESCE(b.title_arabic, b.title)) as relevance_score
        FROM books b
        WHERE b.is_active = true
            AND (
                b.title_arabic % search_term 
                OR b.title % search_term
                OR b.title_arabic ILIKE '%' || search_term || '%'
                OR b.title ILIKE '%' || search_term || '%'
            )
        ORDER BY relevance_score DESC
        LIMIT suggestion_limit / 3
    )
    UNION ALL
    (
        -- Authors
        SELECT DISTINCT
            COALESCE(b.author_arabic, b.author) as suggestion,
            'author'::VARCHAR(20) as suggestion_type,
            similarity(search_term, COALESCE(b.author_arabic, b.author)) as relevance_score
        FROM books b
        WHERE b.is_active = true
            AND (
                b.author_arabic % search_term 
                OR b.author % search_term
                OR b.author_arabic ILIKE '%' || search_term || '%'
                OR b.author ILIKE '%' || search_term || '%'
            )
        ORDER BY relevance_score DESC
        LIMIT suggestion_limit / 3
    )
    UNION ALL
    (
        -- Categories
        SELECT DISTINCT
            c.name_ar as suggestion,
            'category'::VARCHAR(20) as suggestion_type,
            similarity(search_term, c.name_ar) as relevance_score
        FROM categories c
        WHERE c.is_active = true
            AND (
                c.name_ar % search_term 
                OR c.name % search_term
                OR c.name_ar ILIKE '%' || search_term || '%'
                OR c.name ILIKE '%' || search_term || '%'
            )
        ORDER BY relevance_score DESC
        LIMIT suggestion_limit / 3
    )
    ORDER BY relevance_score DESC
    LIMIT suggestion_limit;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_title_trgm ON books USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_title_arabic_trgm ON books USING gin(title_arabic gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_author_trgm ON books USING gin(author gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_author_arabic_trgm ON books USING gin(author_arabic gin_trgm_ops);

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_book_reviews_updated_at BEFORE UPDATE ON book_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- Create completion log
INSERT INTO schema_migrations (version, applied_at) VALUES ('002-stage2-enhancements', NOW())
ON CONFLICT (version) DO UPDATE SET applied_at = NOW();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'المتنبي Stage 2 database enhancements applied successfully!';
    RAISE NOTICE 'Enhanced features: Categories, Reviews, Wishlists, Search Analytics, Performance Optimizations';
END $$;
