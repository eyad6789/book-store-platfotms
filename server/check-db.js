// Check database connection and status
const { sequelize } = require('./config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...\n');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    console.log(`🏠 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`👤 User: ${process.env.DB_USER}\n`);

    // Check existing tables
    console.log('📋 Checking existing tables...');
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    if (results.length > 0) {
      console.log('✅ Found tables:');
      results.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No tables found in database');
    }

    // Check if we have basic data
    console.log('\n📊 Checking data...');
    
    try {
      const [users] = await sequelize.query('SELECT COUNT(*) as count FROM users');
      console.log(`👥 Users: ${users[0].count}`);
    } catch (e) {
      console.log('⚠️  Users table not accessible');
    }

    try {
      const [books] = await sequelize.query('SELECT COUNT(*) as count FROM books');
      console.log(`📚 Books: ${books[0].count}`);
    } catch (e) {
      console.log('⚠️  Books table not accessible');
    }

    try {
      const [bookstores] = await sequelize.query('SELECT COUNT(*) as count FROM bookstores');
      console.log(`🏪 Bookstores: ${bookstores[0].count}`);
    } catch (e) {
      console.log('⚠️  Bookstores table not accessible');
    }

  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.log('\n🔧 Possible solutions:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check if database "almutanabbi" exists');
    console.log('3. Verify username/password in .env file');
    console.log('4. Check if PostgreSQL is listening on port 5432');
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkDatabase();
