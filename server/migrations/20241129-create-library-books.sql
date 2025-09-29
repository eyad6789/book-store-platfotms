-- Library books management table
CREATE TABLE library_books (
    id SERIAL PRIMARY KEY,
    bookstore_id INTEGER REFERENCES bookstores(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    title_ar VARCHAR(500) NOT NULL,
    author VARCHAR(255) NOT NULL,
    author_ar VARCHAR(255),
    isbn VARCHAR(20) UNIQUE,
    description TEXT,
    description_ar TEXT,
    category_id INTEGER REFERENCES categories(id),
    publisher VARCHAR(255),
    publication_year INTEGER,
    language VARCHAR(10) DEFAULT 'ar',
    page_count INTEGER,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    cover_image_url TEXT,
    condition VARCHAR(50) DEFAULT 'new', -- new, like_new, good, acceptable
    is_shared BOOLEAN DEFAULT false, -- Book sharing feature
    shared_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, active, inactive
    rejection_reason TEXT,
    views_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP
);

-- Book sharing history table
CREATE TABLE book_shares (
    id SERIAL PRIMARY KEY,
    library_book_id INTEGER REFERENCES library_books(id) ON DELETE CASCADE,
    shared_by INTEGER REFERENCES users(id),
    share_type VARCHAR(50) DEFAULT 'public', -- public, featured, promotional
    share_message TEXT,
    share_duration_days INTEGER DEFAULT 30,
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Library performance metrics table
CREATE TABLE library_metrics (
    id SERIAL PRIMARY KEY,
    bookstore_id INTEGER REFERENCES bookstores(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    total_views INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    avg_order_value DECIMAL(10, 2) DEFAULT 0,
    conversion_rate DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(bookstore_id, metric_date)
);

-- User activity tracking table
CREATE TABLE user_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- view, search, add_to_cart, purchase, review, share
    entity_type VARCHAR(50), -- book, bookstore, category
    entity_id INTEGER,
    metadata JSONB, -- Additional context
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_library_books_bookstore ON library_books(bookstore_id, status);
CREATE INDEX idx_library_books_category ON library_books(category_id);
CREATE INDEX idx_library_books_status ON library_books(status);
CREATE INDEX idx_book_shares_book ON book_shares(library_book_id);
CREATE INDEX idx_library_metrics_date ON library_metrics(bookstore_id, metric_date);
CREATE INDEX idx_user_activities_user ON user_activities(user_id, created_at);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type, created_at);
CREATE INDEX idx_user_activities_entity ON user_activities(entity_type, entity_id);
