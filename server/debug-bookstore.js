const { sequelize } = require('./config/database');
const { User, Bookstore, Book } = require('./models');

async function debugBookstore() {
  try {
    console.log('🔍 Testing bookstore query...');
    
    // Test 1: Check if models are properly loaded
    console.log('Models loaded:', {
      User: !!User,
      Bookstore: !!Bookstore,
      Book: !!Book
    });
    
    // Test 2: Simple query without includes
    console.log('\n📋 Testing simple bookstore query...');
    const simpleBookstore = await Bookstore.findOne({
      where: { owner_id: 2 }
    });
    console.log('Simple query result:', simpleBookstore ? 'Found' : 'Not found');
    
    // Test 3: Query with User include
    console.log('\n👤 Testing bookstore query with User include...');
    const bookstoreWithUser = await Bookstore.findOne({
      where: { owner_id: 2 },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });
    console.log('Query with User include result:', bookstoreWithUser ? 'Found' : 'Not found');
    
    if (bookstoreWithUser) {
      console.log('Bookstore data:', {
        id: bookstoreWithUser.id,
        name: bookstoreWithUser.name,
        owner: bookstoreWithUser.owner ? bookstoreWithUser.owner.full_name : 'No owner'
      });
    }
    
    // Test 4: Book count query
    if (bookstoreWithUser) {
      console.log('\n📚 Testing book count query...');
      const bookCount = await Book.count({
        where: { 
          bookstore_id: bookstoreWithUser.id,
          is_active: true 
        }
      });
      console.log('Book count:', bookCount);
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during testing:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

debugBookstore();
