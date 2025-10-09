const { sequelize } = require('./server/config/database');
const { User } = require('./server/models');

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    const users = await User.findAll({
      attributes: ['id', 'email', 'full_name', 'role', 'created_at'],
      limit: 10
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.full_name}) - ${user.role}`);
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('💡 You need to create an account first');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkUsers();
