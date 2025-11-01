#!/bin/bash
# Deployment script for al-mutanabbi.online
# Run this script to prepare files for Hostinger deployment

echo "🚀 Starting deployment preparation for al-mutanabbi.online..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "HOSTINGER-DEPLOYMENT-GUIDE.md" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Step 1: Clean previous builds
echo -e "${YELLOW}📦 Cleaning previous builds...${NC}"
rm -rf client/dist
rm -rf deployment-package

# Step 2: Install dependencies
echo -e "${YELLOW}📥 Installing dependencies...${NC}"

# Server dependencies
echo "Installing server dependencies..."
cd server
npm install --production
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install server dependencies${NC}"
    exit 1
fi
cd ..

# Client dependencies
echo "Installing client dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install client dependencies${NC}"
    exit 1
fi
cd ..

# Step 3: Build client
echo -e "${YELLOW}🔨 Building client for production...${NC}"
cd client
npm run build:prod
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to build client${NC}"
    exit 1
fi
cd ..

# Step 4: Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
mkdir -p deployment-package/public_html
mkdir -p deployment-package/server
mkdir -p deployment-package/logs

# Copy client build to public_html
echo "Copying client files..."
cp -r client/dist/* deployment-package/public_html/
cp .htaccess deployment-package/public_html/

# Copy server files
echo "Copying server files..."
rsync -av --exclude='node_modules' --exclude='.env' --exclude='uploads' server/ deployment-package/server/

# Copy production env file
cp server/.env.production deployment-package/server/.env.example

# Create necessary directories
mkdir -p deployment-package/public_html/uploads
mkdir -p deployment-package/public_html/uploads/avatars
mkdir -p deployment-package/public_html/uploads/bookstores
mkdir -p deployment-package/public_html/uploads/books
mkdir -p deployment-package/public_html/uploads/library-books

# Step 5: Create deployment instructions
cat > deployment-package/DEPLOY-INSTRUCTIONS.txt << 'EOF'
=================================================================
DEPLOYMENT INSTRUCTIONS FOR al-mutanabbi.online
=================================================================

1. UPLOAD FILES:
   - Upload contents of 'public_html/' to your Hostinger public_html directory
   - Upload 'server/' folder to /home/your_username/server/
   - Create 'logs/' directory at /home/your_username/logs/

2. CONFIGURE ENVIRONMENT:
   - Rename server/.env.example to server/.env
   - Edit server/.env and fill in your database credentials and secrets
   - Generate secrets using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

3. INSTALL SERVER DEPENDENCIES:
   SSH into your server and run:
   cd /home/your_username/server
   npm install --production

4. SETUP DATABASE:
   - Create PostgreSQL database in Hostinger control panel
   - Run migrations: node migrations/run-migrations.js

5. CONFIGURE NODE.JS:
   - Go to Hostinger control panel → Node.js
   - Create application pointing to server/server.js
   - Start the application

6. VERIFY:
   - Visit https://al-mutanabbi.online
   - Test login, registration, and all features

For detailed instructions, see HOSTINGER-DEPLOYMENT-GUIDE.md

=================================================================
EOF

# Step 6: Create archive
echo -e "${YELLOW}📦 Creating deployment archive...${NC}"
cd deployment-package
tar -czf ../almutanabbi-deployment-$(date +%Y%m%d-%H%M%S).tar.gz .
cd ..

# Step 7: Summary
echo -e "${GREEN}✅ Deployment package created successfully!${NC}"
echo ""
echo "📦 Deployment files are ready in: deployment-package/"
echo "📦 Archive created: almutanabbi-deployment-*.tar.gz"
echo ""
echo "Next steps:"
echo "1. Review HOSTINGER-DEPLOYMENT-GUIDE.md for detailed instructions"
echo "2. Configure server/.env with your database credentials"
echo "3. Upload files to Hostinger via SFTP"
echo "4. Follow the deployment guide to complete setup"
echo ""
echo -e "${GREEN}🎉 Good luck with your deployment!${NC}"
