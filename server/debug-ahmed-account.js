const { User, Bookstore, Book } = require('./models');

async function debugAhmedAccount() {
  try {
    console.log('🔍 Searching for Ahmed Al-Kutbi account...');
    
    // Search for user by name
    const user = await User.findOne({
      where: {
        full_name: 'احمد الكتبي'
      }
    });
    
    if (!user) {
      console.log('❌ User "احمد الكتبي" not found');
      
      // Let's check all users to see what names exist
      const allUsers = await User.findAll({
        attributes: ['id', 'full_name', 'email', 'role']
      });
      
      console.log('\n👥 All users in database:');
      allUsers.forEach(u => {
        console.log(`- ID: ${u.id}, Name: "${u.full_name}", Email: ${u.email}, Role: ${u.role}`);
      });
      
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified
    });
    
    // Check if user has a bookstore
    const bookstore = await Bookstore.findOne({
      where: { owner_id: user.id }
    });
    
    if (!bookstore) {
      console.log('❌ No bookstore found for Ahmed Al-Kutbi');
      console.log('🔧 Creating bookstore for Ahmed...');
      
      // Create bookstore for Ahmed
      const newBookstore = await Bookstore.create({
        owner_id: user.id,
        name: 'مكتبة احمد الكتبي',
        name_arabic: 'مكتبة احمد الكتبي',
        description: 'مكتبة متخصصة في الكتب العربية والأدب',
        description_arabic: 'مكتبة متخصصة في الكتب العربية والأدب',
        address: 'بغداد، العراق',
        address_arabic: 'بغداد، العراق',
        phone: '+964-1-234-5678',
        email: user.email,
        is_approved: true,
        is_active: true,
        governorate: 'بغداد'
      });
      
      console.log('✅ Bookstore created:', {
        id: newBookstore.id,
        name: newBookstore.name,
        is_approved: newBookstore.is_approved,
        is_active: newBookstore.is_active
      });
      
    } else {
      console.log('📚 Bookstore found:', {
        id: bookstore.id,
        name: bookstore.name,
        is_approved: bookstore.is_approved,
        is_active: bookstore.is_active
      });
      
      // Make sure bookstore is approved and active
      if (!bookstore.is_approved || !bookstore.is_active) {
        console.log('🔧 Updating bookstore status...');
        await bookstore.update({
          is_approved: true,
          is_active: true
        });
        console.log('✅ Bookstore approved and activated');
      }
    }
    
    // Make sure user has bookstore_owner role
    if (user.role !== 'bookstore_owner') {
      console.log('🔧 Updating user role to bookstore_owner...');
      await user.update({ role: 'bookstore_owner' });
      console.log('✅ User role updated');
    }
    
    // Check books
    const bookCount = await Book.count({
      where: { bookstore_id: bookstore?.id || (await Bookstore.findOne({ where: { owner_id: user.id } })).id }
    });
    
    console.log(`📖 Books in bookstore: ${bookCount}`);
    
    console.log('\n🎉 Account setup complete for Ahmed Al-Kutbi!');
    console.log('📍 User can now access dashboard at: /library/' + (bookstore?.id || (await Bookstore.findOne({ where: { owner_id: user.id } })).id) + '/dashboard');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

debugAhmedAccount();
