@echo off
echo Starting Al-Mutanabbi Development Environment...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if PostgreSQL is running
echo Checking PostgreSQL connection...
pg_isready -h localhost -p 5432 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Warning: PostgreSQL is not running or not accessible
    echo Please make sure PostgreSQL is installed and running
    echo Database: almutanabbi
    echo.
)

REM Start backend server
echo Starting backend server...
start "Al-Mutanabbi Backend" cmd /k "cd /d server && npm install && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend development server
echo Starting frontend development server...
start "Al-Mutanabbi Frontend" cmd /k "cd /d client && npm install && npm run dev"

echo.
echo ========================================
echo Al-Mutanabbi Development Environment
echo ========================================
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:3001
echo.
echo Demo Accounts:
echo - Customer: customer@example.com / customer123
echo - Bookstore Owner: owner@almutanabbi.com / owner123
echo - Admin: admin@almutanabbi.com / admin123
echo.
echo Press any key to close this window...
pause >nul
