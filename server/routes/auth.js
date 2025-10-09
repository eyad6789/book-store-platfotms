const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { User, PasswordResetToken } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validate, userSchemas } = require('../middleware/validation');

const router = express.Router();

console.log('🔧 Configuring auth routes with avatar upload...');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'avatars');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validate(userSchemas.register), async (req, res) => {
  try {
    const { email, password, full_name, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password_hash: password, // Will be hashed by the model hook
      full_name,
      phone,
      role: role || 'customer'
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Something went wrong during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validate(userSchemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Something went wrong during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [
        {
          model: require('../models').Bookstore,
          as: 'bookstore',
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    res.json({
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Profile fetch failed',
      message: 'Something went wrong while fetching profile'
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile (alias for /me)
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Profile fetch failed',
      message: 'Something went wrong while fetching profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, validate(userSchemas.updateProfile), async (req, res) => {
  try {
    const { full_name, phone, avatar_url } = req.body;

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    // Update user fields
    if (full_name !== undefined) user.full_name = full_name;
    if (phone !== undefined) user.phone = phone;
    if (avatar_url !== undefined) user.avatar_url = avatar_url;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Profile update failed',
      message: 'Something went wrong while updating profile'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    // Validation
    if (!current_password || !new_password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Current password and new password are required'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    // Verify current password
    const isValidPassword = await user.validatePassword(current_password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password_hash = new_password; // Will be hashed by the model hook
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Password change failed',
      message: 'Something went wrong while changing password'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, (req, res) => {
  // In a JWT-based system, logout is typically handled client-side
  // by removing the token from storage
  res.json({
    message: 'Logout successful'
  });
});

// @route   GET /api/auth/test-upload
// @desc    Test upload endpoint availability
// @access  Public
router.get('/test-upload', (req, res) => {
  res.json({
    message: 'Upload endpoint is available',
    uploadRoute: 'POST /api/auth/upload-avatar',
    status: 'Ready'
  });
});

// @route   POST /api/auth/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No avatar provided',
        message: 'Please select an avatar to upload'
      });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    // Delete old avatar if exists
    if (user.avatar_url) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar_url);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user with new avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await user.update({ avatar_url: avatarUrl });

    // Update localStorage user data
    const updatedUser = user.toJSON();

    res.json({
      message: 'Avatar uploaded successfully',
      avatar_url: avatarUrl,
      user: updatedUser
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      error: 'Failed to upload avatar',
      message: 'Something went wrong while uploading the avatar'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email required',
        message: 'يرجى إدخال البريد الإلكتروني'
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    
    // Don't reveal if user exists (security best practice)
    if (!user) {
      return res.json({
        message: 'إذا كان البريد الإلكتروني موجوداً في نظامنا، ستتلقى رابط إعادة تعيين كلمة المرور'
      });
    }

    // Delete any existing unused reset tokens for this user
    await PasswordResetToken.destroy({
      where: {
        user_id: user.id,
        used: false
      }
    });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set expiration (1 hour from now)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    await PasswordResetToken.create({
      user_id: user.id,
      token: hashedToken,
      expires_at: expiresAt
    });

    // In production, send email with reset link
    // For now, log it (in development)
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3001'}/auth/reset-password?token=${resetToken}`;
    
    console.log('🔐 Password Reset Request');
    console.log('   User:', user.email);
    console.log('   Reset URL:', resetUrl);
    console.log('   Expires:', expiresAt);

    // TODO: Send email with resetUrl
    // await sendResetPasswordEmail(user.email, resetUrl);

    res.json({
      message: 'إذا كان البريد الإلكتروني موجوداً في نظامنا، ستتلقى رابط إعادة تعيين كلمة المرور',
      // Include URL in development mode
      ...(process.env.NODE_ENV === 'development' && { resetUrl })
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Failed to process request',
      message: 'حدث خطأ، يرجى المحاولة مرة أخرى'
    });
  }
});

// @route   GET /api/auth/reset-password/:token/validate
// @desc    Validate reset token
// @access  Public
router.get('/reset-password/:token/validate', async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({
        error: 'Token required',
        message: 'رابط غير صالح'
      });
    }

    // Hash the token to match database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find token in database
    const resetToken = await PasswordResetToken.findOne({
      where: {
        token: hashedToken,
        used: false
      },
      include: [{
        model: User,
        as: 'user'
      }]
    });

    if (!resetToken) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'رابط إعادة التعيين غير صالح'
      });
    }

    // Check if token is expired
    if (new Date() > resetToken.expires_at) {
      return res.status(400).json({
        error: 'Token expired',
        message: 'رابط إعادة التعيين منتهي الصلاحية'
      });
    }

    res.json({
      message: 'Token is valid',
      valid: true
    });

  } catch (error) {
    console.error('Validate reset token error:', error);
    res.status(500).json({
      error: 'Failed to validate token',
      message: 'حدث خطأ، يرجى المحاولة مرة أخرى'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'يرجى إدخال جميع الحقول المطلوبة'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل'
      });
    }

    // Hash the token to match database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find token in database
    const resetToken = await PasswordResetToken.findOne({
      where: {
        token: hashedToken,
        used: false
      },
      include: [{
        model: User,
        as: 'user'
      }]
    });

    if (!resetToken) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'رابط إعادة التعيين غير صالح'
      });
    }

    // Check if token is expired
    if (new Date() > resetToken.expires_at) {
      return res.status(400).json({
        error: 'Token expired',
        message: 'رابط إعادة التعيين منتهي الصلاحية'
      });
    }

    // Update user password
    const user = resetToken.user;
    user.password_hash = password; // Will be hashed by model hook
    await user.save();

    // Mark token as used
    resetToken.used = true;
    await resetToken.save();

    console.log('✅ Password reset successful for user:', user.email);

    res.json({
      message: 'تم تغيير كلمة المرور بنجاح',
      success: true
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Failed to reset password',
      message: 'حدث خطأ، يرجى المحاولة مرة أخرى'
    });
  }
});

console.log('✅ Auth routes configured successfully (including /upload-avatar)');

module.exports = router;
