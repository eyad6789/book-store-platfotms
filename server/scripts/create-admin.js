const readline = require('readline');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const User = require('../models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log('\n========================================');
    console.log('   Create Admin User for المتنبي');
    console.log('========================================\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established\n');

    // Get admin details
    const username = await question('Enter admin username: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const confirmPassword = await question('Confirm password: ');

    // Validate input
    if (!username || !email || !password) {
      console.error('\n✗ All fields are required!');
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.error('\n✗ Passwords do not match!');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('\n✗ Password must be at least 6 characters long!');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      console.error('\n✗ User with this username or email already exists!');
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    console.log('\n========================================');
    console.log('   ✓ Admin User Created Successfully!');
    console.log('========================================');
    console.log(`\nUsername: ${admin.username}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log(`User ID: ${admin.id}`);
    console.log('\nYou can now log in with these credentials.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error creating admin user:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
createAdmin();
