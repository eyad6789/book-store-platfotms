const jwt = require('jsonwebtoken');
const { User, Bookstore } = require('./models');

async function debugUserBookstore() {
  try {
    console.log('🔍 Debugging user and bookstore relationship...');
    
    // Decode the JWT token from your browser
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc1OTEzOTQzNiwiZXhwIjoxNzU5NzQ0MjM2fQ.WJVA2MtCNO_4H7v2Di3Lz3tUuj2ND5nGIhJPcOsYqfM';
    
    const decoded = jwt.decode(token);
    console.log('Token decoded - User ID:', decoded.userId);
    
    // Check user details
    const user = await User.findByPk(decoded.userId);
    if (user) {
      console.log('User found:', {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role
      });
    } else {
      console.log('❌ User not found!');
      return;
    }
    
    // Check if bookstore exists for this user
    console.log('\n📚 Checking bookstores for user ID:', decoded.userId);
    const bookstore = await Bookstore.findOne({
      where: { owner_id: decoded.userId }
    });
    
    if (bookstore) {
      console.log('✅ Bookstore found:', {
        id: bookstore.id,
        name: bookstore.name,
        owner_id: bookstore.owner_id,
        is_approved: bookstore.is_approved,
        is_active: bookstore.is_active
      });
    } else {
      console.log('❌ No bookstore found for this user');
    }
    
    // List all bookstores to see what exists
    console.log('\n📋 All bookstores in database:');
    const allBookstores = await Bookstore.findAll({
      attributes: ['id', 'name', 'owner_id', 'is_approved', 'is_active']
    });
    
    allBookstores.forEach(bs => {
      console.log(`- ID: ${bs.id}, Name: ${bs.name}, Owner: ${bs.owner_id}, Approved: ${bs.is_approved}, Active: ${bs.is_active}`);
    });
    
    // List all users to see roles
    console.log('\n👥 All users in database:');
    const allUsers = await User.findAll({
      attributes: ['id', 'full_name', 'email', 'role']
    });
    
    allUsers.forEach(u => {
      console.log(`- ID: ${u.id}, Name: ${u.full_name}, Email: ${u.email}, Role: ${u.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

debugUserBookstore();
