const { sequelize } = require('../config/database');

async function fixBookstoreSchema() {
  try {
    console.log('🔄 Starting bookstore schema fix...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Add missing columns to bookstores table
    const bookstoreColumns = [
      'ALTER TABLE bookstores ADD COLUMN IF NOT EXISTS governorate VARCHAR(50);',
      'ALTER TABLE bookstores ADD COLUMN IF NOT EXISTS address_arabic TEXT;',
      'ALTER TABLE bookstores ADD COLUMN IF NOT EXISTS description_arabic TEXT;',
      'ALTER TABLE bookstores ADD COLUMN IF NOT EXISTS name_arabic VARCHAR(255);'
    ];

    for (const sql of bookstoreColumns) {
      try {
        await sequelize.query(sql);
        console.log(`✅ Added column: ${sql.split(' ')[5]}`);
      } catch (error) {
        console.log(`Column might already exist: ${error.message}`);
      }
    }

    // Add missing columns to books table for Stage 2
    const bookColumns = [
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS condition VARCHAR(20) DEFAULT \'new\';',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES categories(id);',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS search_vector tsvector;'
    ];

    for (const sql of bookColumns) {
      try {
        await sequelize.query(sql);
        console.log(`✅ Added book column: ${sql.split(' ')[5]}`);
      } catch (error) {
        console.log(`Book column might already exist: ${error.message}`);
      }
    }

    // Create wishlists table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, book_id)
      );
    `);
    console.log('✅ Wishlists table created/verified.');

    // Create search_queries table if it doesn't exist
    await sequelize.query(`
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
    `);
    console.log('✅ Search queries table created/verified.');

    // Create additional indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_bookstores_governorate ON bookstores(governorate);',
      'CREATE INDEX IF NOT EXISTS idx_books_view_count ON books(view_count);',
      'CREATE INDEX IF NOT EXISTS idx_books_condition ON books(condition);',
      'CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_wishlists_book_id ON wishlists(book_id);',
      'CREATE INDEX IF NOT EXISTS idx_search_queries_query ON search_queries(query);',
      'CREATE INDEX IF NOT EXISTS idx_search_queries_user_id ON search_queries(user_id);'
    ];

    for (const sql of indexes) {
      try {
        await sequelize.query(sql);
        console.log(`✅ Created index: ${sql.split(' ')[5]}`);
      } catch (error) {
        console.log(`Index might already exist: ${error.message}`);
      }
    }

    // Update existing bookstores with sample data
    await sequelize.query(`
      UPDATE bookstores 
      SET 
        governorate = CASE 
          WHEN id % 8 = 0 THEN 'بغداد'
          WHEN id % 8 = 1 THEN 'البصرة'
          WHEN id % 8 = 2 THEN 'أربيل'
          WHEN id % 8 = 3 THEN 'النجف'
          WHEN id % 8 = 4 THEN 'الموصل'
          WHEN id % 8 = 5 THEN 'كربلاء'
          WHEN id % 8 = 6 THEN 'كركوك'
          ELSE 'الأنبار'
        END,
        name_arabic = COALESCE(name_arabic, name),
        description_arabic = COALESCE(description_arabic, description),
        address_arabic = COALESCE(address_arabic, address)
      WHERE governorate IS NULL OR name_arabic IS NULL;
    `);
    console.log('✅ Updated existing bookstores with sample data.');

    console.log('✅ Bookstore schema fix completed successfully!');

  } catch (error) {
    console.error('❌ Bookstore schema fix failed:', error);
    throw error;
  }
}

// Run fix if called directly
if (require.main === module) {
  fixBookstoreSchema()
    .then(() => {
      console.log('🎉 Bookstore schema fix process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Bookstore schema fix process failed:', error);
      process.exit(1);
    });
}

module.exports = { fixBookstoreSchema };
