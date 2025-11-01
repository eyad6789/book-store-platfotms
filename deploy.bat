@echo off
REM Deployment script for al-mutanabbi.online (Windows)
REM Run this script to prepare files for Hostinger deployment

echo ========================================
echo Deployment Preparation for al-mutanabbi.online
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "HOSTINGER-DEPLOYMENT-GUIDE.md" (
    echo ERROR: Please run this script from the project root directory
    exit /b 1
)

REM Step 1: Clean previous builds
echo [1/6] Cleaning previous builds...
if exist "client\dist" rmdir /s /q "client\dist"
if exist "deployment-package" rmdir /s /q "deployment-package"

REM Step 2: Install dependencies
echo.
echo [2/6] Installing dependencies...

echo Installing server dependencies...
cd server
call npm install --production
if errorlevel 1 (
    echo ERROR: Failed to install server dependencies
    exit /b 1
)
cd ..

echo Installing client dependencies...
cd client
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install client dependencies
    exit /b 1
)
cd ..

REM Step 3: Build client
echo.
echo [3/6] Building client for production...
cd client
call npm run build:prod
if errorlevel 1 (
    echo ERROR: Failed to build client
    exit /b 1
)
cd ..

REM Step 4: Create deployment package
echo.
echo [4/6] Creating deployment package...
mkdir deployment-package\public_html
mkdir deployment-package\server
mkdir deployment-package\logs

echo Copying client files...
xcopy /E /I /Y client\dist\* deployment-package\public_html\
copy /Y .htaccess deployment-package\public_html\

echo Copying server files...
xcopy /E /I /Y server deployment-package\server\ /EXCLUDE:deploy-exclude.txt

REM Create exclude file for xcopy
echo node_modules > deploy-exclude.txt
echo .env >> deploy-exclude.txt
echo uploads >> deploy-exclude.txt

REM Copy production env file
copy /Y server\.env.production deployment-package\server\.env.example

REM Create necessary directories
mkdir deployment-package\public_html\uploads
mkdir deployment-package\public_html\uploads\avatars
mkdir deployment-package\public_html\uploads\bookstores
mkdir deployment-package\public_html\uploads\books
mkdir deployment-package\public_html\uploads\library-books

REM Clean up
del deploy-exclude.txt

REM Step 5: Create deployment instructions
echo.
echo [5/6] Creating deployment instructions...
(
echo =================================================================
echo DEPLOYMENT INSTRUCTIONS FOR al-mutanabbi.online
echo =================================================================
echo.
echo 1. UPLOAD FILES:
echo    - Upload contents of 'public_html/' to your Hostinger public_html directory
echo    - Upload 'server/' folder to /home/your_username/server/
echo    - Create 'logs/' directory at /home/your_username/logs/
echo.
echo 2. CONFIGURE ENVIRONMENT:
echo    - Rename server/.env.example to server/.env
echo    - Edit server/.env and fill in your database credentials and secrets
echo    - Generate secrets using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
echo.
echo 3. INSTALL SERVER DEPENDENCIES:
echo    SSH into your server and run:
echo    cd /home/your_username/server
echo    npm install --production
echo.
echo 4. SETUP DATABASE:
echo    - Create PostgreSQL database in Hostinger control panel
echo    - Run migrations: node migrations/run-migrations.js
echo.
echo 5. CONFIGURE NODE.JS:
echo    - Go to Hostinger control panel -^> Node.js
echo    - Create application pointing to server/server.js
echo    - Start the application
echo.
echo 6. VERIFY:
echo    - Visit https://al-mutanabbi.online
echo    - Test login, registration, and all features
echo.
echo For detailed instructions, see HOSTINGER-DEPLOYMENT-GUIDE.md
echo.
echo =================================================================
) > deployment-package\DEPLOY-INSTRUCTIONS.txt

REM Step 6: Summary
echo.
echo [6/6] Deployment package created successfully!
echo.
echo ========================================
echo DEPLOYMENT PACKAGE READY
echo ========================================
echo.
echo Deployment files are ready in: deployment-package\
echo.
echo Next steps:
echo 1. Review HOSTINGER-DEPLOYMENT-GUIDE.md for detailed instructions
echo 2. Configure server\.env with your database credentials
echo 3. Upload files to Hostinger via SFTP (FileZilla recommended)
echo 4. Follow the deployment guide to complete setup
echo.
echo Good luck with your deployment!
echo.
pause
