# 📦 Deployment Files Overview

This document explains all the deployment-related files created for your المتنبي bookstore platform.

## 📁 File Structure

```
book-store-platforms/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD workflow
├── server/
│   ├── package.json                # Server dependencies (UPDATED)
│   ├── .env.example.production     # Production environment template
│   ├── routes/
│   │   └── health.js               # Health check endpoints
│   └── scripts/
│       └── create-admin.js         # Admin user creation script
├── client/
│   ├── package.json                # Client dependencies (UPDATED)
│   └── .env.example.production     # Client production environment template
├── .gitignore                      # Git ignore rules
├── .htaccess                       # Apache configuration for Hostinger
├── ecosystem.config.js             # PM2 process manager configuration
├── deploy.sh                       # Linux/Mac deployment script
├── deploy.bat                      # Windows deployment script
├── HOSTINGER-DEPLOYMENT-GUIDE.md   # Complete deployment guide
└── DEPLOYMENT-QUICK-START.md       # Quick reference guide
```

## 📄 File Descriptions

### 1. `.github/workflows/deploy.yml`
**Purpose**: Automated CI/CD pipeline using GitHub Actions

**Features**:
- Triggers on push to main/master branch
- Builds client application
- Deploys to Hostinger via FTP
- Excludes unnecessary files

**Required GitHub Secrets**:
- `FTP_SERVER`: Your Hostinger FTP server
- `FTP_USERNAME`: Your FTP username
- `FTP_PASSWORD`: Your FTP password
- `VITE_API_URL`: Your API URL

### 2. `server/package.json` (UPDATED)
**Purpose**: Proper Node.js package configuration

**Changes Made**:
- Added all required dependencies
- Added proper scripts (start, dev, migrate, seed)
- Added engines specification (Node.js 16+)
- Backed up old file as `package.json.backup`

**Key Scripts**:
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run migrate    # Run database migrations
npm run seed       # Seed database with initial data
```

### 3. `client/package.json` (UPDATED)
**Purpose**: Client application configuration

**Changes Made**:
- Added `start` script for production
- Added engines specification

### 4. `.gitignore`
**Purpose**: Prevent sensitive files from being committed

**Excludes**:
- `node_modules/`
- `.env` files
- Build outputs
- Logs
- Uploads
- Debug/test files
- IDE files

### 5. `.htaccess`
**Purpose**: Apache web server configuration

**Features**:
- Force HTTPS redirect
- Proxy API requests to Node.js server (port 3000)
- Serve React app for frontend routes
- Security headers
- Compression
- Cache control
- Protect sensitive files

### 6. `ecosystem.config.js`
**Purpose**: PM2 process manager configuration

**Features**:
- Auto-restart on crashes
- Memory limit (1GB)
- Log management
- Production environment variables

**Usage**:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 7. `deploy.sh` / `deploy.bat`
**Purpose**: Automated deployment scripts

**What They Do**:
1. Check environment files exist
2. Install server dependencies
3. Install and build client
4. Run database migrations
5. Create necessary directories
6. Set permissions (Linux/Mac only)

**Usage**:
```bash
# Linux/Mac
chmod +x deploy.sh
./deploy.sh

# Windows
deploy.bat
```

### 8. `server/.env.example.production`
**Purpose**: Template for production environment variables

**Required Configuration**:
- Database credentials (from Hostinger)
- JWT secret (generate strong random string)
- Domain URL
- Email settings (optional)

**Setup**:
```bash
cp server/.env.example.production server/.env
# Edit server/.env with your actual credentials
```

### 9. `client/.env.example.production`
**Purpose**: Template for client environment variables

**Required Configuration**:
- API URL (your domain)

**Setup**:
```bash
cp client/.env.example.production client/.env
# Edit client/.env with your domain
```

### 10. `server/routes/health.js`
**Purpose**: Health check endpoints for monitoring

**Endpoints**:
- `GET /api/health` - Full health status with database check
- `GET /api/ready` - Readiness probe
- `GET /api/alive` - Liveness probe

**Usage**:
```bash
curl https://yourdomain.com/api/health
```

### 11. `server/scripts/create-admin.js`
**Purpose**: Interactive script to create admin users

**Usage**:
```bash
cd server
node scripts/create-admin.js
```

**Prompts**:
- Username
- Email
- Password
- Password confirmation

### 12. `HOSTINGER-DEPLOYMENT-GUIDE.md`
**Purpose**: Comprehensive step-by-step deployment guide

**Sections**:
- Prerequisites
- Hostinger setup
- Database configuration
- GitHub repository setup
- Environment configuration
- Deployment methods (3 options)
- Post-deployment steps
- Troubleshooting
- Monitoring and maintenance
- Security best practices

### 13. `DEPLOYMENT-QUICK-START.md`
**Purpose**: Quick reference for experienced developers

**Content**:
- 5-minute deployment steps
- Essential commands
- Quick troubleshooting table

## 🚀 Deployment Methods

### Method 1: GitHub Actions (Recommended)
1. Configure GitHub secrets
2. Push to main branch
3. Automatic deployment

### Method 2: Manual FTP
1. Run `deploy.bat` or `deploy.sh`
2. Upload via FTP
3. SSH and run `pm2 start ecosystem.config.js`

### Method 3: Direct Git on Server
1. SSH into server
2. Clone repository
3. Run deployment script
4. Start with PM2

## ✅ Pre-Deployment Checklist

- [ ] Backup old `package.json` files (done automatically)
- [ ] Create `.env` files from examples
- [ ] Update database credentials in `.env`
- [ ] Generate strong JWT secret
- [ ] Configure GitHub secrets
- [ ] Test locally before deploying
- [ ] Create database on Hostinger
- [ ] Configure domain DNS
- [ ] Enable SSL certificate

## 🔧 Post-Deployment Tasks

1. **Verify deployment**:
   ```bash
   curl https://yourdomain.com/api/health
   ```

2. **Run migrations**:
   ```bash
   cd server && npm run migrate
   ```

3. **Create admin user**:
   ```bash
   node scripts/create-admin.js
   ```

4. **Test application**:
   - Visit your domain
   - Test login/registration
   - Test all major features

5. **Monitor logs**:
   ```bash
   pm2 logs almutanabbi-server
   ```

## 🔐 Security Notes

1. **Never commit**:
   - `.env` files
   - `node_modules/`
   - Database credentials
   - API keys

2. **Always use**:
   - HTTPS (SSL certificate)
   - Strong passwords
   - Environment variables for secrets
   - Rate limiting (already configured)

3. **Regular maintenance**:
   - Update dependencies: `npm audit fix`
   - Backup database regularly
   - Monitor logs for errors
   - Review security headers

## 📞 Support

For detailed instructions, see:
- **Full Guide**: [HOSTINGER-DEPLOYMENT-GUIDE.md](./HOSTINGER-DEPLOYMENT-GUIDE.md)
- **Quick Start**: [DEPLOYMENT-QUICK-START.md](./DEPLOYMENT-QUICK-START.md)

## 🎯 Next Steps

1. Read the [HOSTINGER-DEPLOYMENT-GUIDE.md](./HOSTINGER-DEPLOYMENT-GUIDE.md)
2. Set up your Hostinger account
3. Create environment files
4. Choose deployment method
5. Deploy your application!

---

**Created**: November 2024  
**Version**: 1.0.0  
**Platform**: المتنبي Iraqi Bookstore Marketplace
