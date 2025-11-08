# 🚀 GitHub Deployment Guide for al-mutanabbi.online

## Using GitHub Instead of FileZilla

This guide shows you how to deploy your المتنبي marketplace using **GitHub** instead of manually uploading files via FileZilla.

---

## ✅ Benefits of GitHub Deployment

- ✅ **Faster updates** - Just push code and pull on server
- ✅ **Version control** - Track all changes
- ✅ **Easier rollback** - Revert to previous versions easily
- ✅ **No manual file upload** - Automated process
- ✅ **Team collaboration** - Multiple developers can work together

---

## 📋 DEPLOYMENT PROCESS WITH GITHUB

### STEP 1: Prepare Your Repository (5 minutes)

1. **Create .gitignore file** (if not exists)

I'll create this for you to exclude sensitive files:

```gitignore
# Dependencies
node_modules/
client/node_modules/
server/node_modules/

# Environment files (IMPORTANT!)
.env
.env.local
.env.production
.env.development
server/.env
server/.env.production
client/.env.production

# Build files
client/dist/
client/build/
deployment-package/

# Logs
logs/
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/

# Uploads (don't commit user uploads)
server/uploads/
uploads/

# Temporary files
*.tmp
*.temp

# Backup files
backups/
*.sql
```

2. **Create a separate .env.example file**

This is a template without sensitive data:

```env
# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

# JWT Configuration
JWT_SECRET=generate_new_secret_here
JWT_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@al-mutanabbi.online

# Server Configuration
PORT=3000
HOST=0.0.0.0
CLIENT_URL=https://al-mutanabbi.online
DOMAIN=al-mutanabbi.online

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/home/your_username/public_html/uploads

# Session Configuration
SESSION_SECRET=generate_new_secret_here

# Logging
LOG_LEVEL=info
LOG_FILE=/home/your_username/logs/app.log
```

---

### STEP 2: Push to GitHub (5 minutes)

1. **Initialize Git repository** (if not already done)

```bash
cd d:\projects\book-store-platforms
git init
```

2. **Add all files**

```bash
git add .
```

3. **Commit your code**

```bash
git commit -m "Initial commit - المتنبي marketplace with MySQL"
```

4. **Create GitHub repository**

- Go to: https://github.com/new
- Repository name: `book-store-platforms` or `almutanabbi-marketplace`
- Set to **Private** (recommended for production code)
- Don't initialize with README (you already have code)
- Click "Create repository"

5. **Push to GitHub**

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/book-store-platforms.git
git branch -M main
git push -u origin main
```

---

### STEP 3: Setup Hostinger Server (10 minutes)

1. **Connect to Hostinger via SSH**

```bash
# Windows (PowerShell)
ssh u628720712@31.170.161.140

# Or use PuTTY on Windows
```

Your credentials:
- Host: Your Hostinger server IP or domain
- Username: `u628720712`
- Password: Your Hostinger password
- Port: 22

2. **Install Git on server** (if not installed)

```bash
# Check if git is installed
git --version

# If not installed, contact Hostinger support to enable it
# Most Hostinger plans have git pre-installed
```

3. **Generate SSH key for GitHub** (recommended for easier access)

```bash
# On Hostinger server
ssh-keygen -t ed25519 -C "eyadqaasim@gmail.com"

# Press Enter for default location
# Press Enter twice for no passphrase (or set one if you prefer)

# Display your public key
cat ~/.ssh/id_ed25519.pub
```

4. **Add SSH key to GitHub**

- Copy the output from the `cat` command
- Go to: https://github.com/settings/keys
- Click "New SSH key"
- Title: "Hostinger Server"
- Paste the key
- Click "Add SSH key"

---

### STEP 4: Clone Repository on Server (5 minutes)

1. **Navigate to your home directory**

```bash
cd /home/u628720712
```

2. **Clone your repository**

```bash
# Using SSH (recommended if you added SSH key)
git clone git@github.com:YOUR_USERNAME/book-store-platforms.git

# Or using HTTPS (will ask for credentials)
git clone https://github.com/YOUR_USERNAME/book-store-platforms.git
```

3. **Navigate to the project**

```bash
cd book-store-platforms
```

---

### STEP 5: Setup Server Environment (10 minutes)

1. **Create .env file on server**

```bash
cd /home/u628720712/book-store-platforms/server
nano .env
```

2. **Paste your production environment variables**

Copy the content from your local `server/.env.production` file:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

CLIENT_URL=https://al-mutanabbi.online
DOMAIN=al-mutanabbi.online

DB_HOST=localhost
DB_PORT=3306
DB_NAME=mutanabbi
DB_USER=mutanabbi123
DB_PASSWORD=80giS~|~sOk#

JWT_SECRET=987cd50d8c143cea9556ed4da1addec7a91c75d2a7953530ee8b892958ff61fa66d88672d0616522a941ed69d93778363961948a2db8b46ead0819b4c272f521
JWT_EXPIRES_IN=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=eyadqaasim@gmail.com
EMAIL_PASSWORD=80giS~|~sOk#
EMAIL_FROM=noreply@al-mutanabbi.online

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200

MAX_FILE_SIZE=10485760
UPLOAD_PATH=/home/u628720712/public_html/uploads

SESSION_SECRET=dfd30aa9696591e0c1ddeba68b089d8059659c3d98fdf8fc867c57a4ff74f124ebe1024a4a3b713892118ffacb6b535c533e74d57753e8320a9b93d7dedda95d

ALLOWED_ORIGINS=https://al-mutanabbi.online,https://www.al-mutanabbi.online

HELMET_ENABLED=true

LOG_LEVEL=info
LOG_FILE=/home/u628720712/logs/app.log

ADMIN_EMAIL=admin@al-mutanabbi.online

BACKUP_ENABLED=true
BACKUP_PATH=/home/u628720712/backups
```

3. **Save and exit**

- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter`

4. **Install server dependencies**

```bash
cd /home/u628720712/book-store-platforms/server
npm install --production
```

5. **Run database migrations**

```bash
node migrations/run-migrations.js
```

---

### STEP 6: Build and Deploy Client (10 minutes)

1. **Build client on server**

```bash
cd /home/u628720712/book-store-platforms/client
npm install
npm run build
```

2. **Copy built files to public_html**

```bash
# Remove old files (if any)
rm -rf /home/u628720712/public_html/*

# Copy new build
cp -r /home/u628720712/book-store-platforms/client/dist/* /home/u628720712/public_html/

# Copy .htaccess
cp /home/u628720712/book-store-platforms/.htaccess /home/u628720712/public_html/
```

3. **Create necessary directories**

```bash
mkdir -p /home/u628720712/public_html/uploads
mkdir -p /home/u628720712/public_html/uploads/avatars
mkdir -p /home/u628720712/public_html/uploads/bookstores
mkdir -p /home/u628720712/public_html/uploads/books
mkdir -p /home/u628720712/public_html/uploads/library-books
mkdir -p /home/u628720712/logs
mkdir -p /home/u628720712/backups

# Set permissions
chmod -R 777 /home/u628720712/public_html/uploads
```

---

### STEP 7: Setup Node.js Application (5 minutes)

1. **Go to Hostinger Control Panel**
   - Navigate to: Advanced → Node.js
   - Click "Create Application"

2. **Configure:**
   - **Application root**: `/home/u628720712/book-store-platforms/server`
   - **Application startup file**: `server.js`
   - **Node.js version**: 16.x or higher
   - **Application mode**: Production
   - **Application URL**: `al-mutanabbi.online`

3. **Start the application**

---

### STEP 8: Install SSL & Test (5 minutes)

1. **Install SSL certificate**
   - Go to: Security → SSL
   - Install Let's Encrypt for `al-mutanabbi.online`
   - Enable "Force HTTPS"

2. **Test your website**
   - Visit: https://al-mutanabbi.online
   - Test all features

---

## 🔄 UPDATING YOUR WEBSITE (FUTURE DEPLOYMENTS)

This is where GitHub really shines! Updates are super easy:

### On Your Local Machine:

1. **Make your changes**
2. **Commit and push**

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

### On Hostinger Server:

1. **SSH into server**

```bash
ssh u628720712@your-server-ip
```

2. **Pull latest changes**

```bash
cd /home/u628720712/book-store-platforms
git pull origin main
```

3. **Update dependencies** (if package.json changed)

```bash
cd server
npm install --production
```

4. **Rebuild client** (if frontend changed)

```bash
cd ../client
npm install
npm run build
cp -r dist/* /home/u628720712/public_html/
```

5. **Restart Node.js application**

```bash
# In Hostinger Node.js panel, click "Restart"
# Or if using PM2:
pm2 restart almutanabbi
```

**That's it! Your changes are live!** 🎉

---

## 📜 Automated Deployment Script

Create this script on your server for even faster updates:

```bash
nano /home/u628720712/deploy.sh
```

Paste this:

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Navigate to project
cd /home/u628720712/book-store-platforms

# Pull latest changes
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Update server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install --production

# Run migrations (if any new ones)
echo "🗄️ Running database migrations..."
node migrations/run-migrations.js

# Build client
echo "🔨 Building client..."
cd ../client
npm install
npm run build

# Deploy client
echo "📤 Deploying client to public_html..."
cp -r dist/* /home/u628720712/public_html/

# Copy .htaccess
cp ../.htaccess /home/u628720712/public_html/

# Restart Node.js (you'll need to do this manually in hPanel or use PM2)
echo "♻️ Please restart Node.js application in Hostinger panel"

echo "✅ Deployment complete!"
echo "Visit: https://al-mutanabbi.online"
```

Make it executable:

```bash
chmod +x /home/u628720712/deploy.sh
```

**Now you can deploy with one command:**

```bash
/home/u628720712/deploy.sh
```

---

## 🔐 Security Best Practices

### ⚠️ NEVER commit these files:

- ❌ `.env` files (contain passwords!)
- ❌ `node_modules/` (too large)
- ❌ `uploads/` (user data)
- ❌ Database backups
- ❌ Log files

### ✅ Always commit:

- ✅ Source code
- ✅ `.env.example` (template without secrets)
- ✅ Documentation
- ✅ Configuration files (without secrets)

---

## 📊 Comparison: FileZilla vs GitHub

| Aspect | FileZilla | GitHub |
|--------|-----------|--------|
| **Initial Setup** | Easier | Slightly more complex |
| **Updates** | Manual upload each time | `git pull` - Done! |
| **Speed** | Slow for large files | Fast (only changes) |
| **Version Control** | None | Full history |
| **Rollback** | Manual | `git checkout` |
| **Team Work** | Difficult | Easy |
| **Automation** | None | Can automate |
| **Best For** | One-time deploy | Active development |

---

## 🎯 Recommended Workflow

### Initial Deployment:
Use this GitHub guide (you're reading it!)

### Regular Updates:
1. Make changes locally
2. Test locally
3. Commit and push to GitHub
4. SSH into server
5. Run: `/home/u628720712/deploy.sh`
6. Restart Node.js app
7. Done! ✅

### Emergency Rollback:
```bash
cd /home/u628720712/book-store-platforms
git log  # Find the commit you want
git checkout COMMIT_HASH
/home/u628720712/deploy.sh
```

---

## 🆘 Troubleshooting

### Problem: "Permission denied (publickey)"

**Solution:**
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/YOUR_USERNAME/book-store-platforms.git
```

### Problem: "Git not found"

**Solution:**
Contact Hostinger support to enable Git on your account.

### Problem: "npm: command not found"

**Solution:**
Node.js should be available through Hostinger's Node.js panel. Make sure you've created the Node.js application first.

### Problem: Merge conflicts

**Solution:**
```bash
# Stash local changes
git stash

# Pull latest
git pull origin main

# Reapply your changes
git stash pop
```

---

## ✅ Deployment Checklist (GitHub Method)

- [ ] Create .gitignore file
- [ ] Create .env.example (without secrets)
- [ ] Push code to GitHub (private repo)
- [ ] SSH into Hostinger server
- [ ] Generate SSH key and add to GitHub
- [ ] Clone repository on server
- [ ] Create .env file on server
- [ ] Install server dependencies
- [ ] Run migrations
- [ ] Build and deploy client
- [ ] Setup Node.js application
- [ ] Install SSL certificate
- [ ] Test website
- [ ] Create deploy.sh script for future updates

---

## 🎉 Summary

**GitHub Method is Better For:**
- ✅ Active development
- ✅ Multiple developers
- ✅ Frequent updates
- ✅ Version control
- ✅ Easy rollbacks

**FileZilla Method is Better For:**
- ✅ One-time deployment
- ✅ No Git knowledge needed
- ✅ Simple file transfers

**Recommendation:** Use GitHub! It's more professional and makes updates much easier.

---

## 📞 Quick Commands Reference

```bash
# Update website (on server)
cd /home/u628720712/book-store-platforms
git pull origin main
/home/u628720712/deploy.sh

# View logs
tail -f /home/u628720712/logs/app.log

# Restart app (in Hostinger panel or PM2)
pm2 restart almutanabbi

# Check Git status
git status

# View commit history
git log --oneline

# Rollback to previous version
git checkout COMMIT_HASH
```

---

**Your المتنبي marketplace is now deployed with GitHub! 🚀📚**

Updates are now as simple as: `git push` → `git pull` → `deploy.sh` → Done!
