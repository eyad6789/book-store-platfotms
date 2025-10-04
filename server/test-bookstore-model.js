const { Bookstore, User } = require('./models');

async function testBookstoreModel() {
  try {
    console.log('🧪 Testing Bookstore model directly...');
    
    // Test 1: Simple findAll
    console.log('Test 1: Simple findAll');
    const allBookstores = await Bookstore.findAll({ limit: 1 });
    console.log('✅ findAll successful, count:', allBookstores.length);
    
    // Test 2: Simple findOne with where clause
    console.log('\nTest 2: Simple findOne with where clause');
    const bookstore = await Bookstore.findOne({
      where: { owner_id: 2 }
    });
    console.log('✅ findOne successful:', bookstore ? bookstore.name : 'Not found');
    
    // Test 3: Raw query
    console.log('\nTest 3: Raw query');
    const { sequelize } = require('./config/database');
    const [results] = await sequelize.query('SELECT id, name FROM bookstores WHERE owner_id = 2 LIMIT 1');
    console.log('✅ Raw query successful:', results.length > 0 ? results[0].name : 'Not found');
    
    console.log('\n✅ All model tests passed!');
    
  } catch (error) {
    console.error('❌ Model test failed:');
    console.error('Message:', error.message);
    console.error('SQL:', error.sql);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

testBookstoreModel();
