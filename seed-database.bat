@echo off
echo Seeding Al-Mutanabbi Database with Sample Data...
echo.

REM Check if we're in the right directory
if not exist "server\scripts\seed.js" (
    echo Error: Please run this script from the project root directory
    pause
    exit /b 1
)

REM Run seed script
echo Adding sample data to database...
cd server
call npm run seed

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Database seeded successfully!
    echo ========================================
    echo.
    echo Sample accounts created:
    echo.
    echo ADMIN:
    echo Email: admin@almutanabbi.com
    echo Password: admin123
    echo.
    echo BOOKSTORE OWNER:
    echo Email: owner@almutanabbi.com  
    echo Password: owner123
    echo Bookstore: مكتبة بغداد للتراث (5 sample books)
    echo.
    echo CUSTOMER:
    echo Email: customer@example.com
    echo Password: customer123
    echo.
    echo You can now start the application with: start-dev.bat
) else (
    echo.
    echo Error: Database seeding failed
    echo Please make sure the database is set up correctly
)

echo.
pause
