# 🌐 Setup Guide for al-mutanabbi.online

## Your Domain Configuration

**Domain**: `al-mutanabbi.online`  
**Website URL**: `https://al-mutanabbi.online`  
**API URL**: `https://al-mutanabbi.online/api`

---

## ⚡ Quick Setup (Copy & Paste Ready)

### Step 1: Create Server Environment File

```bash
# Copy the template
cp server/.env.production.template server/.env
```

Then edit `server/.env` and update these values:

```env
# Database - Get from Hostinger PostgreSQL panel
DB_HOST=localhost
DB_NAME=almutanabbi_db
DB_USER=almutanabbi_user
DB_PASSWORD=YOUR_ACTUAL_DATABASE_PASSWORD

# JWT Secret - Generate using this command:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=PASTE_GENERATED_SECRET_HERE

# Email (Optional) - If you want password reset feature
EMAIL_USER=noreply@al-mutanabbi.online
EMAIL_PASSWORD=YOUR_EMAIL_PASSWORD
```

**✅ Already configured for your domain:**
- `CLIENT_URL=https://al-mutanabbi.online`

### Step 2: Create Client Environment File

```bash
# Copy the template
cp client/.env.production.template client/.env
```

**✅ Already configured for your domain:**
- `VITE_API_URL=https://al-mutanabbi.online/api`

No changes needed unless you want to customize!

---

## 🔑 GitHub Secrets Configuration

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

| Secret Name | Value |
|------------|-------|
| `FTP_SERVER` | `ftp.al-mutanabbi.online` or your Hostinger FTP server |
| `FTP_USERNAME` | Your Hostinger FTP username |
| `FTP_PASSWORD` | Your Hostinger FTP password |
| `VITE_API_URL` | `https://al-mutanabbi.online/api` |

---

## 📧 Email Configuration (Optional)

If you want to enable password reset emails:

1. **Create email account** in Hostinger:
   - Go to **Emails** → **Email Accounts**
   - Create: `noreply@al-mutanabbi.online`
   - Set a strong password

2. **Update server/.env**:
   ```env
   EMAIL_HOST=smtp.hostinger.com
   EMAIL_PORT=587
   EMAIL_USER=noreply@al-mutanabbi.online
   EMAIL_PASSWORD=your_email_password
   EMAIL_FROM=noreply@al-mutanabbi.online
   ```

---

## 🗄️ Database Setup on Hostinger

1. **Log in to Hostinger** control panel
2. Go to **Databases** → **PostgreSQL Databases**
3. Click **Create Database**
4. Use these recommended names:
   - **Database Name**: `almutanabbi_db`
   - **Username**: `almutanabbi_user`
   - **Password**: Generate a strong password
5. **Save credentials** and update `server/.env`

---

## 🔐 Generate JWT Secret

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and paste it as `JWT_SECRET` in `server/.env`

---

## 🚀 Deployment Commands

### Option 1: Automated Deployment (Recommended)

```bash
# 1. Commit your changes
git add .
git commit -m "Configure for al-mutanabbi.online"

# 2. Push to GitHub (triggers automatic deployment)
git push origin main
```

### Option 2: Manual Deployment

```bash
# 1. Build locally
./deploy.bat  # Windows
# or
./deploy.sh   # Linux/Mac

# 2. Upload to Hostinger via FTP
# Upload all files to /public_html/

# 3. SSH into your server
ssh your-username@al-mutanabbi.online

# 4. Navigate to project
cd /home/your-username/public_html

# 5. Install and start
cd server && npm install --production && cd ..
cd client && npm install && npm run build && cd ..
cd server && npm run migrate && cd ..
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## ✅ Verification Steps

After deployment, test these URLs:

1. **Health Check**:
   ```bash
   curl https://al-mutanabbi.online/api/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Website**:
   - Visit: `https://al-mutanabbi.online`
   - Should load the المتنبي homepage

3. **API**:
   - Visit: `https://al-mutanabbi.online/api/ready`
   - Should return: `{"ready":true}`

---

## 🔧 Post-Deployment Tasks

### 1. Create Admin Account

```bash
# SSH into your server
ssh your-username@al-mutanabbi.online

# Navigate to project
cd /home/your-username/public_html/server

# Run admin creation script
node scripts/create-admin.js
```

### 2. Test the Application

- ✅ Visit `https://al-mutanabbi.online`
- ✅ Register a test user
- ✅ Login with test user
- ✅ Browse books
- ✅ Test search
- ✅ Login as admin
- ✅ Test admin dashboard

### 3. Monitor Application

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs almutanabbi-server

# Monitor resources
pm2 monit
```

---

## 🌐 DNS Configuration

Ensure your domain is properly configured:

1. **In Hostinger DNS Manager**:
   - A Record: `@` → Your server IP
   - A Record: `www` → Your server IP
   - CNAME: `www` → `al-mutanabbi.online`

2. **Wait for DNS propagation** (5-30 minutes)

3. **Test DNS**:
   ```bash
   nslookup al-mutanabbi.online
   ping al-mutanabbi.online
   ```

---

## 🔒 SSL Certificate

1. **In Hostinger Control Panel**:
   - Go to **SSL**
   - Enable **Free SSL Certificate** (Let's Encrypt)
   - Wait 5-10 minutes for activation

2. **Force HTTPS** (already configured in `.htaccess`):
   - All HTTP traffic will redirect to HTTPS automatically

3. **Verify SSL**:
   - Visit `https://al-mutanabbi.online`
   - Check for padlock icon in browser
   - Test at: `https://www.ssllabs.com/ssltest/`

---

## 📊 Your URLs Summary

| Service | URL |
|---------|-----|
| **Website** | https://al-mutanabbi.online |
| **API Base** | https://al-mutanabbi.online/api |
| **Health Check** | https://al-mutanabbi.online/api/health |
| **Admin Panel** | https://al-mutanabbi.online/admin |
| **Uploads** | https://al-mutanabbi.online/uploads |

---

## 🆘 Quick Troubleshooting

### Issue: Site not loading
```bash
# Check PM2 status
pm2 status

# Restart if needed
pm2 restart almutanabbi-server

# Check logs
pm2 logs almutanabbi-server --lines 50
```

### Issue: Database connection error
```bash
# Verify .env file
cat server/.env | grep DB_

# Test database connection
cd server
node -e "require('./config/database').sequelize.authenticate().then(() => console.log('✓ DB OK')).catch(e => console.error('✗ DB Error:', e.message))"
```

### Issue: 502 Bad Gateway
```bash
# Check if Node.js is running
pm2 status

# Restart Apache
sudo systemctl restart apache2

# Check Apache logs
tail -f /var/log/apache2/error.log
```

---

## 📞 Support

For detailed instructions, see:
- **Full Guide**: [HOSTINGER-DEPLOYMENT-GUIDE.md](./HOSTINGER-DEPLOYMENT-GUIDE.md)
- **Quick Start**: [DEPLOYMENT-QUICK-START.md](./DEPLOYMENT-QUICK-START.md)
- **Checklist**: [DEPLOYMENT-CHECKLIST.txt](./DEPLOYMENT-CHECKLIST.txt)

---

## 🎉 Ready to Deploy!

Your configuration is ready for **al-mutanabbi.online**!

**Next Steps**:
1. ✅ Create `.env` files from templates
2. ✅ Update database credentials
3. ✅ Generate JWT secret
4. ✅ Configure GitHub secrets
5. ✅ Push to GitHub
6. ✅ Deploy!

Good luck! 🚀
