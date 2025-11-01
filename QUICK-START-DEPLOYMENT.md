# ⚡ Quick Start Deployment Guide
## al-mutanabbi.online - Fast Track to Production

---

## 🎯 Prerequisites (5 minutes)

1. **Hostinger Account** with:
   - Node.js support enabled
   - PostgreSQL database access
   - SSH/SFTP access

2. **Domain**: al-mutanabbi.online (already configured)

3. **Tools Needed**:
   - FileZilla or any SFTP client
   - SSH client (PuTTY for Windows)

---

## 🚀 Deployment in 10 Steps (30 minutes)

### Step 1: Fix Package.json (1 min)
```bash
cd server
del package.json
ren package-fixed.json package.json
cd ..
```

### Step 2: Run Deployment Script (5 min)
```bash
# Windows
.\deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

### Step 3: Create Database (3 min)
1. Login to Hostinger control panel
2. Go to **Databases** → **PostgreSQL**
3. Create database: `almutanabbi_prod`
4. Create user with strong password
5. Note credentials

### Step 4: Configure Environment (3 min)
Edit `deployment-package/server/.env.example`:
```env
DB_HOST=localhost
DB_NAME=almutanabbi_prod
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Generate these:
JWT_SECRET=run_node_crypto_command
SESSION_SECRET=run_node_crypto_command

EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Rename to `.env`:
```bash
cd deployment-package/server
ren .env.example .env
```

### Step 5: Upload Files via SFTP (10 min)
Connect to Hostinger via SFTP:
- **Host**: Your Hostinger IP/domain
- **Username**: Your hosting username
- **Password**: Your hosting password
- **Port**: 21 or 22

Upload:
```
deployment-package/public_html/* → /home/username/public_html/
deployment-package/server/* → /home/username/server/
```

Create directories:
```
/home/username/logs/
/home/username/backups/
```

### Step 6: Setup Node.js App (3 min)
1. Go to Hostinger control panel
2. Navigate to **Advanced** → **Node.js**
3. Click **Create Application**
4. Configure:
   - **Application root**: `/home/username/server`
   - **Application URL**: `al-mutanabbi.online`
   - **Application startup file**: `server.js`
   - **Node.js version**: 16.x or higher
   - **Application mode**: Production

### Step 7: Install Dependencies (2 min)
In Hostinger Node.js terminal or SSH:
```bash
cd /home/username/server
npm install --production
```

### Step 8: Run Database Migrations (2 min)
```bash
cd /home/username/server
node migrations/run-migrations.js
```

### Step 9: Start Application (1 min)
In Hostinger Node.js panel:
- Click **Start Application**

Or via SSH:
```bash
cd /home/username/server
npm start
```

### Step 10: Install SSL & Test (2 min)
1. Go to **Security** → **SSL**
2. Install Let's Encrypt certificate
3. Enable "Force HTTPS"
4. Visit: `https://al-mutanabbi.online`

---

## ✅ Quick Test Checklist

Visit your site and verify:
- [ ] Homepage loads
- [ ] Can register new user
- [ ] Can login
- [ ] Can browse books
- [ ] Images load correctly
- [ ] API responds: `https://al-mutanabbi.online/api/health`

---

## 🔥 Common Quick Fixes

### App won't start?
```bash
# Check logs
cd /home/username/server
cat ../logs/app.log

# Or in Hostinger panel: Node.js → View Logs
```

### Database connection error?
```bash
# Test connection
cd /home/username/server
node -e "require('./config/database').testConnection()"
```

### Images not loading?
```bash
# Fix permissions
chmod -R 777 /home/username/public_html/uploads
```

### API 404 errors?
```bash
# Check .htaccess exists
ls -la /home/username/public_html/.htaccess

# Restart Node.js app
# In Hostinger panel: Node.js → Restart
```

---

## 📱 Quick Commands Reference

### Restart App
```bash
# Via PM2 (if installed)
pm2 restart almutanabbi

# Via Hostinger panel
# Node.js → Restart Application
```

### View Logs
```bash
# Application logs
tail -f /home/username/logs/app.log

# PM2 logs
pm2 logs almutanabbi
```

### Database Backup
```bash
pg_dump -h localhost -U username almutanabbi_prod > backup.sql
```

### Update App
```bash
# 1. Build locally
npm run build:prod

# 2. Upload new files
# Upload client/dist/* to public_html/

# 3. Restart
pm2 restart almutanabbi
```

---

## 🆘 Emergency Contacts

### Check Status
```bash
# Node.js process
ps aux | grep node

# Database
psql -h localhost -U username -d almutanabbi_prod -c "SELECT 1"

# Disk space
df -h
```

### Rollback
```bash
# Restore database
psql -h localhost -U username almutanabbi_prod < backup.sql

# Revert code (if using Git)
git checkout previous-commit
```

---

## 📞 Need Help?

1. **Check logs first**: `/home/username/logs/app.log`
2. **Review full guide**: `HOSTINGER-DEPLOYMENT-GUIDE.md`
3. **Common issues**: `DEPLOYMENT-SUMMARY.md`
4. **Hostinger support**: Available 24/7 in control panel

---

## 🎉 Success!

If you can:
- ✅ Visit https://al-mutanabbi.online
- ✅ Register and login
- ✅ Browse books
- ✅ Upload images

**Congratulations! Your المتنبي marketplace is live! 🚀**

---

## 📝 Post-Deployment Tasks

1. **Create admin account**
2. **Test all features**
3. **Setup automated backups**
4. **Configure monitoring**
5. **Add sample data**
6. **Announce launch!**

---

**Total Time: ~30 minutes**

For detailed explanations, see `HOSTINGER-DEPLOYMENT-GUIDE.md`
