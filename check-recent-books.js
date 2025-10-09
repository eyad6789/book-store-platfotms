const { LibraryBook, Bookstore, User } = require('./server/models');

async function checkRecentBooks() {
  try {
    console.log('🔍 Checking recent library books...\n');
    
    const recentBooks = await LibraryBook.findAll({
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
      order: [['created_at', 'DESC']],
      limit: 15
    });
    
    console.log(`Found ${recentBooks.length} books:\n`);
    
    recentBooks.forEach((book, i) => {
      console.log(`${i+1}. 📖 "${book.title_ar || book.title}"`);
      console.log(`   Status: ${book.status}`);
      console.log(`   Bookstore: ${book.bookstore?.name_arabic || book.bookstore?.name}`);
      console.log(`   Owner: ${book.bookstore?.owner?.full_name}`);
      console.log(`   Created: ${book.created_at}`);
      console.log(`   Image: ${book.cover_image_url ? 'Yes' : 'No'}`);
      console.log('   ---');
    });
    
    // Check pending books specifically
    const pendingBooks = await LibraryBook.findAll({
      where: { status: 'pending' },
      include: [{ model: Bookstore, as: 'bookstore' }]
    });
    
    console.log(`\n⏳ Pending books needing approval: ${pendingBooks.length}`);
    pendingBooks.forEach((book, i) => {
      console.log(`${i+1}. "${book.title_ar || book.title}" - ${book.bookstore?.name_arabic}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

checkRecentBooks();
