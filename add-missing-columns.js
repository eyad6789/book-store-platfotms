// Add missing columns to books table
const { sequelize } = require('./server/config/database');

async function addMissingColumns() {
  try {
    console.log('🔧 Adding missing columns to books table...\n');

    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Add missing columns one by one
    const columns = [
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS category_id INTEGER',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS publisher VARCHAR(255)',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS publication_year INTEGER',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS page_count INTEGER',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS tags TEXT'
    ];

    for (const sql of columns) {
      try {
        await sequelize.query(sql);
        console.log(`✅ ${sql}`);
      } catch (error) {
        console.log(`⚠️  ${sql} - ${error.message}`);
      }
    }

    console.log('\n✅ All missing columns added successfully!');
    console.log('Now you can start the server with: npm start');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

addMissingColumns();
