# 🚀 Hostinger Deployment Guide for المتنبي Bookstore Platform

This comprehensive guide will walk you through deploying your Al-Mutanabbi Iraqi bookstore marketplace to Hostinger using GitHub.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Hostinger Setup](#hostinger-setup)
3. [Database Configuration](#database-configuration)
4. [GitHub Repository Setup](#github-repository-setup)
5. [Environment Configuration](#environment-configuration)
6. [Deployment Methods](#deployment-methods)
7. [Post-Deployment Steps](#post-deployment-steps)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before deploying, ensure you have:

- ✅ Hostinger hosting account (VPS or Business plan recommended for Node.js)
- ✅ Domain name configured in Hostinger
- ✅ GitHub account
- ✅ SSH access to your Hostinger server
- ✅ PostgreSQL database (available in Hostinger)
- ✅ Node.js 16+ and npm installed on Hostinger server

---

## 🏗️ Hostinger Setup

### Step 1: Access Your Hostinger Control Panel

1. Log in to your Hostinger account
2. Navigate to your hosting dashboard
3. Select your hosting plan

### Step 2: Enable SSH Access

1. Go to **Advanced** → **SSH Access**
2. Enable SSH access
3. Note your SSH credentials:
   - **Host**: your-server-ip or ssh.yourdomain.com
   - **Port**: 22 (default)
   - **Username**: your-username
   - **Password**: your-password

### Step 3: Install Node.js (if not installed)

SSH into your server and run:

```bash
# Check if Node.js is installed
node --version
npm --version

# If not installed, install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally for process management
sudo npm install -g pm2
```

---

## 🗄️ Database Configuration

### Step 1: Create PostgreSQL Database

1. In Hostinger control panel, go to **Databases** → **PostgreSQL**
2. Click **Create Database**
3. Fill in the details:
   - **Database Name**: almutanabbi_db
   - **Username**: almutanabbi_user
   - **Password**: [Generate a strong password]
4. Note down all credentials

### Step 2: Access Database via phpPgAdmin

1. Click on **phpPgAdmin** in your database panel
2. Log in with your database credentials
3. Your database is ready for use

---

## 📦 GitHub Repository Setup

### Step 1: Initialize Git Repository (if not done)

```bash
# In your project root directory
git init
git add .
git commit -m "Initial commit - Al-Mutanabbi Bookstore Platform"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click **New Repository**
3. Name it: `almutanabbi-bookstore`
4. Keep it **Private** (recommended for production code)
5. Don't initialize with README (you already have one)
6. Click **Create Repository**

### Step 3: Push Code to GitHub

```bash
# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/almutanabbi-bookstore.git

# Push code
git branch -M main
git push -u origin main
```

### Step 4: Configure GitHub Secrets (for CI/CD)

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `FTP_SERVER` | Your Hostinger FTP server | `ftp.yourdomain.com` |
| `FTP_USERNAME` | Your FTP username | `your-ftp-username` |
| `FTP_PASSWORD` | Your FTP password | `your-ftp-password` |
| `VITE_API_URL` | Your API URL | `https://yourdomain.com/api` |

---

## ⚙️ Environment Configuration

### Step 1: Create Server Environment File

SSH into your Hostinger server and create `.env` file:

```bash
cd /home/your-username/public_html
nano server/.env
```

Add the following configuration (replace with your actual values):

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=almutanabbi_db
DB_USER=almutanabbi_user
DB_PASSWORD=your_database_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-CHANGE-THIS-TO-RANDOM-STRING
JWT_EXPIRES_IN=7d

# File Upload Configuration
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880

# CORS Configuration
CLIENT_URL=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (Optional)
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@yourdomain.com
```

**Important**: Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 2: Create Client Environment File

```bash
nano client/.env
```

Add:

```env
VITE_API_URL=https://yourdomain.com/api
VITE_APP_NAME=المتنبي
VITE_APP_VERSION=1.0.0
```

---

## 🚀 Deployment Methods

You have three deployment options:

### Method 1: Automated Deployment via GitHub Actions (Recommended)

This method automatically deploys when you push to the main branch.

1. **Ensure GitHub secrets are configured** (see GitHub Repository Setup)
2. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```
3. **Monitor deployment**:
   - Go to your repository on GitHub
   - Click **Actions** tab
   - Watch the deployment progress

### Method 2: Manual Deployment via FTP

1. **Build the project locally**:
   ```bash
   # Run the deployment script
   ./deploy.bat  # Windows
   # or
   ./deploy.sh   # Linux/Mac
   ```

2. **Upload files via FTP**:
   - Use FileZilla or any FTP client
   - Connect to your Hostinger FTP
   - Upload all files to `/public_html/`
   - Exclude: `node_modules/`, `.git/`, `.env.local`

3. **SSH into server and complete setup**:
   ```bash
   ssh your-username@your-server-ip
   cd /home/your-username/public_html
   
   # Install dependencies
   cd server && npm install --production && cd ..
   cd client && npm install && npm run build && cd ..
   
   # Run migrations
   cd server && npm run migrate && cd ..
   
   # Start application with PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Method 3: Direct Git Deployment on Server

1. **SSH into your Hostinger server**:
   ```bash
   ssh your-username@your-server-ip
   ```

2. **Clone repository**:
   ```bash
   cd /home/your-username
   git clone https://github.com/YOUR_USERNAME/almutanabbi-bookstore.git
   cd almutanabbi-bookstore
   ```

3. **Set up environment files** (as described in Environment Configuration)

4. **Run deployment script**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

5. **Start application**:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

---

## ✅ Post-Deployment Steps

### 1. Verify Application is Running

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs almutanabbi-server

# Check if server is responding
curl http://localhost:3000/api/health
```

### 2. Configure Domain

1. In Hostinger control panel, go to **Domains**
2. Point your domain to your server IP
3. Wait for DNS propagation (5-30 minutes)

### 3. Set Up SSL Certificate (HTTPS)

1. In Hostinger control panel, go to **SSL**
2. Enable **Free SSL Certificate** (Let's Encrypt)
3. Force HTTPS redirect

### 4. Configure Reverse Proxy

If using Apache, the `.htaccess` file is already configured. Verify it's working:

```bash
# Test your domain
curl https://yourdomain.com/api/health
```

### 5. Run Database Migrations

```bash
cd /home/your-username/public_html/server
npm run migrate
```

### 6. Create Admin Account

```bash
cd /home/your-username/public_html/server
node scripts/create-admin.js
```

### 7. Test the Application

1. Visit `https://yourdomain.com`
2. Test user registration
3. Test login functionality
4. Test book browsing
5. Test library owner features
6. Test admin dashboard

---

## 🔍 Troubleshooting

### Issue: Application not starting

**Solution**:
```bash
# Check PM2 logs
pm2 logs almutanabbi-server --lines 100

# Restart application
pm2 restart almutanabbi-server

# Check Node.js version
node --version  # Should be 16+
```

### Issue: Database connection error

**Solution**:
1. Verify database credentials in `.env`
2. Check if PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```
3. Test database connection:
   ```bash
   cd server
   node -e "require('./config/database').sequelize.authenticate().then(() => console.log('DB OK')).catch(e => console.error(e))"
   ```

### Issue: 502 Bad Gateway

**Solution**:
1. Check if Node.js server is running: `pm2 status`
2. Verify port 3000 is not blocked
3. Check `.htaccess` configuration
4. Restart Apache: `sudo systemctl restart apache2`

### Issue: File upload not working

**Solution**:
```bash
# Set proper permissions
chmod -R 755 /home/your-username/public_html/server/uploads
chown -R your-username:your-username /home/your-username/public_html/server/uploads
```

### Issue: CORS errors

**Solution**:
1. Verify `CLIENT_URL` in server `.env` matches your domain
2. Check CORS configuration in `server/server.js`
3. Ensure `.htaccess` headers are correct

### Issue: Build fails

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

---

## 📊 Monitoring and Maintenance

### Monitor Application

```bash
# View real-time logs
pm2 logs almutanabbi-server

# Monitor CPU and memory
pm2 monit

# View application metrics
pm2 show almutanabbi-server
```

### Backup Database

```bash
# Create backup
pg_dump -U almutanabbi_user almutanabbi_db > backup_$(date +%Y%m%d).sql

# Restore backup
psql -U almutanabbi_user almutanabbi_db < backup_20240101.sql
```

### Update Application

```bash
# Pull latest changes
cd /home/your-username/public_html
git pull origin main

# Install dependencies
cd server && npm install --production && cd ..
cd client && npm install && npm run build && cd ..

# Run migrations
cd server && npm run migrate && cd ..

# Restart application
pm2 restart almutanabbi-server
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** to Git
2. **Use strong passwords** for database and JWT secret
3. **Enable HTTPS** (SSL certificate)
4. **Keep dependencies updated**: `npm audit fix`
5. **Limit file upload sizes** in `.env`
6. **Use rate limiting** (already configured)
7. **Regular backups** of database and uploads
8. **Monitor logs** for suspicious activity

---

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review PM2 logs: `pm2 logs`
3. Check server error logs: `/var/log/apache2/error.log`
4. Contact Hostinger support for server-specific issues

---

## 🎉 Congratulations!

Your المتنبي Iraqi Bookstore Platform is now deployed and running on Hostinger!

### Quick Links

- **Website**: https://yourdomain.com
- **Admin Panel**: https://yourdomain.com/admin
- **API Documentation**: https://yourdomain.com/api/docs

---

## 📝 Deployment Checklist

- [ ] Hostinger account set up
- [ ] Domain configured
- [ ] SSH access enabled
- [ ] Node.js and PM2 installed
- [ ] PostgreSQL database created
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] GitHub secrets configured
- [ ] Environment files created
- [ ] Application deployed
- [ ] Database migrations run
- [ ] SSL certificate enabled
- [ ] Admin account created
- [ ] Application tested
- [ ] Monitoring set up
- [ ] Backup strategy implemented

---

**Last Updated**: November 2024  
**Version**: 1.0.0
