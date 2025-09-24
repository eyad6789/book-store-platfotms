@echo off
echo Setting up Al-Mutanabbi Database...
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL from https://www.postgresql.org/download/
    pause
    exit /b 1
)

REM Create database
echo Creating database 'almutanabbi'...
createdb almutanabbi 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Database 'almutanabbi' created successfully
) else (
    echo Database 'almutanabbi' already exists or could not be created
)

REM Run migrations
echo.
echo Running database migrations...
cd server
call npm install
call npm run migrate

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Database setup completed successfully!
    echo.
    echo You can now run the application with: start-dev.bat
    echo.
    echo Default admin account:
    echo Email: admin@almutanabbi.com
    echo Password: admin123
) else (
    echo.
    echo Error: Database migration failed
    echo Please check your PostgreSQL installation and configuration
)

echo.
pause
