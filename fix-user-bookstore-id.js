// Fix user's bookstore_id to match their bookstore
const { sequelize } = require('./server/config/database');

async function fixUserBookstoreId() {
  try {
    console.log('🔧 Fixing user bookstore_id...');
    
    // Find users with bookstore_owner role but no bookstore_id
    const [users] = await sequelize.query(`
      SELECT u.id, u.email, u.role, u.bookstore_id, b.id as actual_bookstore_id, b.name
      FROM users u
      LEFT JOIN bookstores b ON b.owner_id = u.id
      WHERE u.role = 'bookstore_owner';
    `);
    
    console.log('📋 Found bookstore owners:', users);
    
    for (const user of users) {
      if (user.actual_bookstore_id && user.bookstore_id !== user.actual_bookstore_id) {
        console.log(`🔧 Updating user ${user.email} bookstore_id from ${user.bookstore_id} to ${user.actual_bookstore_id}`);
        
        await sequelize.query(`
          UPDATE users 
          SET bookstore_id = :bookstore_id 
          WHERE id = :user_id;
        `, {
          replacements: {
            bookstore_id: user.actual_bookstore_id,
            user_id: user.id
          }
        });
        
        console.log(`✅ Updated user ${user.email}`);
      }
    }
    
    // Verify the fix
    const [updatedUsers] = await sequelize.query(`
      SELECT u.id, u.email, u.role, u.bookstore_id, b.name as bookstore_name
      FROM users u
      LEFT JOIN bookstores b ON b.id = u.bookstore_id
      WHERE u.role = 'bookstore_owner';
    `);
    
    console.log('✅ Updated users:', updatedUsers);
    console.log('🎉 User bookstore_id fixed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error fixing user bookstore_id:', error);
    process.exit(1);
  }
}

fixUserBookstoreId();
