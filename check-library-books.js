// Quick script to check library books in database
const { LibraryBook, Bookstore } = require('./server/models');

async function checkLibraryBooks() {
  try {
    console.log('🔍 Checking ALL library books in database...\n');
    
    // Check total library books
    const totalBooks = await LibraryBook.count();
    console.log(`📚 Total library books: ${totalBooks}`);
    
    // Check by status
    const pendingBooks = await LibraryBook.count({ where: { status: 'pending' } });
    const approvedBooks = await LibraryBook.count({ where: { status: 'approved' } });
    const rejectedBooks = await LibraryBook.count({ where: { status: 'rejected' } });
    
    console.log(`⏳ Pending books: ${pendingBooks}`);
    console.log(`✅ Approved books: ${approvedBooks}`);
    console.log(`❌ Rejected books: ${rejectedBooks}`);
    
    // Show ALL books with details
    console.log('\n📋 ALL LIBRARY BOOKS:');
    const allBooks = await LibraryBook.findAll({
      include: [{ 
        model: Bookstore, 
        as: 'bookstore', 
        attributes: ['id', 'name', 'name_arabic'],
        include: [{
          model: require('./server/models').User,
          as: 'owner',
          attributes: ['id', 'full_name', 'email']
        }]
      }],
      order: [['created_at', 'DESC']]
    });
    
    allBooks.forEach((book, index) => {
      console.log(`\n${index + 1}. 📖 "${book.title_ar || book.title}"`);
      console.log(`   📊 Status: ${book.status}`);
      console.log(`   🏪 Bookstore: ${book.bookstore?.name_arabic || book.bookstore?.name} (ID: ${book.bookstore?.id})`);
      console.log(`   👤 Owner: ${book.bookstore?.owner?.full_name} (${book.bookstore?.owner?.email})`);
      console.log(`   🖼️ Image: ${book.cover_image_url || 'No image'}`);
      console.log(`   💰 Price: ${book.price || 'No price'} د.ع`);
      console.log(`   📅 Created: ${book.created_at}`);
      if (book.approved_at) {
        console.log(`   ✅ Approved: ${book.approved_at}`);
      }
    });
    
    console.log('\n✅ Detailed check completed!');
    
  } catch (error) {
    console.error('❌ Error checking library books:', error.message);
    console.error('Full error:', error);
  }
  
  process.exit(0);
}

checkLibraryBooks();
