@echo off
REM Deployment script for Al-Mutanabbi Bookstore Platform (Windows)
REM This script automates the deployment process

echo ========================================
echo   Al-Mutanabbi Deployment Script
echo ========================================
echo.

REM Check if .env files exist
if not exist "server\.env" (
    echo [ERROR] server\.env file not found!
    echo Please create server\.env from server\.env.example.production
    pause
    exit /b 1
)

if not exist "client\.env" (
    echo [ERROR] client\.env file not found!
    echo Please create client\.env from client\.env.example.production
    pause
    exit /b 1
)

echo [OK] Environment files found
echo.

REM Install server dependencies
echo Installing server dependencies...
cd server
call npm install --production
if errorlevel 1 (
    echo [ERROR] Failed to install server dependencies
    cd ..
    pause
    exit /b 1
)
echo [OK] Server dependencies installed
cd ..
echo.

REM Install client dependencies
echo Installing client dependencies...
cd client
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install client dependencies
    cd ..
    pause
    exit /b 1
)
echo [OK] Client dependencies installed
echo.

REM Build client
echo Building client application...
call npm run build
if errorlevel 1 (
    echo [ERROR] Failed to build client
    cd ..
    pause
    exit /b 1
)
echo [OK] Client built successfully
cd ..
echo.

REM Run database migrations
echo Running database migrations...
cd server
call npm run migrate
if errorlevel 1 (
    echo [ERROR] Failed to run migrations
    cd ..
    pause
    exit /b 1
)
echo [OK] Database migrations completed
cd ..
echo.

REM Create necessary directories
echo Creating necessary directories...
if not exist "logs" mkdir logs
if not exist "server\uploads" mkdir server\uploads
echo [OK] Directories created
echo.

echo ========================================
echo   Deployment preparation complete!
echo ========================================
echo.
echo Next steps:
echo   1. Upload files to Hostinger via FTP or Git
echo   2. SSH into your Hostinger server
echo   3. Run: pm2 start ecosystem.config.js
echo   4. Run: pm2 save
echo   5. Run: pm2 startup
echo.
echo Your application will be available at your domain!
echo.
pause
