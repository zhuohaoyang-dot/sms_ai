#!/bin/bash

# SMS Dashboard Setup Script
# This script sets up the project on a new machine

echo "🚀 Setting up SMS Dashboard..."
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Backend Setup
echo "📦 Setting up Backend..."
cd sms_integration_hub

if [ ! -f "package.json" ]; then
    echo "❌ Error: Backend package.json not found"
    exit 1
fi

echo "Installing backend dependencies..."
npm install

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "Creating .env file from .env.example..."
        cp .env.example .env
        echo "⚠️  Please edit sms_integration_hub/.env with your database credentials"
    else
        echo "⚠️  No .env.example found. Please create .env manually"
    fi
fi

cd ..

# Frontend Setup
echo ""
echo "🎨 Setting up Frontend..."
cd sms-integration-hub-frontend

if [ ! -f "package.json" ]; then
    echo "❌ Error: Frontend package.json not found"
    exit 1
fi

echo "Installing frontend dependencies..."
npm install

cd ..

# Done
echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit sms_integration_hub/.env with your database credentials"
echo "2. Start backend:  cd sms_integration_hub && npm run dev"
echo "3. Start frontend: cd sms-integration-hub-frontend && npm run dev"
echo "4. Open browser:   http://localhost:5173"
echo ""
echo "🎉 Happy coding!"

