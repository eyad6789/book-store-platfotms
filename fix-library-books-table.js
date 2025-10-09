// Script to fix the library_books table by adding availability_status column
const { sequelize } = require('./server/config/database');

async function fixLibraryBooksTable() {
  try {
    console.log('🔧 Fixing library_books table...');
    
    // Add availability_status column if it doesn't exist
    await sequelize.query(`
      ALTER TABLE library_books 
      ADD COLUMN IF NOT EXISTS availability_status VARCHAR(20) DEFAULT 'available';
    `);
    
    console.log('✅ Added availability_status column');
    
    // Update existing records to have 'available' status
    await sequelize.query(`
      UPDATE library_books 
      SET availability_status = 'available' 
      WHERE availability_status IS NULL;
    `);
    
    console.log('✅ Updated existing records');
    
    // Verify the column exists
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'library_books' AND column_name = 'availability_status';
    `);
    
    if (results.length > 0) {
      console.log('✅ Column verified:', results[0]);
    } else {
      console.log('❌ Column not found');
    }
    
    console.log('🎉 Library books table fixed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error fixing table:', error);
    process.exit(1);
  }
}

fixLibraryBooksTable();
