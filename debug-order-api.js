const { sequelize } = require('./server/config/database');
const { User, Book, Bookstore } = require('./server/models');
const jwt = require('jsonwebtoken');

async function debugOrderAPI() {
  try {
    console.log('🔍 Debugging Order API...\n');
    
    // Get a test user
    const testUser = await User.findOne({ where: { email: 'test@example.com' } });
    if (!testUser) {
      console.log('❌ No test user found');
      return;
    }
    
    console.log('✅ Test user found:', testUser.full_name);
    
    // Generate a valid JWT token
    const token = jwt.sign(
      { userId: testUser.id }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '1h' }
    );
    
    console.log('✅ JWT token generated');
    
    // Get an available book
    const book = await Book.findOne({
      where: { is_active: true },
      include: [
        {
          model: Bookstore,
          as: 'bookstore',
          where: { is_approved: true, is_active: true }
        }
      ]
    });
    
    if (!book) {
      console.log('❌ No available books found');
      return;
    }
    
    console.log('✅ Available book found:', book.title_arabic || book.title);
    
    // Test the API endpoint
    console.log('\n🧪 Testing Order Creation API...');
    
    const orderData = {
      items: [
        {
          book_id: book.id,
          quantity: 1
        }
      ],
      delivery_address: "بغداد، الكرادة، شارع الرشيد",
      delivery_phone: "07901234567",
      delivery_notes: "يرجى الاتصال قبل التوصيل",
      payment_method: "cash_on_delivery"
    };
    
    console.log('📝 Order data:', JSON.stringify(orderData, null, 2));
    
    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Order creation successful!');
        console.log('📋 Order details:', {
          id: result.order.id,
          order_number: result.order.order_number,
          total_amount: result.order.total_amount,
          status: result.order.status
        });
      } else {
        console.log('❌ Order creation failed:');
        console.log('Status:', response.status);
        console.log('Error:', result);
      }
      
    } catch (fetchError) {
      console.log('❌ API request failed:', fetchError.message);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

debugOrderAPI();
