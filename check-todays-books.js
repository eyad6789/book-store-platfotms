const { LibraryBook, Bookstore, User } = require('./server/models');
const { Op } = require('sequelize');

async function checkTodaysBooks() {
  try {
    console.log('🔍 Checking books from the last 24 hours...\n');
    
    // Get books from last 24 hours
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    
    const recentBooks = await LibraryBook.findAll({
      where: {
        created_at: { [Op.gte]: yesterday }
      },
      include: [{ 
        model: Bookstore, 
        as: 'bookstore', 
        attributes: ['id', 'name', 'name_arabic'],
        include: [{
          model: User,
          as: 'owner',
          attributes: ['full_name', 'email']
        }]
      }],
      order: [['created_at', 'DESC']]
    });
    
    console.log(`📚 Found ${recentBooks.length} books from last 24 hours:\n`);
    
    if (recentBooks.length === 0) {
      console.log('❌ No books found from the last 24 hours.');
      console.log('\n🤔 This suggests the books might not be getting saved to the database.');
      console.log('   Possible causes:');
      console.log('   1. Form submission errors');
      console.log('   2. API endpoint issues');
      console.log('   3. Authentication problems');
      console.log('   4. Database connection issues');
    } else {
      recentBooks.forEach((book, i) => {
        console.log(`${i+1}. 📖 "${book.title_ar || book.title}"`);
        console.log(`   📊 Status: ${book.status}`);
        console.log(`   🏪 Bookstore: ${book.bookstore?.name_arabic || book.bookstore?.name}`);
        console.log(`   👤 Owner: ${book.bookstore?.owner?.full_name} (${book.bookstore?.owner?.email})`);
        console.log(`   🖼️ Image: ${book.cover_image_url ? 'Yes' : 'No'}`);
        console.log(`   💰 Price: ${book.price} د.ع`);
        console.log(`   📅 Created: ${book.created_at}`);
        console.log('   ---\n');
      });
    }
    
    // Also check all pending books regardless of date
    const allPendingBooks = await LibraryBook.findAll({
      where: { status: 'pending' },
      include: [{ 
        model: Bookstore, 
        as: 'bookstore', 
        attributes: ['name', 'name_arabic']
      }],
      order: [['created_at', 'DESC']]
    });
    
    console.log(`⏳ Total pending books (all time): ${allPendingBooks.length}`);
    if (allPendingBooks.length > 0) {
      console.log('📋 Pending books needing admin approval:');
      allPendingBooks.forEach((book, i) => {
        console.log(`   ${i+1}. "${book.title_ar || book.title}" - ${book.bookstore?.name_arabic} (${book.created_at})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
  
  process.exit(0);
}

checkTodaysBooks();
