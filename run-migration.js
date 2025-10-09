const { sequelize } = require('./server/config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Running library ratings migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'server', 'migrations', '003-library-ratings.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await sequelize.query(migrationSQL);
    
    console.log('✅ Library ratings migration completed successfully!');
    console.log('📊 Rating system is now active for all libraries');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.original) {
      console.error('Database error:', error.original.message);
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

runMigration();
