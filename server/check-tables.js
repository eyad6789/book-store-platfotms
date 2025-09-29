const { sequelize } = require('./config/database');

async function checkTables() {
  try {
    console.log('🔍 Checking existing tables...');
    
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 Existing tables:');
    results.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check if our new tables exist
    const newTables = ['library_books', 'book_shares', 'library_metrics', 'user_activities'];
    const existingTableNames = results.map(row => row.table_name);
    
    console.log('\n🆕 New tables status:');
    newTables.forEach(tableName => {
      const exists = existingTableNames.includes(tableName);
      console.log(`  - ${tableName}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
    process.exit(1);
  }
}

checkTables();
