// Quick fix for database issues
const { sequelize } = require('./config/database');

async function quickFix() {
  try {
    console.log('🔧 Quick fix for database...\n');

    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Add missing columns
    const fixes = [
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS category_id INTEGER',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS publisher VARCHAR(255)',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS publication_year INTEGER',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS page_count INTEGER',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS tags TEXT',
      
      // Create categories table
      `CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255) NOT NULL,
        description TEXT,
        parent_id INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      // Create payment_methods table
      `CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        name_ar VARCHAR(100) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        requires_details BOOLEAN DEFAULT false,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      // Insert basic data
      `INSERT INTO categories (name, name_ar, description) VALUES
       ('Literature', 'الأدب', 'Literature books'),
       ('History', 'التاريخ', 'History books'),
       ('Science', 'العلوم', 'Science books')
       ON CONFLICT DO NOTHING`,
       
      `INSERT INTO payment_methods (name, name_ar, code, requires_details) VALUES
       ('Cash on Delivery', 'الدفع عند التسليم', 'cash_on_delivery', false),
       ('Bank Transfer', 'التحويل البنكي', 'bank_transfer', true)
       ON CONFLICT DO NOTHING`
    ];

    for (const sql of fixes) {
      try {
        await sequelize.query(sql);
        console.log(`✅ Fixed: ${sql.substring(0, 50)}...`);
      } catch (error) {
        console.log(`⚠️  ${sql.substring(0, 50)}... - ${error.message}`);
      }
    }

    console.log('\n✅ Quick fix completed!');
    console.log('Now try: npm start');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

quickFix();
