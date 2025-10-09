const { sequelize } = require('./server/config/database');

async function createRatingTables() {
  try {
    console.log('🔄 Creating library rating tables...');
    
    // Create library_reviews table
    await sequelize.query(`
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
    `);
    
    console.log('✅ library_reviews table created');
    
    // Add rating columns to bookstores table
    await sequelize.query(`
      ALTER TABLE bookstores 
      ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
    `);
    
    console.log('✅ Rating columns added to bookstores table');
    
    // Create indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_library_reviews_bookstore_id ON library_reviews(bookstore_id);
      CREATE INDEX IF NOT EXISTS idx_library_reviews_user_id ON library_reviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_library_reviews_rating ON library_reviews(rating);
      CREATE INDEX IF NOT EXISTS idx_library_reviews_created_at ON library_reviews(created_at);
      CREATE INDEX IF NOT EXISTS idx_bookstores_rating ON bookstores(rating);
      CREATE INDEX IF NOT EXISTS idx_bookstores_total_reviews ON bookstores(total_reviews);
    `);
    
    console.log('✅ Indexes created');
    
    // Create trigger function
    await sequelize.query(`
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
    `);
    
    console.log('✅ Trigger function created');
    
    // Create trigger
    await sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_update_library_rating ON library_reviews;
      CREATE TRIGGER trigger_update_library_rating
          AFTER INSERT OR UPDATE OR DELETE ON library_reviews
          FOR EACH ROW EXECUTE FUNCTION update_library_rating();
    `);
    
    console.log('✅ Trigger created');
    
    console.log('🎉 Library rating system is now active!');
    console.log('📊 Features available:');
    console.log('   - Users can rate libraries (1-5 stars)');
    console.log('   - Library ratings are automatically calculated');
    console.log('   - Ratings appear in dashboard and admin panels');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.original) {
      console.error('Database error:', error.original.message);
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

createRatingTables();
