// Quick script to check if user has a bookstore in database
require('dotenv').config();
const { sequelize } = require('./config/database');

async function checkBookstore() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Get all bookstores
    const [bookstores] = await sequelize.query(
      'SELECT id, name, owner_id, is_approved, is_active FROM bookstores'
    );

    console.log('📚 Found', bookstores.length, 'bookstore(s):\n');
    
    bookstores.forEach((store, index) => {
      console.log(`${index + 1}. Bookstore:`, store.name);
      console.log('   ID:', store.id);
      console.log('   Owner ID:', store.owner_id);
      console.log('   Approved:', store.is_approved ? 'Yes' : 'No');
      console.log('   Active:', store.is_active ? 'Yes' : 'No');
      console.log('');
    });

    // Get all bookstore owners
    const [owners] = await sequelize.query(
      "SELECT id, full_name, email, role FROM users WHERE role = 'bookstore_owner'"
    );

    console.log('👥 Found', owners.length, 'bookstore owner(s):\n');
    
    owners.forEach((owner, index) => {
      const hasStore = bookstores.find(s => s.owner_id === owner.id);
      console.log(`${index + 1}. ${owner.full_name} (${owner.email})`);
      console.log('   User ID:', owner.id);
      console.log('   Has Library:', hasStore ? `Yes - "${hasStore.name}"` : 'No');
      console.log('');
    });

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkBookstore();
