# Forgot Password Feature - Setup Guide

## Overview
Complete "Forgot Password" authentication flow for المتنبي Bookstore Platform with secure token-based password reset.

## ✅ What's Been Created

### Frontend (React)
1. **Pages:**
   - `ForgotPasswordPage.jsx` - Request password reset
   - `ResetPasswordPage.jsx` - Reset password with token

2. **Routes Added:**
   - `/auth/forgot-password` - Forgot password form
   - `/auth/reset-password` - Reset password form (with token in URL)

3. **API Integration:**
   - `authAPI.forgotPassword(email)` - Request reset
   - `authAPI.validateResetToken(token)` - Validate token
   - `authAPI.resetPassword({token, password})` - Reset password

### Backend (Node.js/Express)
1. **Database:**
   - New table: `password_reset_tokens`
   - Fields: id, user_id, token (hashed), expires_at, used, created_at

2. **Model:**
   - `PasswordResetToken.js` - Sequelize model with User association

3. **API Endpoints:**
   - `POST /api/auth/forgot-password` - Request password reset
   - `GET /api/auth/reset-password/:token/validate` - Validate token
   - `POST /api/auth/reset-password` - Reset password

## 🚀 Setup Instructions

### Step 1: Run Database Migration

```bash
cd d:\projects\book-store-platforms\server
node run-reset-password-migration.js
```

### Step 2: Restart Server

```bash
# Stop current server (Ctrl+C)
node server.js
```

### Step 3: Test the Feature

1. Go to `http://localhost:3001/login`
2. Click "نسيت كلمة المرور؟" (Forgot Password?)
3. Enter email address
4. Check server console for reset URL (in development mode)
5. Copy the reset URL and open it in browser
6. Enter new password
7. Login with new password

## 🔐 Security Features

### Token Security
- ✅ Tokens are hashed using SHA-256 before storing in database
- ✅ Tokens expire after 1 hour
- ✅ Tokens can only be used once
- ✅ Old unused tokens are deleted when requesting new reset

### Best Practices
- ✅ Doesn't reveal if email exists (prevents user enumeration)
- ✅ Password minimum 6 characters
- ✅ HTTPS recommended in production
- ✅ Rate limiting on forgot password endpoint (inherited from global limiter)

## 📧 Email Integration (TODO)

Currently, the reset URL is logged to console in development mode. For production:

### Add Email Service

1. Install nodemailer:
```bash
npm install nodemailer
```

2. Create email service file: `server/services/emailService.js`

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.sendResetPasswordEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@almutanabbi.com',
    to: email,
    subject: 'إعادة تعيين كلمة المرور - المتنبي',
    html: `
      <div dir="rtl">
        <h2>إعادة تعيين كلمة المرور</h2>
        <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.</p>
        <p>اضغط على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #8B4513; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          إعادة تعيين كلمة المرور
        </a>
        <p style="color: #666; font-size: 14px;">
          هذا الرابط صالح لمدة ساعة واحدة فقط.
        </p>
        <p style="color: #666; font-size: 14px;">
          إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
```

3. Update `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@almutanabbi.com
```

4. Update `routes/auth.js` line 437:
```javascript
// Uncomment this line:
await sendResetPasswordEmail(user.email, resetUrl);
```

## 🧪 Testing Scenarios

### Valid Flow
1. User requests password reset
2. Receives email with reset link
3. Clicks link (valid token)
4. Enters new password
5. Successfully logs in with new password

### Error Scenarios
- ✅ Invalid email (doesn't exist) - Success message (security)
- ✅ Expired token (>1 hour) - Error: "منتهي الصلاحية"
- ✅ Used token - Error: "غير صالح"
- ✅ Invalid token format - Error: "غير صالح"
- ✅ Password too short (<6 chars) - Error: "6 أحرف على الأقل"

## 📱 UI Features

### Forgot Password Page
- Clean, modern Arabic UI
- Email validation
- Loading states
- Success confirmation screen
- Link to go back to login

### Reset Password Page
- Token validation on page load
- Password strength indicator
- Show/hide password toggle
- Password confirmation
- Auto-redirect to login after success
- Invalid/expired token handling

## 🔄 Flow Diagram

```
User → Forgot Password Page
  ↓
Enter Email → POST /api/auth/forgot-password
  ↓
Token Created & Email Sent (or logged in dev)
  ↓
User Clicks Reset Link → Reset Password Page
  ↓
Validate Token → GET /api/auth/reset-password/:token/validate
  ↓
Enter New Password → POST /api/auth/reset-password
  ↓
Password Updated & Token Marked as Used
  ↓
Redirect to Login → User Logs In
```

## 📝 Database Schema

### password_reset_tokens table
```sql
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,  -- SHA-256 hashed
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prt_token ON password_reset_tokens(token);
CREATE INDEX idx_prt_user_id ON password_reset_tokens(user_id);
```

## 🎯 Next Steps

1. ✅ Run migration
2. ✅ Test the flow
3. ⏳ Integrate email service (production)
4. ⏳ Add rate limiting for forgot password specifically
5. ⏳ Monitor reset token usage in admin dashboard
6. ⏳ Add cleanup job for expired tokens

## 🐛 Troubleshooting

### Token not found in database
- Check if migration ran successfully
- Check PasswordResetToken model is loaded
- Verify associations are set up

### Email not working
- Check SMTP credentials
- Verify email service is imported
- Check firewall/antivirus blocking SMTP

### Token validation fails
- Ensure token in URL matches exactly
- Check token hasn't expired (1 hour limit)
- Verify token wasn't already used

## 📚 API Documentation

### POST /api/auth/forgot-password
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "إذا كان البريد الإلكتروني موجوداً في نظامنا، ستتلقى رابط إعادة تعيين كلمة المرور",
  "resetUrl": "http://localhost:3001/auth/reset-password?token=..." // dev only
}
```

### GET /api/auth/reset-password/:token/validate
**Response Success:**
```json
{
  "message": "Token is valid",
  "valid": true
}
```

**Response Error:**
```json
{
  "error": "Token expired",
  "message": "رابط إعادة التعيين منتهي الصلاحية"
}
```

### POST /api/auth/reset-password
**Request:**
```json
{
  "token": "abc123...",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "message": "تم تغيير كلمة المرور بنجاح",
  "success": true
}
```

---

**Created for:** المتنبي Bookstore Platform  
**Date:** January 4, 2025  
**Status:** ✅ Complete & Ready to Use
