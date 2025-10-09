const { LibraryReview, User, Bookstore } = require('../models');
const { sequelize } = require('../config/database');
const { Op, fn, col } = require('sequelize');

// Create a library review
const createLibraryReview = async (req, res) => {
  try {
    const { bookstoreId } = req.params;
    const { rating, review_title, review_text } = req.body;
    const userId = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'التقييم مطلوب ويجب أن يكون بين 1 و 5 نجوم'
      });
    }

    // Check if bookstore exists
    const bookstore = await Bookstore.findByPk(bookstoreId);
    if (!bookstore) {
      return res.status(404).json({
        error: 'المكتبة غير موجودة'
      });
    }

    // Check if user already reviewed this library
    const existingReview = await LibraryReview.findOne({
      where: { bookstore_id: bookstoreId, user_id: userId }
    });

    if (existingReview) {
      return res.status(400).json({
        error: 'لقد قمت بتقييم هذه المكتبة من قبل. يمكنك تعديل تقييمك الحالي.'
      });
    }

    // Create the review
    const review = await LibraryReview.create({
      bookstore_id: bookstoreId,
      user_id: userId,
      rating,
      review_title,
      review_text,
      is_verified_purchase: false // TODO: Check if user has purchased from this library
    });

    // Get the created review with user info
    const reviewWithUser = await LibraryReview.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'تم إضافة التقييم بنجاح',
      data: reviewWithUser
    });

  } catch (error) {
    console.error('Error creating library review:', error);
    res.status(500).json({
      error: 'حدث خطأ في إضافة التقييم',
      message: error.message
    });
  }
};

// Get library reviews
const getLibraryReviews = async (req, res) => {
  try {
    const { bookstoreId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    const offset = (page - 1) * limit;
    
    // Determine sort order
    let order;
    switch (sort) {
      case 'oldest':
        order = [['created_at', 'ASC']];
        break;
      case 'highest':
        order = [['rating', 'DESC'], ['created_at', 'DESC']];
        break;
      case 'lowest':
        order = [['rating', 'ASC'], ['created_at', 'DESC']];
        break;
      case 'helpful':
        order = [['helpful_count', 'DESC'], ['created_at', 'DESC']];
        break;
      default: // newest
        order = [['created_at', 'DESC']];
    }

    const reviews = await LibraryReview.findAndCountAll({
      where: { bookstore_id: bookstoreId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name']
        }
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        reviews: reviews.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(reviews.count / limit),
          totalReviews: reviews.count,
          hasNext: offset + reviews.rows.length < reviews.count,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching library reviews:', error);
    res.status(500).json({
      error: 'حدث خطأ في تحميل التقييمات',
      message: error.message
    });
  }
};

// Get library rating statistics
const getLibraryRatingStats = async (req, res) => {
  try {
    const { bookstoreId } = req.params;

    // Get bookstore with rating info
    const bookstore = await Bookstore.findByPk(bookstoreId, {
      attributes: ['id', 'name', 'name_arabic', 'rating', 'total_reviews']
    });

    if (!bookstore) {
      return res.status(404).json({
        error: 'المكتبة غير موجودة'
      });
    }

    // Get rating distribution using raw query to avoid sequelize function issues
    const ratingDistribution = await sequelize.query(`
      SELECT rating, COUNT(*) as count 
      FROM library_reviews 
      WHERE bookstore_id = :bookstoreId 
      GROUP BY rating 
      ORDER BY rating DESC
    `, {
      replacements: { bookstoreId },
      type: sequelize.QueryTypes.SELECT
    });

    // Convert to object for easier frontend use
    const distribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    
    ratingDistribution.forEach(item => {
      distribution[item.rating] = parseInt(item.count);
    });

    // Get recent reviews
    const recentReviews = await LibraryReview.findAll({
      where: { bookstore_id: bookstoreId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        bookstore: {
          id: bookstore.id,
          name: bookstore.name,
          name_arabic: bookstore.name_arabic,
          rating: parseFloat(bookstore.rating) || 0,
          total_reviews: bookstore.total_reviews || 0
        },
        distribution,
        recentReviews
      }
    });

  } catch (error) {
    console.error('Error fetching library rating stats:', error);
    res.status(500).json({
      error: 'حدث خطأ في تحميل إحصائيات التقييم',
      message: error.message
    });
  }
};

// Update library review
const updateLibraryReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, review_title, review_text } = req.body;
    const userId = req.user.id;

    // Find the review
    const review = await LibraryReview.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({
        error: 'التقييم غير موجود'
      });
    }

    // Check if user owns this review
    if (review.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'غير مسموح لك بتعديل هذا التقييم'
      });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        error: 'التقييم يجب أن يكون بين 1 و 5 نجوم'
      });
    }

    // Update the review
    await review.update({
      rating: rating || review.rating,
      review_title: review_title !== undefined ? review_title : review.review_title,
      review_text: review_text !== undefined ? review_text : review.review_text
    });

    // Get updated review with user info
    const updatedReview = await LibraryReview.findByPk(reviewId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name']
        }
      ]
    });

    res.json({
      success: true,
      message: 'تم تحديث التقييم بنجاح',
      data: updatedReview
    });

  } catch (error) {
    console.error('Error updating library review:', error);
    res.status(500).json({
      error: 'حدث خطأ في تحديث التقييم',
      message: error.message
    });
  }
};

// Delete library review
const deleteLibraryReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // Find the review
    const review = await LibraryReview.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({
        error: 'التقييم غير موجود'
      });
    }

    // Check if user owns this review or is admin
    if (review.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'غير مسموح لك بحذف هذا التقييم'
      });
    }

    // Delete the review
    await review.destroy();

    res.json({
      success: true,
      message: 'تم حذف التقييم بنجاح'
    });

  } catch (error) {
    console.error('Error deleting library review:', error);
    res.status(500).json({
      error: 'حدث خطأ في حذف التقييم',
      message: error.message
    });
  }
};

// Mark review as helpful
const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Find the review
    const review = await LibraryReview.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({
        error: 'التقييم غير موجود'
      });
    }

    // Increment helpful count
    await review.increment('helpful_count');

    res.json({
      success: true,
      message: 'شكراً لك على تقييم هذا التعليق',
      data: {
        helpful_count: review.helpful_count + 1
      }
    });

  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({
      error: 'حدث خطأ في تسجيل التقييم',
      message: error.message
    });
  }
};

module.exports = {
  createLibraryReview,
  getLibraryReviews,
  getLibraryRatingStats,
  updateLibraryReview,
  deleteLibraryReview,
  markReviewHelpful
};
