# 🚀 MySQL Deployment Guide for al-mutanabbi.online

## ✅ Your App is Now Configured for MySQL!

I've converted your application to use **MySQL** instead of PostgreSQL, so it will work with your standard Hostinger plan (no VPS needed)!

---

## 📋 STEP-BY-STEP DEPLOYMENT

### STEP 1: Get Hostinger MySQL Database Credentials (5 minutes)

1. **Login to Hostinger Control Panel (hPanel)**
   - Go to: https://hpanel.hostinger.com
   - Login with your Hostinger account

2. **Create MySQL Database**
   - Click on **"Databases"** in the left menu
   - Click **"MySQL Databases"**
   - Click **"Create Database"**
   
   Fill in:
   - **Database Name**: `almutanabbi_prod`
   - **Username**: Create a new user (e.g., `almutanabbi_user`)
   - **Password**: Click "Generate" for a strong password
   - **Grant all privileges** to the user
   
3. **Save These Credentials** (You'll need them in Step 2)
   ```
   Database Host: localhost
   Database Port: 3306
   Database Name: almutanabbi_prod
   Username: _____________________
   Password: _____________________
   ```

---

### STEP 2: Configure Environment File (3 minutes)

1. **Open this file**: `server/.env.production`

2. **Generate Security Secrets**
   
   Open PowerShell and run this command **TWICE** to generate two different secrets:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   
   Copy the first output for JWT_SECRET
   Run again and copy the second output for SESSION_SECRET

3. **Edit the .env.production file** and update these values:

   ```env
   # Database - Use MySQL credentials from Step 1
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=almutanabbi_prod
   DB_USER=your_username_from_step1
   DB_PASSWORD=your_password_from_step1
   
   # Security - Use generated secrets
   JWT_SECRET=paste_first_generated_secret_here
   SESSION_SECRET=paste_second_generated_secret_here
   
   # Email (for password reset) - Use your Gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_gmail_app_password
   
   # Paths - Replace "your_username" with your Hostinger username
   UPLOAD_PATH=/home/your_hostinger_username/public_html/uploads
   LOG_FILE=/home/your_hostinger_username/logs/app.log
   BACKUP_PATH=/home/your_hostinger_username/backups
   ```

4. **Save the file**

---

### STEP 3: Rebuild Deployment Package (5 minutes)

Since we converted to MySQL, you need to rebuild:

```powershell
# In your project root
.\deploy.bat
```

This will:
- Install MySQL dependencies
- Rebuild the client
- Create new deployment package

---

### STEP 4: Upload Files to Hostinger (10 minutes)

1. **Download FileZilla** (if you don't have it)
   - Go to: https://filezilla-project.org/download.php
   - Download and install FileZilla Client

2. **Connect to Hostinger via SFTP**
   
   In FileZilla, enter:
   - **Host**: `sftp://your-domain.com` or your Hostinger IP
   - **Username**: Your Hostinger username
   - **Password**: Your Hostinger password
   - **Port**: 22
   
   Click **"Quickconnect"**

3. **Upload Client Files**
   
   In FileZilla:
   - **Left side** (Local): Navigate to `deployment-package/public_html/`
   - **Right side** (Remote): Navigate to `/home/your_username/public_html/`
   - Select ALL files in `public_html/` folder
   - Right-click → **Upload**
   - Wait for upload to complete

4. **Upload Server Files**
   
   - **Left side**: Navigate to `deployment-package/server/`
   - **Right side**: Navigate to `/home/your_username/`
   - Create a new folder called `server` if it doesn't exist
   - Select ALL files in `server/` folder
   - Drag and drop to `/home/your_username/server/`

5. **Create Additional Directories**
   
   In FileZilla, on the remote side, create these folders:
   - `/home/your_username/logs/`
   - `/home/your_username/backups/`

6. **Set Permissions for Uploads Folder**
   
   - Navigate to `/home/your_username/public_html/uploads/`
   - Right-click on `uploads` folder → **File Permissions**
   - Set to: **777** (or check: Read, Write, Execute for all)
   - Check **"Recurse into subdirectories"**
   - Click OK

---

### STEP 5: Setup Node.js Application (5 minutes)

1. **Go to Hostinger Control Panel**
   - Click on **"Advanced"** in the left menu
   - Click **"Node.js"**

2. **Create New Application**
   - Click **"Create Application"** button
   
   Configure:
   - **Node.js version**: Select **16.x** or higher (18.x recommended)
   - **Application mode**: Select **"Production"**
   - **Application root**: `/home/your_username/server`
   - **Application URL**: `al-mutanabbi.online`
   - **Application startup file**: `server.js`
   - **Port**: Leave as auto-assigned
   
   Click **"Create"**

3. **Install Dependencies**
   
   In the Node.js panel, you'll see a terminal. Run:
   ```bash
   cd /home/your_username/server
   npm install --production
   ```
   
   Wait for installation to complete (may take 2-3 minutes)
   
   **Note**: This will install mysql2 package instead of pg (PostgreSQL)

4. **Run Database Migrations**
   
   In the same terminal:
   ```bash
   node migrations/run-migrations.js
   ```
   
   You should see success messages for each migration

5. **Start the Application**
   
   Click the **"Start Application"** button in the Node.js panel
   
   Wait for status to show **"Running"**

---

### STEP 6: Install SSL Certificate (3 minutes)

1. **Go to Hostinger Control Panel**
   - Click on **"Security"** in the left menu
   - Click **"SSL"**

2. **Install Certificate**
   - Select your domain: `al-mutanabbi.online`
   - Click **"Install SSL"** or **"Install Let's Encrypt"**
   - Wait for installation (1-2 minutes)

3. **Force HTTPS**
   - Enable the **"Force HTTPS"** option
   - This ensures all traffic uses secure connection

---

### STEP 7: Test Your Website (5 minutes)

1. **Visit Your Website**
   
   Open browser and go to: **https://al-mutanabbi.online**
   
   ✅ You should see your homepage!

2. **Test These Features**
   
   - [ ] Homepage loads correctly
   - [ ] Click "تسجيل" (Register) - create a new account
   - [ ] Login with your new account
   - [ ] Browse books page
   - [ ] Check that images load
   - [ ] Test search functionality

3. **Check API Health**
   
   Visit: **https://al-mutanabbi.online/api/health**
   
   You should see a JSON response like: `{"status": "ok"}`

---

## 🎉 CONGRATULATIONS!

Your website is now LIVE at: **https://al-mutanabbi.online**

Using **MySQL database** (no VPS needed)!

---

## 🔧 What Changed?

### Before (PostgreSQL):
- Required VPS or expensive hosting
- Used `pg` and `pg-hstore` packages
- Port 5432

### After (MySQL):
- Works with standard Hostinger plan ✅
- Uses `mysql2` package
- Port 3306
- Same functionality, different database!

---

## 📊 Database Backup (MySQL)

Create a backup script:

```bash
#!/bin/bash
BACKUP_DIR="/home/your_username/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -h localhost -u almutanabbi_user -p almutanabbi_prod > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

Save as `/home/your_username/backup-db.sh` and make executable:
```bash
chmod +x /home/your_username/backup-db.sh
```

Add to crontab (daily at 2 AM):
```bash
crontab -e
# Add: 0 2 * * * /home/your_username/backup-db.sh
```

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to database"

**Solution:**
1. Verify database credentials in `.env`
2. Check MySQL is running in Hostinger
3. Test connection:
   ```bash
   cd /home/your_username/server
   node -e "require('./config/database').testConnection()"
   ```

### Problem: "mysql2 module not found"

**Solution:**
```bash
cd /home/your_username/server
npm install mysql2 --save
npm start
```

### Problem: Images not loading

**Solution:**
```bash
chmod -R 777 /home/your_username/public_html/uploads
```

---

## ✅ Deployment Checklist

- [ ] Created MySQL database in Hostinger
- [ ] Configured .env.production file
- [ ] Rebuilt deployment package
- [ ] Uploaded files via SFTP
- [ ] Created Node.js application
- [ ] Installed dependencies (including mysql2)
- [ ] Run database migrations
- [ ] Started application
- [ ] Installed SSL certificate
- [ ] Tested website
- [ ] Created admin account
- [ ] Setup backups

---

## 🎯 Summary

✅ **Converted from PostgreSQL to MySQL**  
✅ **Works with standard Hostinger plan (no VPS needed)**  
✅ **All features work the same**  
✅ **Deployment ready**  

Your المتنبي marketplace is ready to deploy with MySQL!

---

**Total Time: ~40 minutes**

Good luck with your deployment! 🚀📚
