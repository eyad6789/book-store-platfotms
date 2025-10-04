const express = require('express');
const router = express.Router();
const { User, Bookstore } = require('../models');

// @route   POST /api/setup/fix-user-account
// @desc    Fix user account and create bookstore if needed
// @access  Public (for debugging purposes)
router.post('/fix-user-account', async (req, res) => {
  try {
    const { userName, email } = req.body;
    
    console.log('🔧 Fixing account for:', { userName, email });
    
    // Find user by name or email
    let user = null;
    if (userName) {
      user = await User.findOne({
        where: { full_name: userName }
      });
    } else if (email) {
      user = await User.findOne({
        where: { email: email }
      });
    }
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'لم يتم العثور على المستخدم'
      });
    }
    
    console.log('✅ User found:', user.full_name);
    
    // Update user role to bookstore_owner if needed
    if (user.role !== 'bookstore_owner') {
      await user.update({ role: 'bookstore_owner' });
      console.log('✅ User role updated to bookstore_owner');
    }
    
    // Check if user has a bookstore
    let bookstore = await Bookstore.findOne({
      where: { owner_id: user.id }
    });
    
    if (!bookstore) {
      // Create bookstore for user
      bookstore = await Bookstore.create({
        owner_id: user.id,
        name: `مكتبة ${user.full_name}`,
        name_arabic: `مكتبة ${user.full_name}`,
        description: 'مكتبة متخصصة في الكتب العربية والأدب',
        description_arabic: 'مكتبة متخصصة في الكتب العربية والأدب',
        address: 'بغداد، العراق',
        address_arabic: 'بغداد، العراق',
        phone: '+964-1-234-5678',
        email: user.email,
        is_approved: true,
        is_active: true,
        governorate: 'بغداد'
      });
      
      console.log('✅ Bookstore created:', bookstore.name);
    } else {
      // Make sure bookstore is approved and active
      if (!bookstore.is_approved || !bookstore.is_active) {
        await bookstore.update({
          is_approved: true,
          is_active: true
        });
        console.log('✅ Bookstore approved and activated');
      }
    }
    
    res.json({
      success: true,
      message: 'تم إصلاح الحساب بنجاح',
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role
      },
      bookstore: {
        id: bookstore.id,
        name: bookstore.name,
        is_approved: bookstore.is_approved,
        is_active: bookstore.is_active
      },
      dashboardUrl: `/library/${bookstore.id}/dashboard`
    });
    
  } catch (error) {
    console.error('Error fixing user account:', error);
    res.status(500).json({
      error: 'Failed to fix account',
      message: 'فشل في إصلاح الحساب'
    });
  }
});

// @route   GET /api/setup/user-info/:userId
// @desc    Get user and bookstore info
// @access  Public (for debugging)
router.get('/user-info/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'full_name', 'email', 'role', 'is_verified']
    });
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    const bookstore = await Bookstore.findOne({
      where: { owner_id: userId }
    });
    
    res.json({
      success: true,
      user,
      bookstore,
      hasBookstore: !!bookstore
    });
    
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({
      error: 'Failed to get user info'
    });
  }
});

module.exports = router;
