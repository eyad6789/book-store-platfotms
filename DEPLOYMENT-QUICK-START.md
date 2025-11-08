# ⚡ Quick Start Deployment Guide

## 🚀 Deploy in 5 Minutes

### Prerequisites
- Hostinger account with Node.js support
- Domain name
- GitHub account

### Step 1: Prepare Environment Files (2 minutes)

```bash
# Copy example files
cp server/.env.example.production server/.env
cp client/.env.example.production client/.env

# Edit with your credentials
# server/.env - Update database credentials and domain
# client/.env - Update API URL
```

### Step 2: Push to GitHub (1 minute)

```bash
git init
git add .
git commit -m "Initial deployment"
git remote add origin https://github.com/YOUR_USERNAME/almutanabbi-bookstore.git
git push -u origin main
```

### Step 3: Configure GitHub Secrets (1 minute)

Go to GitHub → Settings → Secrets → Add:
- `FTP_SERVER`: your-ftp-server.com
- `FTP_USERNAME`: your-username
- `FTP_PASSWORD`: your-password
- `VITE_API_URL`: https://yourdomain.com/api

### Step 4: Deploy (1 minute)

**Option A: Automatic (GitHub Actions)**
- Push to main branch
- GitHub Actions will deploy automatically

**Option B: Manual**
```bash
# Run deployment script
./deploy.bat  # Windows
./deploy.sh   # Linux/Mac

# Upload to Hostinger via FTP
# Then SSH into server:
pm2 start ecosystem.config.js
pm2 save
```

### Step 5: Verify

Visit: `https://yourdomain.com`

---

## 📋 Essential Commands

### On Your Server (SSH)

```bash
# Check status
pm2 status

# View logs
pm2 logs

# Restart app
pm2 restart almutanabbi-server

# Run migrations
cd server && npm run migrate

# Create admin
node scripts/create-admin.js
```

### Update Deployment

```bash
git pull origin main
cd server && npm install --production && cd ..
cd client && npm install && npm run build && cd ..
pm2 restart almutanabbi-server
```

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| App not starting | `pm2 logs` and check errors |
| Database error | Verify `.env` credentials |
| 502 Gateway | Check `pm2 status` and restart Apache |
| Upload fails | `chmod -R 755 server/uploads` |

---

## 📞 Need Help?

See full guide: [HOSTINGER-DEPLOYMENT-GUIDE.md](./HOSTINGER-DEPLOYMENT-GUIDE.md)
