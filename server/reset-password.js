// Script to reset user password
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');

async function resetPassword() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    const email = 'eyad.q.raheem@gmail.com';
    const newPassword = 'password123'; // Change this to your desired password

    // Get user
    const [users] = await sequelize.query(
      'SELECT id, email, full_name, role FROM users WHERE email = ?',
      { replacements: [email] }
    );

    if (users.length === 0) {
      console.log('❌ User not found');
      process.exit(1);
    }

    const user = users[0];
    console.log('👤 User found:');
    console.log('   Name:', user.full_name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('');

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await sequelize.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      { replacements: [hashedPassword, user.id] }
    );

    console.log('✅ Password reset successfully!');
    console.log('');
    console.log('📝 New credentials:');
    console.log('   Email:', email);
    console.log('   Password:', newPassword);
    console.log('');
    console.log('⚠️  Please change this password after logging in!');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
