@echo off
echo ========================================
echo المتنبي - إعداد سريع للمرحلة الثانية
echo Al-Mutanabbi Quick Stage 2 Setup
echo ========================================
echo.

echo Step 1: Installing Stripe dependency...
cd server
call npm install stripe

echo.
echo Step 2: Running simplified migration...
node scripts/migrate-stage2.js

echo.
echo Step 3: Adding basic categories and payment methods...
node -e "
const { sequelize } = require('./config/database');

async function quickSeed() {
  try {
    // Insert categories
    await sequelize.query(`
      INSERT INTO categories (name, name_ar, description) VALUES
      ('Literature', 'الأدب', 'Classic and contemporary literature'),
      ('History', 'التاريخ', 'Historical books'),
      ('Religion', 'الدين', 'Religious books'),
      ('Science', 'العلوم', 'Scientific books'),
      ('Philosophy', 'الفلسفة', 'Philosophy books')
      ON CONFLICT DO NOTHING;
    `);
    
    // Insert payment methods
    await sequelize.query(`
      INSERT INTO payment_methods (name, name_ar, code, requires_details, description) VALUES
      ('Cash on Delivery', 'الدفع عند التسليم', 'cash_on_delivery', false, 'Pay when you receive'),
      ('Bank Transfer', 'التحويل البنكي', 'bank_transfer', true, 'Bank transfer'),
      ('Credit Card', 'بطاقة ائتمان', 'credit_card', true, 'Credit card via Stripe'),
      ('Mobile Wallet', 'المحفظة الإلكترونية', 'mobile_wallet', true, 'Mobile wallet')
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('✅ Basic data seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  }
  process.exit(0);
}

quickSeed();
"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ Stage 2 Quick Setup Complete!
    echo ========================================
    echo.
    echo New features available:
    echo - Categories system
    echo - Payment methods
    echo - Enhanced database schema
    echo.
    echo To start the application:
    echo cd ..
    echo .\start-dev.bat
    echo.
) else (
    echo.
    echo ❌ Setup failed. Please check the errors above.
)

cd ..
pause
