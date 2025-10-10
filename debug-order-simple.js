const { sequelize } = require('./server/config/database');
const { User, Book, Bookstore, Order, OrderItem } = require('./server/models');

async function debugOrderSimple() {
  try {
    console.log('🔍 Debugging Order Creation Components...\n');
    
    // Test 1: Check database connection
    console.log('1️⃣ Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test 2: Check if models are properly loaded
    console.log('\n2️⃣ Testing model availability...');
    console.log('✅ User model:', User ? 'Available' : 'Missing');
    console.log('✅ Book model:', Book ? 'Available' : 'Missing');
    console.log('✅ Bookstore model:', Bookstore ? 'Available' : 'Missing');
    console.log('✅ Order model:', Order ? 'Available' : 'Missing');
    console.log('✅ OrderItem model:', OrderItem ? 'Available' : 'Missing');
    
    // Test 3: Check if we have test data
    console.log('\n3️⃣ Testing data availability...');
    
    const userCount = await User.count();
    const bookCount = await Book.count();
    const bookstoreCount = await Bookstore.count();
    
    console.log(`✅ Users in database: ${userCount}`);
    console.log(`✅ Books in database: ${bookCount}`);
    console.log(`✅ Bookstores in database: ${bookstoreCount}`);
    
    // Test 4: Check if we can find active books
    console.log('\n4️⃣ Testing active books query...');
    const activeBooks = await Book.findAll({
      where: { is_active: true },
      include: [
        {
          model: Bookstore,
          as: 'bookstore',
          where: { is_approved: true, is_active: true }
        }
      ],
      limit: 3
    });
    
    console.log(`✅ Active books found: ${activeBooks.length}`);
    activeBooks.forEach(book => {
      console.log(`   - ${book.title_arabic || book.title} (${book.price} د.ع)`);
    });
    
    // Test 5: Check if we can create a simple order (without API)
    console.log('\n5️⃣ Testing direct order creation...');
    
    const testUser = await User.findOne({ where: { email: 'test@example.com' } });
    if (testUser && activeBooks.length > 0) {
      const transaction = await sequelize.transaction();
      
      try {
        const testOrder = await Order.create({
          customer_id: testUser.id,
          subtotal: 25.00,
          shipping_cost: 0,
          tax_amount: 0,
          total_amount: 25.00,
          delivery_address: "Test Address",
          delivery_phone: "1234567890",
          payment_method: "cash_on_delivery"
        }, { transaction });
        
        console.log('✅ Direct order creation successful:', testOrder.order_number);
        
        await transaction.rollback(); // Don't actually save the test order
        console.log('✅ Test order rolled back (not saved)');
        
      } catch (orderError) {
        await transaction.rollback();
        console.log('❌ Direct order creation failed:', orderError.message);
      }
    }
    
    console.log('\n🎯 Diagnosis Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (userCount > 0 && bookCount > 0 && activeBooks.length > 0) {
      console.log('✅ Database and models are working correctly');
      console.log('✅ Test data is available');
      console.log('🔍 Issue is likely in the API route or frontend');
      console.log('');
      console.log('🔧 Next steps:');
      console.log('   1. Check server console logs for errors');
      console.log('   2. Verify JWT token is being sent correctly from frontend');
      console.log('   3. Check if req.user.id is properly set in auth middleware');
    } else {
      console.log('❌ Missing required data or model issues');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

debugOrderSimple();
