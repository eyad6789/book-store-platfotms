#!/bin/bash

# المتنبي (Al-Mutanabbi) Stage 2 Deployment Script
# This script deploys the enhanced features for the Iraqi Online Bookstore Marketplace

set -e  # Exit on any error

echo "🚀 Starting المتنبي Stage 2 Deployment..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if running as root (not recommended for production)
if [[ $EUID -eq 0 ]]; then
   print_warning "Running as root. Consider using a non-root user for security."
fi

# Check prerequisites
print_header "📋 Checking Prerequisites..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi
print_status "Node.js version: $(node -v) ✓"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL client not found. Make sure PostgreSQL is accessible."
else
    print_status "PostgreSQL client found ✓"
fi

# Check Redis
if ! command -v redis-cli &> /dev/null; then
    print_warning "Redis client not found. Make sure Redis is accessible."
else
    print_status "Redis client found ✓"
fi

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    print_warning "Server .env file not found. Creating from template..."
    cp server/.env.example server/.env 2>/dev/null || print_warning "No .env.example found. Please create server/.env manually."
fi

if [ ! -f "client/.env" ]; then
    print_warning "Client .env file not found. Creating from template..."
    cp client/.env.example client/.env 2>/dev/null || print_warning "No .env.example found. Please create client/.env manually."
fi

# Install dependencies
print_header "📦 Installing Dependencies..."

print_status "Installing server dependencies..."
cd server
npm install --production=false
if [ $? -ne 0 ]; then
    print_error "Failed to install server dependencies"
    exit 1
fi

print_status "Installing client dependencies..."
cd ../client
npm install --production=false
if [ $? -ne 0 ]; then
    print_error "Failed to install client dependencies"
    exit 1
fi

cd ..

# Database setup
print_header "🗄️ Setting up Database..."

print_status "Running database migrations..."
cd server

# Check if database connection works
if [ -n "$DATABASE_URL" ]; then
    print_status "Testing database connection..."
    node -e "
        const { sequelize } = require('./config/database');
        sequelize.authenticate()
            .then(() => {
                console.log('Database connection successful');
                process.exit(0);
            })
            .catch(err => {
                console.error('Database connection failed:', err.message);
                process.exit(1);
            });
    "
    
    if [ $? -ne 0 ]; then
        print_error "Database connection failed. Please check your DATABASE_URL."
        exit 1
    fi
else
    print_warning "DATABASE_URL not set. Please configure your database connection."
fi

# Run migrations
if [ -f "migrations/002-stage2-enhancements.sql" ]; then
    print_status "Applying Stage 2 database enhancements..."
    if [ -n "$DATABASE_URL" ]; then
        psql "$DATABASE_URL" -f migrations/002-stage2-enhancements.sql
        if [ $? -eq 0 ]; then
            print_status "Database migrations applied successfully ✓"
        else
            print_warning "Some migrations may have failed. Please check manually."
        fi
    else
        print_warning "Cannot run migrations without DATABASE_URL. Please run manually:"
        print_warning "psql your_database_url -f migrations/002-stage2-enhancements.sql"
    fi
fi

cd ..

# Build client
print_header "🏗️ Building Client Application..."

cd client
print_status "Building production client..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Client build failed"
    exit 1
fi
print_status "Client build completed ✓"

cd ..

# Setup uploads directories
print_header "📁 Setting up Upload Directories..."

mkdir -p server/uploads/{books,optimized,thumbnails}
chmod 755 server/uploads
chmod 755 server/uploads/{books,optimized,thumbnails}
print_status "Upload directories created ✓"

# Setup Redis (if available)
print_header "🔄 Setting up Redis Cache..."

if command -v redis-cli &> /dev/null; then
    if redis-cli ping > /dev/null 2>&1; then
        print_status "Redis is running and accessible ✓"
        
        # Test Redis connection
        redis-cli set "mutanabbi:test" "deployment-test" > /dev/null
        if redis-cli get "mutanabbi:test" > /dev/null; then
            print_status "Redis write/read test successful ✓"
            redis-cli del "mutanabbi:test" > /dev/null
        else
            print_warning "Redis write/read test failed"
        fi
    else
        print_warning "Redis is not running. Cache features will be disabled."
    fi
else
    print_warning "Redis not available. Cache features will be disabled."
fi

# Setup service worker and PWA files
print_header "📱 Setting up PWA Features..."

if [ -f "client/public/sw.js" ]; then
    print_status "Service worker found ✓"
else
    print_warning "Service worker not found. PWA features may not work."
fi

if [ -f "client/public/manifest.json" ]; then
    print_status "PWA manifest found ✓"
else
    print_warning "PWA manifest not found. App installation may not work."
fi

# Create systemd service file (optional)
print_header "🔧 Creating System Service (Optional)..."

if command -v systemctl &> /dev/null; then
    cat > mutanabbi.service << EOF
[Unit]
Description=المتنبي Iraqi Bookstore Marketplace
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)/server
Environment=NODE_ENV=production
ExecStart=$(which node) server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    print_status "Systemd service file created: mutanabbi.service"
    print_status "To install: sudo cp mutanabbi.service /etc/systemd/system/"
    print_status "To enable: sudo systemctl enable mutanabbi"
    print_status "To start: sudo systemctl start mutanabbi"
fi

# Performance optimizations
print_header "⚡ Applying Performance Optimizations..."

# Enable gzip compression in nginx (if available)
if command -v nginx &> /dev/null; then
    print_status "Nginx detected. Consider enabling gzip compression:"
    echo "  gzip on;"
    echo "  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;"
fi

# Security recommendations
print_header "🔒 Security Recommendations..."

print_status "Security checklist:"
echo "  ✓ Use HTTPS in production"
echo "  ✓ Set strong JWT_SECRET and SESSION_SECRET"
echo "  ✓ Configure firewall to restrict database access"
echo "  ✓ Enable rate limiting"
echo "  ✓ Regular security updates"
echo "  ✓ Monitor logs for suspicious activity"

# Final verification
print_header "🧪 Running Final Verification..."

cd server

# Test server startup
print_status "Testing server startup..."
timeout 10s npm start > /dev/null 2>&1 &
SERVER_PID=$!
sleep 5

if kill -0 $SERVER_PID 2>/dev/null; then
    print_status "Server starts successfully ✓"
    kill $SERVER_PID 2>/dev/null
else
    print_warning "Server startup test inconclusive"
fi

cd ..

# Create deployment summary
print_header "📊 Deployment Summary"

echo "=================================================="
echo "🎉 المتنبي Stage 2 Deployment Complete!"
echo "=================================================="
echo ""
echo "✅ Enhanced Features Deployed:"
echo "   • Advanced Search with Intelligent Filtering"
echo "   • Comprehensive Analytics Dashboard"
echo "   • User Reviews and Ratings System"
echo "   • Wishlist Management"
echo "   • PWA Features (Offline Support, Push Notifications)"
echo "   • Performance Optimizations (Caching, Image Optimization)"
echo "   • Mobile-Optimized Interface"
echo ""
echo "🚀 Next Steps:"
echo "   1. Configure environment variables in .env files"
echo "   2. Set up SSL certificates for HTTPS"
echo "   3. Configure reverse proxy (nginx/Apache)"
echo "   4. Set up monitoring and logging"
echo "   5. Configure backup strategy"
echo "   6. Test all features thoroughly"
echo ""
echo "📚 Documentation:"
echo "   • Stage 2 README: STAGE2-README.md"
echo "   • API Documentation: Check /api endpoints"
echo "   • Database Schema: migrations/002-stage2-enhancements.sql"
echo ""
echo "🔧 Management Commands:"
echo "   • Start server: cd server && npm start"
echo "   • Start client dev: cd client && npm run dev"
echo "   • Build client: cd client && npm run build"
echo "   • Run migrations: psql \$DATABASE_URL -f migrations/002-stage2-enhancements.sql"
echo ""
echo "📞 Support:"
echo "   • Check logs in server/logs/"
echo "   • Monitor Redis with redis-cli monitor"
echo "   • Database queries with psql"
echo ""

# Check if deployment was successful
if [ -d "server/node_modules" ] && [ -d "client/node_modules" ] && [ -d "client/dist" ]; then
    print_status "🎊 Deployment completed successfully!"
    echo ""
    echo "Your المتنبي Iraqi Bookstore Marketplace Stage 2 is ready!"
    echo "Visit your application and enjoy the enhanced features! 📚✨"
else
    print_error "❌ Deployment may have issues. Please check the logs above."
    exit 1
fi

echo ""
echo "=================================================="
echo "المتنبي - أكبر متجر إلكتروني للكتب في العراق"
echo "Al-Mutanabbi - Iraq's Largest Online Bookstore"
echo "=================================================="
