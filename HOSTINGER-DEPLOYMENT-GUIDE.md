# Hostinger Deployment Guide for al-mutanabbi.online
## المتنبي - Iraqi Bookstore Marketplace

This guide will walk you through deploying your المتنبي bookstore marketplace to Hostinger with the domain **al-mutanabbi.online**.

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Hostinger hosting account with Node.js support
- ✅ Domain `al-mutanabbi.online` pointed to your Hostinger server
- ✅ SSH access to your Hostinger server
- ✅ PostgreSQL database access on Hostinger
- ✅ FTP/SFTP client (FileZilla recommended)

---

## 🗄️ Step 1: Database Setup

### 1.1 Create PostgreSQL Database
1. Log in to Hostinger control panel (hPanel)
2. Go to **Databases** → **PostgreSQL Databases**
3. Create a new database:
   - **Database Name**: `almutanabbi_prod`
   - **Username**: Create a new user (e.g., `almutanabbi_user`)
   - **Password**: Generate a strong password
4. Note down the database credentials:
   - Host (usually `localhost` or specific IP)
   - Port (usually `5432`)
   - Database name
   - Username
   - Password

### 1.2 Import Database Schema
1. Connect to your database using pgAdmin or command line
2. Run the migration scripts from `server/migrations/` folder in order
3. Or use the provided migration script:
```bash
cd server
node migrations/run-migrations.js
```

---

## 🔐 Step 2: Environment Configuration

### 2.1 Server Environment (.env)
1. Navigate to `server/.env.production`
2. Update the following values:

```env
# Database Configuration
DB_HOST=your_hostinger_db_host
DB_PORT=5432
DB_NAME=almutanabbi_prod
DB_USER=almutanabbi_user
DB_PASSWORD=your_secure_db_password

# JWT Secret (Generate new one)
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@al-mutanabbi.online

# Session Secret (Generate new one)
SESSION_SECRET=your_session_secret_key_here

# Upload Path (adjust to your Hostinger path)
UPLOAD_PATH=/home/your_username/public_html/uploads
```

**Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.2 Client Environment
The client `.env.production` is already configured:
```env
VITE_API_URL=https://al-mutanabbi.online/api
VITE_BASE_URL=https://al-mutanabbi.online
```

---

## 📦 Step 3: Build the Application

### 3.1 Install Dependencies
```bash
# Server dependencies
cd server
npm install --production

# Client dependencies
cd ../client
npm install
```

### 3.2 Build Client
```bash
cd client
npm run build:prod
```

This creates an optimized production build in `client/dist/`

---

## 🚀 Step 4: Upload Files to Hostinger

### 4.1 File Structure on Server
Your Hostinger directory structure should be:
```
/home/your_username/
├── public_html/              # Web root (client files)
│   ├── index.html
│   ├── assets/
│   ├── .htaccess
│   └── uploads/              # User uploaded files
├── server/                   # Node.js backend (outside public_html)
│   ├── server.js
│   ├── .env                  # Renamed from .env.production
│   ├── package.json
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── ...
└── logs/                     # Application logs
```

### 4.2 Upload via SFTP
1. Connect to your Hostinger server via SFTP
2. Upload client build:
   - Upload contents of `client/dist/*` to `/home/your_username/public_html/`
   - Upload `.htaccess` to `/home/your_username/public_html/`
3. Upload server files:
   - Upload entire `server/` folder to `/home/your_username/server/`
   - Rename `server/.env.production` to `server/.env`
4. Create directories:
   - `/home/your_username/public_html/uploads/`
   - `/home/your_username/logs/`

### 4.3 Set Permissions
```bash
chmod 755 /home/your_username/public_html
chmod 755 /home/your_username/server
chmod 777 /home/your_username/public_html/uploads
chmod 755 /home/your_username/logs
```

---

## 🔧 Step 5: Configure Node.js Application

### 5.1 Setup Node.js in Hostinger
1. Go to hPanel → **Advanced** → **Node.js**
2. Click **Create Application**
3. Configure:
   - **Node.js version**: 16.x or higher
   - **Application mode**: Production
   - **Application root**: `/home/your_username/server`
   - **Application URL**: `al-mutanabbi.online`
   - **Application startup file**: `server.js`
   - **Port**: Use the port assigned by Hostinger (usually auto-detected)

### 5.2 Install Server Dependencies
In Hostinger Node.js terminal or SSH:
```bash
cd /home/your_username/server
npm install --production
```

### 5.3 Start the Application
```bash
cd /home/your_username/server
npm start
```

Or use Hostinger's Node.js control panel to start the application.

---

## 🌐 Step 6: Configure Apache/Web Server

### 6.1 Verify .htaccess
Ensure `.htaccess` is in `/home/your_username/public_html/`:
- Forces HTTPS
- Proxies API requests to Node.js backend
- Handles React Router routing
- Sets security headers
- Enables compression and caching

### 6.2 Enable Required Apache Modules
Ensure these modules are enabled (usually enabled by default on Hostinger):
- `mod_rewrite`
- `mod_proxy`
- `mod_proxy_http`
- `mod_headers`
- `mod_deflate`
- `mod_expires`

---

## 🔒 Step 7: SSL Certificate

### 7.1 Install SSL Certificate
1. Go to hPanel → **Security** → **SSL**
2. Select your domain `al-mutanabbi.online`
3. Install free Let's Encrypt SSL certificate
4. Enable "Force HTTPS" option

---

## ✅ Step 8: Verify Deployment

### 8.1 Test the Application
1. Visit `https://al-mutanabbi.online`
2. Check that the homepage loads correctly
3. Test user registration and login
4. Test API endpoints: `https://al-mutanabbi.online/api/health`
5. Test image uploads
6. Check browser console for errors

### 8.2 Common Issues & Solutions

**Issue: API requests fail (CORS errors)**
- Solution: Verify `CLIENT_URL` in server `.env` matches your domain
- Check CORS configuration in `server/server.js`

**Issue: Images not loading**
- Solution: Check upload directory permissions (should be 777)
- Verify `UPLOAD_PATH` in `.env`
- Check `.htaccess` proxy rules for `/uploads`

**Issue: 404 on page refresh**
- Solution: Verify `.htaccess` is in place and `mod_rewrite` is enabled
- Check React Router configuration

**Issue: Node.js app not starting**
- Solution: Check logs in Hostinger Node.js panel
- Verify database connection
- Check all environment variables are set

---

## 📊 Step 9: Monitoring & Maintenance

### 9.1 Setup Process Manager (PM2)
For better process management:
```bash
npm install -g pm2
cd /home/your_username/server
pm2 start server.js --name almutanabbi
pm2 save
pm2 startup
```

### 9.2 Monitor Logs
```bash
# Application logs
tail -f /home/your_username/logs/app.log

# PM2 logs
pm2 logs almutanabbi

# Error logs
pm2 logs almutanabbi --err
```

### 9.3 Database Backups
Setup automated backups:
```bash
# Create backup script
nano /home/your_username/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/your_username/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U almutanabbi_user almutanabbi_prod > $BACKUP_DIR/backup_$DATE.sql
# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

Add to crontab:
```bash
crontab -e
# Add: 0 2 * * * /home/your_username/backup-db.sh
```

---

## 🔄 Step 10: Updates & Redeployment

### 10.1 Update Application
```bash
# 1. Build new client version locally
cd client
npm run build:prod

# 2. Upload new files via SFTP to public_html/

# 3. Update server code if needed
# Upload changed files to server/

# 4. Restart Node.js application
cd /home/your_username/server
pm2 restart almutanabbi
# Or use Hostinger Node.js panel
```

### 10.2 Database Migrations
```bash
cd /home/your_username/server
node migrations/run-migrations.js
```

---

## 📞 Support & Troubleshooting

### Useful Commands
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check running processes
ps aux | grep node

# Check port usage
netstat -tulpn | grep :3000

# Test database connection
psql -h localhost -U almutanabbi_user -d almutanabbi_prod
```

### Log Files
- Application logs: `/home/your_username/logs/app.log`
- Apache error logs: Check Hostinger control panel
- Node.js logs: Hostinger Node.js panel or PM2 logs

---

## 🎉 Deployment Complete!

Your المتنبي bookstore marketplace should now be live at:
- **Website**: https://al-mutanabbi.online
- **API**: https://al-mutanabbi.online/api

### Next Steps:
1. ✅ Create admin account
2. ✅ Configure email settings
3. ✅ Test all features thoroughly
4. ✅ Setup monitoring and alerts
5. ✅ Configure automated backups
6. ✅ Setup analytics (Google Analytics, etc.)

---

## 📝 Important Notes

1. **Security**: Never commit `.env` files to version control
2. **Backups**: Always backup database before major updates
3. **Testing**: Test thoroughly in staging before production updates
4. **Monitoring**: Regularly check logs and application health
5. **Updates**: Keep dependencies updated for security patches

---

## 📧 Contact

For issues or questions:
- Email: admin@al-mutanabbi.online
- Check application logs for detailed error messages

---

**Good luck with your deployment! 🚀**
