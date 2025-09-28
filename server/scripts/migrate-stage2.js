const { sequelize } = require('../config/database');

async function migrateStage2() {
  try {
    console.log('🔄 Starting Stage 2 database migration...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Run migrations by syncing models
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema updated successfully.');

    // Create categories table manually if needed
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255) NOT NULL,
        description TEXT,
        parent_id INTEGER REFERENCES categories(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create book_reviews table manually if needed
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS book_reviews (
        id SERIAL PRIMARY KEY,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        is_verified_purchase BOOLEAN DEFAULT false,
        helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(book_id, user_id)
      );
    `);

    // Create payment_methods table manually if needed
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        name_ar VARCHAR(100) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        requires_details BOOLEAN DEFAULT false,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Add new columns to books table if they don't exist
    const bookColumns = [
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id);',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS publisher VARCHAR(255);',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS publication_year INTEGER;',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS page_count INTEGER;',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS isbn VARCHAR(20) UNIQUE;',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS tags TEXT;'
    ];

    for (const sql of bookColumns) {
      try {
        await sequelize.query(sql);
      } catch (error) {
        // Column might already exist, continue
        console.log(`Column might already exist: ${error.message}`);
      }
    }

    // Add new columns to orders table if they don't exist
    const orderColumns = [
      'ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method_id INTEGER REFERENCES payment_methods(id);',
      'ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT \'pending\';',
      'ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_details JSONB;',
      'ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);'
    ];

    for (const sql of orderColumns) {
      try {
        await sequelize.query(sql);
      } catch (error) {
        // Column might already exist, continue
        console.log(`Column might already exist: ${error.message}`);
      }
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_books_category_id ON books(category_id);',
      'CREATE INDEX IF NOT EXISTS idx_books_rating ON books(rating);',
      'CREATE INDEX IF NOT EXISTS idx_books_language ON books(language);',
      'CREATE INDEX IF NOT EXISTS idx_book_reviews_book_id ON book_reviews(book_id);',
      'CREATE INDEX IF NOT EXISTS idx_book_reviews_user_id ON book_reviews(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);'
    ];

    for (const sql of indexes) {
      try {
        await sequelize.query(sql);
      } catch (error) {
        // Index might already exist, continue
        console.log(`Index might already exist: ${error.message}`);
      }
    }

    console.log('✅ Stage 2 migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateStage2()
    .then(() => {
      console.log('🎉 Migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateStage2 };
