const { sequelize } = require('./config/database');

async function checkUserBookstore() {
  try {
    console.log('🔍 Checking user and bookstore data...');
    
    // Check users table
    const [users] = await sequelize.query(`
      SELECT id, full_name, email, role 
      FROM users 
      ORDER BY id
    `);
    
    console.log('\n👥 Users in database:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Name: ${user.full_name}, Role: ${user.role}`);
    });
    
    // Check bookstores table
    const [bookstores] = await sequelize.query(`
      SELECT id, name, owner_id, is_approved, is_active 
      FROM bookstores 
      ORDER BY id
    `);
    
    console.log('\n📚 Bookstores in database:');
    bookstores.forEach(bs => {
      console.log(`- ID: ${bs.id}, Name: ${bs.name}, Owner ID: ${bs.owner_id}, Approved: ${bs.is_approved}, Active: ${bs.is_active}`);
    });
    
    // Check for user ID 2 specifically
    const [userBookstore] = await sequelize.query(`
      SELECT b.*, u.full_name as owner_name 
      FROM bookstores b 
      JOIN users u ON b.owner_id = u.id 
      WHERE b.owner_id = 2
    `);
    
    console.log('\n🔍 Bookstore for User ID 2:');
    if (userBookstore.length > 0) {
      const bs = userBookstore[0];
      console.log(`✅ Found: ${bs.name} (ID: ${bs.id}) owned by ${bs.owner_name}`);
      console.log(`   Approved: ${bs.is_approved}, Active: ${bs.is_active}`);
    } else {
      console.log('❌ No bookstore found for User ID 2');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUserBookstore();
