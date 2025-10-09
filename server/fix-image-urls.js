const { sequelize } = require('./config/database');
const { LibraryBook, Book, Bookstore, User } = require('./models');

async function fixImageUrls() {
  try {
    console.log('🔧 Starting image URL cleanup...\n');
    
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    // Fix LibraryBook cover images with external URLs
    const libraryBooksWithBadUrls = await LibraryBook.findAll({
      where: {
        cover_image_url: {
          [sequelize.Sequelize.Op.or]: [
            { [sequelize.Sequelize.Op.like]: '%cloudfront%' },
            { [sequelize.Sequelize.Op.like]: '%amazonaws%' },
            { [sequelize.Sequelize.Op.like]: 'http%' }
          ]
        }
      }
    });
    
    console.log(`📚 Found ${libraryBooksWithBadUrls.length} library books with external image URLs`);
    
    for (const book of libraryBooksWithBadUrls) {
      console.log(`   Clearing: ${book.title_ar || book.title} (ID: ${book.id})`);
      await book.update({ cover_image_url: null });
    }
    
    // Fix Book cover images with external URLs
    const booksWithBadUrls = await Book.findAll({
      where: {
        image_url: {
          [sequelize.Sequelize.Op.or]: [
            { [sequelize.Sequelize.Op.like]: '%cloudfront%' },
            { [sequelize.Sequelize.Op.like]: '%amazonaws%' },
            { [sequelize.Sequelize.Op.like]: 'http%' }
          ]
        }
      }
    });
    
    console.log(`\n📖 Found ${booksWithBadUrls.length} books with external image URLs`);
    
    for (const book of booksWithBadUrls) {
      console.log(`   Clearing: ${book.title_arabic || book.title} (ID: ${book.id})`);
      await book.update({ image_url: null });
    }
    
    // Fix Bookstore logos with external URLs  
    const bookstoresWithBadUrls = await Bookstore.findAll({
      where: {
        logo_url: {
          [sequelize.Sequelize.Op.or]: [
            { [sequelize.Sequelize.Op.like]: '%cloudfront%' },
            { [sequelize.Sequelize.Op.like]: '%amazonaws%' },
            { [sequelize.Sequelize.Op.like]: 'http%' }
          ]
        }
      }
    });
    
    console.log(`\n🏪 Found ${bookstoresWithBadUrls.length} bookstores with external logo URLs`);
    
    for (const bookstore of bookstoresWithBadUrls) {
      console.log(`   Clearing: ${bookstore.name} (ID: ${bookstore.id})`);
      await bookstore.update({ logo_url: null });
    }
    
    // Fix User avatars with external URLs
    const usersWithBadUrls = await User.findAll({
      where: {
        avatar_url: {
          [sequelize.Sequelize.Op.or]: [
            { [sequelize.Sequelize.Op.like]: '%cloudfront%' },
            { [sequelize.Sequelize.Op.like]: '%amazonaws%' },
            { [sequelize.Sequelize.Op.like]: 'http%' }
          ]
        }
      }
    });
    
    console.log(`\n👤 Found ${usersWithBadUrls.length} users with external avatar URLs`);
    
    for (const user of usersWithBadUrls) {
      console.log(`   Clearing: ${user.full_name} (ID: ${user.id})`);
      await user.update({ avatar_url: null });
    }
    
    console.log('\n✅ Image URL cleanup completed!');
    console.log('\n📝 Summary:');
    console.log(`   - Library Books cleaned: ${libraryBooksWithBadUrls.length}`);
    console.log(`   - Books cleaned: ${booksWithBadUrls.length}`);
    console.log(`   - Bookstores cleaned: ${bookstoresWithBadUrls.length}`);
    console.log(`   - Users cleaned: ${usersWithBadUrls.length}`);
    console.log(`   - Total: ${libraryBooksWithBadUrls.length + booksWithBadUrls.length + bookstoresWithBadUrls.length + usersWithBadUrls.length}`);
    console.log('\n🎉 All external image URLs have been removed!');
    console.log('💡 Users can now re-upload images - they will be saved locally.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixImageUrls();
