const { sequelize } = require('../config/database');

async function cleanupDuplicateCategories() {
  try {
    console.log('🔄 Starting category cleanup...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Find and remove duplicate categories, keeping the first occurrence
    const cleanupQuery = `
      DELETE FROM categories 
      WHERE id NOT IN (
        SELECT MIN(id) 
        FROM categories 
        GROUP BY name, name_ar
      );
    `;

    const result = await sequelize.query(cleanupQuery);
    console.log(`✅ Removed ${result[1]} duplicate categories.`);

    // Update sort_order for remaining categories
    const updateSortOrder = `
      UPDATE categories 
      SET sort_order = CASE 
        WHEN name_ar = 'الأدب' THEN 1
        WHEN name_ar = 'الدين' THEN 2
        WHEN name_ar = 'التاريخ' THEN 3
        WHEN name_ar = 'العلوم' THEN 4
        WHEN name_ar = 'التعليم' THEN 5
        WHEN name_ar = 'الأطفال' THEN 6
        WHEN name_ar = 'الفلسفة' THEN 7
        WHEN name_ar = 'الشعر' THEN 8
        ELSE sort_order
      END
      WHERE parent_id IS NULL;
    `;

    await sequelize.query(updateSortOrder);
    console.log('✅ Updated category sort order.');

    // Show final category count
    const [categories] = await sequelize.query('SELECT COUNT(*) as count FROM categories WHERE parent_id IS NULL');
    console.log(`✅ Final category count: ${categories[0].count}`);

    console.log('✅ Category cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Category cleanup failed:', error);
    throw error;
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupDuplicateCategories()
    .then(() => {
      console.log('🎉 Category cleanup process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Category cleanup process failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupDuplicateCategories };
