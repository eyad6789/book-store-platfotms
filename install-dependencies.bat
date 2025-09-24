@echo off
echo Installing Al-Mutanabbi Dependencies...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo NPM version:
npm --version
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd server
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install backend dependencies
    pause
    exit /b 1
)

REM Go back to root and install frontend dependencies
cd ..
echo.
echo Installing frontend dependencies...
cd client
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install frontend dependencies
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo Dependencies installed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure PostgreSQL is installed and running
echo 2. Run: setup-database.bat
echo 3. Run: start-dev.bat
echo.
pause
