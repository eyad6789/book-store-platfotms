const jwt = require('jsonwebtoken');
const { User, Bookstore } = require('./models');

async function testJWT() {
  try {
    console.log('🔐 Testing JWT token...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc1OTEzOTQzNiwiZXhwIjoxNzU5NzQ0MjM2fQ.WJVA2MtCNO_4H7v2Di3Lz3tUuj2ND5nGIhJPcOsYqfM';
    
    // Decode without verification first
    const decoded = jwt.decode(token);
    console.log('Decoded token:', decoded);
    
    // Check if user exists
    const user = await User.findByPk(decoded.userId);
    console.log('User found:', user ? `${user.full_name} (${user.role})` : 'Not found');
    
    if (user) {
      // Check if bookstore exists
      const bookstore = await Bookstore.findOne({
        where: { owner_id: user.id }
      });
      console.log('Bookstore found:', bookstore ? `${bookstore.name} (ID: ${bookstore.id})` : 'Not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testJWT();
