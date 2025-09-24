const { sequelize } = require('../config/database');
const { User, Bookstore, Book, Order, OrderItem } = require('../models');

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    
    // Sync all models
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database models synchronized.');
    
    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
      await User.create({
        email: 'admin@almutanabbi.com',
        password_hash: 'admin123', // Will be hashed by the model hook
        full_name: 'مدير المتنبي',
        role: 'admin',
        is_verified: true
      });
      console.log('✅ Admin user created (email: admin@almutanabbi.com, password: admin123)');
    }
    
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
