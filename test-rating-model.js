const { sequelize } = require('./server/config/database');
const { LibraryReview, User, Bookstore } = require('./server/models');

async function testRatingModel() {
  try {
    console.log('🧪 Testing LibraryReview model...');
    
    // Test 1: Check if LibraryReview model exists
    console.log('1. LibraryReview model:', LibraryReview ? '✅ Exists' : '❌ Missing');
    
    // Test 2: Check if table exists
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    const hasLibraryReviewsTable = tableExists.includes('library_reviews');
    console.log('2. library_reviews table:', hasLibraryReviewsTable ? '✅ Exists' : '❌ Missing');
    
    // Test 3: Try to count reviews
    if (hasLibraryReviewsTable) {
      const count = await LibraryReview.count();
      console.log('3. Total reviews in database:', count);
    }
    
    // Test 4: Check if we can find a bookstore
    const bookstore = await Bookstore.findOne();
    console.log('4. Sample bookstore found:', bookstore ? `✅ ID: ${bookstore.id}` : '❌ No bookstores');
    
    if (bookstore) {
      // Test 5: Try to get rating stats for this bookstore
      console.log('5. Testing rating stats query...');
      
      const stats = await Bookstore.findByPk(bookstore.id, {
        attributes: ['id', 'name', 'rating', 'total_reviews']
      });
      
      console.log('   Bookstore stats:', {
        id: stats.id,
        name: stats.name,
        rating: stats.rating,
        total_reviews: stats.total_reviews
      });
    }
    
    console.log('\n✅ Model test completed successfully!');
    
  } catch (error) {
    console.error('❌ Model test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testRatingModel();
