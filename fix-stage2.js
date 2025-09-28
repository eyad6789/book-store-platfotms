// Simple fix script for Stage 2
const { sequelize } = require('./server/config/database');

async function fixStage2() {
  try {
    console.log('🔧 Fixing Stage 2 setup...\n');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.\n');

    // 1. Create categories table
    console.log('📚 Creating categories table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255) NOT NULL,
        description TEXT,
        parent_id INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `).then(() => console.log('✅ Categories table ready'));

    // 2. Create payment_methods table
    console.log('💳 Creating payment methods table...');
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
      )
    `).then(() => console.log('✅ Payment methods table ready'));

    // 3. Create book_reviews table
    console.log('⭐ Creating book reviews table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS book_reviews (
        id SERIAL PRIMARY KEY,
        book_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        is_verified_purchase BOOLEAN DEFAULT false,
        helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `).then(() => console.log('✅ Book reviews table ready'));

    // 4. Add basic categories
    console.log('\n📂 Adding basic categories...');
    await sequelize.query(`
      INSERT INTO categories (name, name_ar, description) VALUES
      ('Literature', 'الأدب', 'Classic and contemporary literature'),
      ('History', 'التاريخ', 'Historical books'),
      ('Religion', 'الدين', 'Religious books'),
      ('Science', 'العلوم', 'Scientific books'),
      ('Philosophy', 'الفلسفة', 'Philosophy books'),
      ('Poetry', 'الشعر', 'Poetry collections'),
      ('Children', 'الأطفال', 'Children books'),
      ('Education', 'التعليم', 'Educational books')
      ON CONFLICT DO NOTHING
    `).then(() => console.log('✅ Categories added'));

    // 5. Add payment methods
    console.log('💰 Adding payment methods...');
    await sequelize.query(`
      INSERT INTO payment_methods (name, name_ar, code, requires_details, description) VALUES
      ('Cash on Delivery', 'الدفع عند التسليم', 'cash_on_delivery', false, 'Pay when you receive'),
      ('Bank Transfer', 'التحويل البنكي', 'bank_transfer', true, 'Bank transfer'),
      ('Credit Card', 'بطاقة ائتمان', 'credit_card', true, 'Credit card via Stripe'),
      ('Mobile Wallet', 'المحفظة الإلكترونية', 'mobile_wallet', true, 'Mobile wallet')
      ON CONFLICT DO NOTHING
    `).then(() => console.log('✅ Payment methods added'));

    // 6. Try to add columns to existing tables (ignore errors if they exist)
    console.log('\n🔧 Updating existing tables...');
    
    const updates = [
      "ALTER TABLE books ADD COLUMN IF NOT EXISTS category_id INTEGER",
      "ALTER TABLE books ADD COLUMN IF NOT EXISTS publisher VARCHAR(255)",
      "ALTER TABLE books ADD COLUMN IF NOT EXISTS publication_year INTEGER",
      "ALTER TABLE books ADD COLUMN IF NOT EXISTS page_count INTEGER",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method_id INTEGER",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending'",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255)"
    ];

    for (const sql of updates) {
      try {
        await sequelize.query(sql);
        console.log(`✅ ${sql.substring(0, 50)}...`);
      } catch (err) {
        // Column might already exist, that's ok
      }
    }

    console.log('\n========================================');
    console.log('✅ Stage 2 setup completed successfully!');
    console.log('========================================\n');
    console.log('New features available:');
    console.log('- Categories system');
    console.log('- Payment methods');
    console.log('- Book reviews table');
    console.log('- Enhanced database schema\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nPlease make sure:');
    console.error('1. PostgreSQL is running');
    console.error('2. Database "almutanabbi" exists');
    console.error('3. Check your .env file settings');
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Run the fix
fixStage2();
