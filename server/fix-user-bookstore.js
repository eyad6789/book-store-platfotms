const { User, Bookstore } = require('./models');

async function fixUserBookstore() {
  try {
    console.log('🔧 Fixing user bookstore issue...');
    
    // Find user with ID 2 (from the JWT token)
    const user = await User.findByPk(2);
    if (!user) {
      console.log('❌ User with ID 2 not found');
      return;
    }
    
    console.log('👤 Current user:', {
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role
    });
    
    // Check if user is bookstore_owner
    if (user.role !== 'bookstore_owner') {
      console.log('🔄 Updating user role to bookstore_owner...');
      await user.update({ role: 'bookstore_owner' });
      console.log('✅ User role updated to bookstore_owner');
    }
    
    // Check if bookstore exists
    let bookstore = await Bookstore.findOne({ where: { owner_id: user.id } });
    
    if (!bookstore) {
      console.log('📚 Creating bookstore for user...');
      bookstore = await Bookstore.create({
        owner_id: user.id,
        name: 'مكتبة المتنبي الرقمية',
        name_arabic: 'مكتبة المتنبي الرقمية',
        description: 'مكتبة رقمية متخصصة في الكتب العربية والتراث',
        description_arabic: 'مكتبة رقمية متخصصة في الكتب العربية والتراث',
        address: 'بغداد، العراق',
        address_arabic: 'بغداد، العراق',
        phone: '+964-1-234-5678',
        email: user.email,
        is_approved: true,
        is_active: true,
        governorate: 'بغداد'
      });
      console.log('✅ Bookstore created:', bookstore.name);
    } else {
      console.log('📚 Bookstore exists:', bookstore.name);
      
      // Make sure it's approved and active
      if (!bookstore.is_approved || !bookstore.is_active) {
        console.log('🔄 Updating bookstore status...');
        await bookstore.update({
          is_approved: true,
          is_active: true
        });
        console.log('✅ Bookstore approved and activated');
      }
    }
    
    console.log('\n🎉 Fix completed! User should now be able to access their bookstore dashboard.');
    console.log('📍 Bookstore details:', {
      id: bookstore.id,
      name: bookstore.name,
      owner_id: bookstore.owner_id,
      is_approved: bookstore.is_approved,
      is_active: bookstore.is_active
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

fixUserBookstore();
