const { sequelize } = require('./config/database');

async function runMigration() {
  try {
    console.log('🔄 Running password reset tokens migration...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Check if table exists
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'password_reset_tokens'
      );
    `);
    
    const tableExists = results[0].exists;
    
    if (tableExists) {
      console.log('ℹ️  Table already exists, verifying structure...');
      
      // Check if all columns exist
      const [columns] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'password_reset_tokens'
      `);
      
      const columnNames = columns.map(c => c.column_name);
      console.log('   Existing columns:', columnNames.join(', '));
      
      // Verify required columns
      const requiredColumns = ['id', 'user_id', 'token', 'expires_at', 'used', 'created_at'];
      const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('❌ Missing columns:', missingColumns.join(', '));
        throw new Error('Table structure is incomplete');
      }
      
      console.log('✅ Table structure is correct');
    } else {
      console.log('📝 Creating table...');
      
      await sequelize.query(`
        CREATE TABLE password_reset_tokens (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          used BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);
      
      console.log('✅ Table created');
      
      // Create indexes
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_prt_token ON password_reset_tokens(token);
      `);
      
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens(user_id);
      `);
      
      console.log('✅ Indexes created');
    }
    
    console.log('🎉 Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
