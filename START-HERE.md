# 🚀 START HERE - al-mutanabbi.online Deployment

## ⚡ Quick Start (5 Steps)

### 1️⃣ Create Environment Files (2 minutes)

```bash
# Server environment
cp server/.env.production.template server/.env

# Client environment  
cp client/.env.production.template client/.env
```

**Edit `server/.env` and update:**
- `DB_PASSWORD` - Your Hostinger database password
- `JWT_SECRET` - Generate using: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

**✅ Already configured:**
- Domain: `al-mutanabbi.online`
- API URL: `https://al-mutanabbi.online/api`

---

### 2️⃣ Create GitHub Repository (3 minutes)

```bash
git init
git add .
git commit -m "Initial commit for al-mutanabbi.online"
git remote add origin https://github.com/YOUR_USERNAME/almutanabbi-bookstore.git
git push -u origin main
```

---

### 3️⃣ Configure GitHub Secrets (2 minutes)

Go to: **GitHub Repository → Settings → Secrets → Actions**

Add these 4 secrets:

| Secret | Value |
|--------|-------|
| `FTP_SERVER` | `ftp.al-mutanabbi.online` |
| `FTP_USERNAME` | Your Hostinger FTP username |
| `FTP_PASSWORD` | Your Hostinger FTP password |
| `VITE_API_URL` | `https://al-mutanabbi.online/api` |

---

### 4️⃣ Set Up Hostinger (10 minutes)

**Database:**
1. Hostinger → Databases → PostgreSQL
2. Create database: `almutanabbi_db`
3. Create user: `almutanabbi_user`
4. Save password → Update in `server/.env`

**SSH:**
1. Hostinger → Advanced → SSH Access
2. Enable SSH
3. Install Node.js & PM2:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

---

### 5️⃣ Deploy! (1 minute)

```bash
git push origin main
```

**That's it!** GitHub Actions will automatically deploy to Hostinger.

Monitor deployment: **GitHub → Actions tab**

---

## 🔍 Verify Deployment

After deployment completes:

```bash
# Test health endpoint
curl https://al-mutanabbi.online/api/health

# Visit website
# Open browser: https://al-mutanabbi.online
```

---

## 🎯 Post-Deployment

### Create Admin Account

```bash
# SSH into server
ssh your-username@al-mutanabbi.online

# Navigate to project
cd /home/your-username/public_html/server

# Create admin
node scripts/create-admin.js
```

### Enable SSL

1. Hostinger → SSL
2. Enable Free SSL Certificate
3. Wait 5-10 minutes
4. Visit: `https://al-mutanabbi.online` ✅

---

## 📚 Documentation

- **Domain Setup**: [DOMAIN-SPECIFIC-SETUP.md](./DOMAIN-SPECIFIC-SETUP.md) ⭐
- **Full Guide**: [HOSTINGER-DEPLOYMENT-GUIDE.md](./HOSTINGER-DEPLOYMENT-GUIDE.md)
- **Quick Reference**: [DEPLOYMENT-QUICK-START.md](./DEPLOYMENT-QUICK-START.md)
- **Checklist**: [DEPLOYMENT-CHECKLIST.txt](./DEPLOYMENT-CHECKLIST.txt)

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| Site not loading | `pm2 restart almutanabbi-server` |
| Database error | Check `server/.env` credentials |
| 502 Gateway | `pm2 status` then restart Apache |

---

## 📞 Essential Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs almutanabbi-server

# Restart app
pm2 restart almutanabbi-server

# Update deployment
git pull && pm2 restart almutanabbi-server
```

---

## ✅ Checklist

- [ ] Created `.env` files
- [ ] Updated database credentials
- [ ] Generated JWT secret
- [ ] Created GitHub repository
- [ ] Configured GitHub secrets
- [ ] Set up Hostinger database
- [ ] Enabled SSH on Hostinger
- [ ] Installed Node.js & PM2
- [ ] Pushed code to GitHub
- [ ] Deployment completed
- [ ] SSL certificate enabled
- [ ] Created admin account
- [ ] Tested website

---

## 🎉 Your URLs

- **Website**: https://al-mutanabbi.online
- **API**: https://al-mutanabbi.online/api
- **Admin**: https://al-mutanabbi.online/admin
- **Health**: https://al-mutanabbi.online/api/health

---

**Estimated Time**: 20-30 minutes for first deployment

**Need Help?** See [DOMAIN-SPECIFIC-SETUP.md](./DOMAIN-SPECIFIC-SETUP.md) for detailed instructions.

Good luck! 🚀 المتنبي
