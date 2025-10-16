@echo off
REM SMS Dashboard Setup Script for Windows
REM This script sets up the project on a new Windows machine

echo 🚀 Setting up SMS Dashboard...
echo.

REM Check if we're in the right directory
if not exist "README.md" (
    echo ❌ Error: Please run this script from the project root directory
    exit /b 1
)

REM Backend Setup
echo 📦 Setting up Backend...
cd sms_integration_hub

if not exist "package.json" (
    echo ❌ Error: Backend package.json not found
    exit /b 1
)

echo Installing backend dependencies...
call npm install

if not exist ".env" (
    if exist ".env.example" (
        echo Creating .env file from .env.example...
        copy .env.example .env
        echo ⚠️  Please edit sms_integration_hub\.env with your database credentials
    ) else (
        echo ⚠️  No .env.example found. Please create .env manually
    )
)

cd ..

REM Frontend Setup
echo.
echo 🎨 Setting up Frontend...
cd sms-integration-hub-frontend

if not exist "package.json" (
    echo ❌ Error: Frontend package.json not found
    exit /b 1
)

echo Installing frontend dependencies...
call npm install

cd ..

REM Done
echo.
echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo 1. Edit sms_integration_hub\.env with your database credentials
echo 2. Start backend:  cd sms_integration_hub ^&^& npm run dev
echo 3. Start frontend: cd sms-integration-hub-frontend ^&^& npm run dev
echo 4. Open browser:   http://localhost:5173
echo.
echo 🎉 Happy coding!
pause

