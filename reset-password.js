const { sequelize } = require('./server/config/database');
const { User } = require('./server/models');

async function resetUserPassword() {
  try {
    console.log('🔐 Password Reset Utility\n');
    
    // List available users
    const users = await User.findAll({
      attributes: ['id', 'email', 'full_name', 'role'],
      order: [['role', 'DESC'], ['email', 'ASC']]
    });
    
    console.log('📋 Available users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.full_name}) - ${user.role}`);
    });
    
    // Reset passwords for common accounts
    const accountsToReset = [
      { email: 'admin@almutanabbi.com', password: 'admin123' },
      { email: 'aeadq2001@gmail.com', password: 'eyad123' },
      { email: 'eyad.q.raheem@gmail.com', password: 'eyad123' },
      { email: 'test@example.com', password: 'test123' },
      { email: 'customer@example.com', password: 'customer123' },
      { email: 'owner@almutanabbi.com', password: 'owner123' }
    ];
    
    console.log('\n🔄 Resetting passwords for common accounts...\n');
    
    for (const account of accountsToReset) {
      const user = await User.findOne({ where: { email: account.email } });
      
      if (user) {
        // Update the password (will be automatically hashed by the model hook)
        await user.update({ password_hash: account.password });
        
        console.log(`✅ ${account.email} → Password: ${account.password}`);
      }
    }
    
    console.log('\n🎉 Password reset complete!');
    console.log('\n📝 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 ADMIN ACCOUNT:');
    console.log('   Email: admin@almutanabbi.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('👤 YOUR ACCOUNTS:');
    console.log('   Email: aeadq2001@gmail.com');
    console.log('   Password: eyad123');
    console.log('   ──────────────────────────');
    console.log('   Email: eyad.q.raheem@gmail.com');
    console.log('   Password: eyad123');
    console.log('');
    console.log('🧪 TEST ACCOUNTS:');
    console.log('   Email: test@example.com');
    console.log('   Password: test123');
    console.log('   ──────────────────────────');
    console.log('   Email: customer@example.com');
    console.log('   Password: customer123');
    console.log('   ──────────────────────────');
    console.log('   Email: owner@almutanabbi.com');
    console.log('   Password: owner123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌐 Frontend URL: http://localhost:3002/');
    console.log('🔗 Login Page: http://localhost:3002/login');
    
  } catch (error) {
    console.error('❌ Error resetting passwords:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

resetUserPassword();
