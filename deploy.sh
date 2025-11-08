#!/bin/bash

# Deployment script for Al-Mutanabbi Bookstore Platform
# This script automates the deployment process to Hostinger

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    print_error "server/.env file not found!"
    print_info "Please create server/.env from server/.env.example.production"
    exit 1
fi

if [ ! -f "client/.env" ]; then
    print_error "client/.env file not found!"
    print_info "Please create client/.env from client/.env.example.production"
    exit 1
fi

print_success "Environment files found"

# Install server dependencies
print_info "Installing server dependencies..."
cd server
npm install --production
if [ $? -ne 0 ]; then
    print_error "Failed to install server dependencies"
    exit 1
fi
print_success "Server dependencies installed"
cd ..

# Install client dependencies
print_info "Installing client dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install client dependencies"
    exit 1
fi
print_success "Client dependencies installed"

# Build client
print_info "Building client application..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Failed to build client"
    exit 1
fi
print_success "Client built successfully"
cd ..

# Run database migrations
print_info "Running database migrations..."
cd server
npm run migrate
if [ $? -ne 0 ]; then
    print_error "Failed to run migrations"
    exit 1
fi
print_success "Database migrations completed"
cd ..

# Create necessary directories
print_info "Creating necessary directories..."
mkdir -p logs
mkdir -p server/uploads
print_success "Directories created"

# Set proper permissions
print_info "Setting file permissions..."
chmod -R 755 server/uploads
chmod -R 755 logs
print_success "Permissions set"

print_success "Deployment preparation complete!"
print_info "Next steps:"
echo "  1. Upload files to Hostinger via FTP or Git"
echo "  2. SSH into your Hostinger server"
echo "  3. Run: pm2 start ecosystem.config.js"
echo "  4. Run: pm2 save"
echo "  5. Run: pm2 startup"
echo ""
print_info "Your application will be available at your domain!"
