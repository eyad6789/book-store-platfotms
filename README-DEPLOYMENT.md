# 🚀 Deployment Package for al-mutanabbi.online

## Overview

This package contains everything you need to deploy your **المتنبي Iraqi Bookstore Marketplace** to Hostinger with the domain **al-mutanabbi.online**.

---

## 📦 What's Included

### Configuration Files
- ✅ **server/.env.production** - Production environment variables for backend
- ✅ **client/.env.production** - Production environment variables for frontend  
- ✅ **.htaccess** - Apache configuration for routing, security, and proxying

### Package Files
- ✅ **server/package-fixed.json** - Corrected server dependencies
- ✅ **client/package.json** - Updated with production build script

### Deployment Tools
- ✅ **deploy.bat** - Windows deployment script
- ✅ **deploy.sh** - Linux/Mac deployment script

### Documentation
- 📘 **HOSTINGER-DEPLOYMENT-GUIDE.md** - Complete step-by-step guide (detailed)
- ⚡ **QUICK-START-DEPLOYMENT.md** - Fast track guide (30 minutes)
- 📋 **DEPLOYMENT-SUMMARY.md** - Overview and checklist
- ✅ **DEPLOYMENT-CHECKLIST.txt** - Printable checklist
- 📖 **README-DEPLOYMENT.md** - This file

---

## 🎯 Quick Start (Choose Your Path)

### Path 1: Automated (Recommended) ⚡
**Time: 30 minutes**

1. Fix package.json:
   ```bash
   cd server
   del package.json
   ren package-fixed.json package.json
   ```

2. Run deployment script:
   ```bash
   .\deploy.bat  # Windows
   ./deploy.sh   # Linux/Mac
   ```

3. Follow the prompts and upload files to Hostinger

4. See **QUICK-START-DEPLOYMENT.md** for details

### Path 2: Manual (Full Control) 🔧
**Time: 45-60 minutes**

Follow the complete guide in **HOSTINGER-DEPLOYMENT-GUIDE.md**

### Path 3: Checklist (Step-by-Step) ✅
**Time: 40 minutes**

Print and follow **DEPLOYMENT-CHECKLIST.txt**

---

## 🔑 Key Configuration Required

Before deployment, you MUST configure:

### 1. Database Credentials
Create PostgreSQL database in Hostinger and update `server/.env.production`:
```env
DB_HOST=your_hostinger_db_host
DB_NAME=almutanabbi_prod
DB_USER=your_db_username
DB_PASSWORD=your_secure_password
```

### 2. Security Secrets
Generate new secrets (NEVER use defaults):
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Update in `server/.env.production`:
```env
JWT_SECRET=your_generated_secret
SESSION_SECRET=your_generated_secret
```

### 3. Email Configuration
For password reset functionality:
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
```

### 4. File Paths
Adjust to your Hostinger username:
```env
UPLOAD_PATH=/home/your_username/public_html/uploads
LOG_FILE=/home/your_username/logs/app.log
```

---

## 📁 Hostinger Directory Structure

After deployment, your files should be organized as:

```
/home/your_username/
├── public_html/              # Web root (React frontend)
│   ├── index.html
│   ├── assets/
│   ├── .htaccess
│   └── uploads/              # User uploaded files
│       ├── avatars/
│       ├── bookstores/
│       ├── books/
│       └── library-books/
│
├── server/                   # Node.js backend
│   ├── server.js
│   ├── .env
│   ├── package.json
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── migrations/
│
├── logs/                     # Application logs
│   └── app.log
│
└── backups/                  # Database backups
    └── backup_*.sql
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite 4.1
- **Styling**: TailwindCSS 3.2
- **State Management**: React Query
- **Routing**: React Router DOM 6.8
- **UI Components**: Headless UI, Lucide Icons
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express 4.18
- **Database**: PostgreSQL
- **ORM**: Sequelize 6.35
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer
- **Security**: Helmet, Rate Limiting
- **Email**: Nodemailer

### Hosting
- **Provider**: Hostinger
- **Domain**: al-mutanabbi.online
- **SSL**: Let's Encrypt (free)
- **Web Server**: Apache with mod_rewrite

---

## ✅ Pre-Deployment Checklist

Before starting deployment:

- [ ] Hostinger account with Node.js support
- [ ] Domain al-mutanabbi.online configured
- [ ] PostgreSQL database access
- [ ] SSH/SFTP access credentials
- [ ] Email account for password reset
- [ ] FileZilla or SFTP client installed
- [ ] Node.js installed locally (for building)

---

## 🚀 Deployment Steps Overview

1. **Prepare** (5 min)
   - Fix package.json
   - Configure environment variables
   - Generate security secrets

2. **Build** (5 min)
   - Run deployment script
   - Build client for production
   - Package server files

3. **Database** (5 min)
   - Create PostgreSQL database
   - Note credentials
   - Update .env file

4. **Upload** (10 min)
   - Connect via SFTP
   - Upload client to public_html
   - Upload server files
   - Set permissions

5. **Configure** (5 min)
   - Setup Node.js application
   - Install dependencies
   - Run migrations

6. **Launch** (5 min)
   - Start Node.js app
   - Install SSL certificate
   - Test functionality

**Total Time: ~35 minutes**

---

## 🧪 Testing After Deployment

Visit and verify:

### Basic Functionality
- [ ] Homepage: `https://al-mutanabbi.online`
- [ ] API health: `https://al-mutanabbi.online/api/health`
- [ ] User registration
- [ ] User login
- [ ] Browse books

### Advanced Features
- [ ] Library owner dashboard
- [ ] Book management
- [ ] Image uploads
- [ ] Order creation
- [ ] Admin dashboard
- [ ] Search functionality
- [ ] Rating system

### Performance
- [ ] Page load speed
- [ ] API response times
- [ ] Image loading
- [ ] Mobile responsiveness

---

## 🐛 Common Issues & Quick Fixes

### Issue: API requests fail
```bash
# Check Node.js app is running
# In Hostinger panel: Node.js → Check status
# Restart if needed
```

### Issue: Database connection error
```bash
# Verify credentials in .env
# Test connection:
cd /home/username/server
node -e "require('./config/database').testConnection()"
```

### Issue: Images not loading
```bash
# Fix permissions
chmod -R 777 /home/username/public_html/uploads
```

### Issue: 404 on page refresh
```bash
# Ensure .htaccess exists
ls -la /home/username/public_html/.htaccess
# Check mod_rewrite is enabled
```

---

## 📊 Monitoring & Maintenance

### View Logs
```bash
# Application logs
tail -f /home/username/logs/app.log

# Node.js logs (if using PM2)
pm2 logs almutanabbi
```

### Database Backup
```bash
# Manual backup
pg_dump -h localhost -U username almutanabbi_prod > backup.sql

# Setup automated backups (cron)
0 2 * * * /home/username/backup-db.sh
```

### Update Application
```bash
# 1. Build new version locally
npm run build:prod

# 2. Upload via SFTP
# Upload client/dist/* to public_html/

# 3. Restart Node.js
pm2 restart almutanabbi
```

---

## 🔒 Security Best Practices

✅ **DO:**
- Use strong, unique passwords
- Generate new JWT/Session secrets
- Enable SSL certificate
- Keep dependencies updated
- Regular database backups
- Monitor logs for suspicious activity
- Use environment variables for secrets

❌ **DON'T:**
- Commit .env files to Git
- Use default secrets
- Expose database credentials
- Ignore security updates
- Skip SSL certificate
- Use weak passwords

---

## 📞 Support & Resources

### Documentation Files
- **Full Guide**: HOSTINGER-DEPLOYMENT-GUIDE.md
- **Quick Start**: QUICK-START-DEPLOYMENT.md
- **Summary**: DEPLOYMENT-SUMMARY.md
- **Checklist**: DEPLOYMENT-CHECKLIST.txt

### Useful Commands
```bash
# Check Node.js version
node --version

# Check app status
pm2 status

# View logs
pm2 logs

# Restart app
pm2 restart almutanabbi

# Database connection test
psql -h localhost -U username -d almutanabbi_prod
```

### Getting Help
1. Check application logs first
2. Review documentation
3. Search error messages
4. Contact Hostinger support (24/7)

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ Website loads at https://al-mutanabbi.online  
✅ Users can register and login  
✅ Books display correctly with images  
✅ Library owners can manage their books  
✅ Admin can access dashboard  
✅ Orders can be created  
✅ Search functionality works  
✅ No console errors  
✅ SSL certificate active  
✅ All pages load quickly  

---

## 📝 Post-Deployment Tasks

After successful deployment:

1. **Create Admin Account**
   - Register first user
   - Set role to 'admin' in database

2. **Add Sample Data**
   - Create sample bookstores
   - Add sample books
   - Test all features

3. **Configure Monitoring**
   - Setup PM2 for process management
   - Configure log rotation
   - Setup error alerts

4. **Performance Optimization**
   - Enable caching
   - Optimize images
   - Configure CDN (optional)

5. **Marketing**
   - Announce launch
   - Share on social media
   - Gather user feedback

---

## 📈 Next Steps

### Immediate (Day 1)
- [ ] Complete deployment
- [ ] Test all features
- [ ] Create admin account
- [ ] Add initial content

### Short Term (Week 1)
- [ ] Setup automated backups
- [ ] Configure monitoring
- [ ] Optimize performance
- [ ] Gather feedback

### Long Term (Month 1)
- [ ] Analyze user behavior
- [ ] Implement improvements
- [ ] Scale infrastructure
- [ ] Plan new features

---

## 🏆 Deployment Complete!

Congratulations! Your **المتنبي Iraqi Bookstore Marketplace** is now live at:

🌐 **https://al-mutanabbi.online**

### What You've Accomplished:
✅ Full-stack web application deployed  
✅ Secure HTTPS connection  
✅ Database configured and migrated  
✅ File uploads working  
✅ User authentication active  
✅ Admin dashboard accessible  
✅ Production-ready configuration  

---

## 📧 Contact

For questions or issues:
- **Email**: admin@al-mutanabbi.online
- **Documentation**: See files in this package
- **Hostinger Support**: Available 24/7

---

**Good luck with your marketplace! 🚀📚**

*Built with ❤️ for the Iraqi book community*
