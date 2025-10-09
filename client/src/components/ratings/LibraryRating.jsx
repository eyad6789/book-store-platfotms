import { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, Calendar, User } from 'lucide-react';
import StarRating from '../ui/StarRating';
import LoadingSpinner from '../ui/LoadingSpinner';

function LibraryRating({ bookstoreId, showReviews = true }) {
  const [ratingStats, setRatingStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    review_title: '',
    review_text: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (bookstoreId) {
      fetchRatingStats();
      if (showReviews) {
        fetchReviews();
      }
    }
  }, [bookstoreId, showReviews, currentPage]);

  const fetchRatingStats = async () => {
    try {
      const response = await fetch(`/api/ratings/library/${bookstoreId}/stats`);
      if (response.ok) {
        const result = await response.json();
        setRatingStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching rating stats:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/ratings/library/${bookstoreId}/reviews?page=${currentPage}&limit=5`
      );
      if (response.ok) {
        const result = await response.json();
        setReviews(result.data.reviews);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (newReview.rating === 0) {
      alert('يرجى اختيار تقييم');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/ratings/library/${bookstoreId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newReview)
      });

      const result = await response.json();

      if (response.ok) {
        alert('تم إضافة التقييم بنجاح');
        setNewReview({ rating: 0, review_title: '', review_text: '' });
        setShowReviewForm(false);
        fetchRatingStats();
        fetchReviews();
      } else {
        alert(result.error || 'حدث خطأ في إضافة التقييم');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('حدث خطأ في إضافة التقييم');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/ratings/library/review/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchReviews(); // Refresh reviews to show updated helpful count
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  if (!ratingStats) {
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner size="medium" text="جاري تحميل التقييمات..." />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Rating Overview */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">تقييم المكتبة</h3>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            إضافة تقييم
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {ratingStats.bookstore.rating.toFixed(1)}
            </div>
            <StarRating 
              rating={ratingStats.bookstore.rating} 
              readonly 
              size="large" 
              showValue={false}
            />
            <p className="text-sm text-gray-600 mt-2">
              بناءً على {ratingStats.bookstore.total_reviews} تقييم
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 w-8">
                  {star} ⭐
                </span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-yellow-400 rounded-full"
                    style={{
                      width: `${
                        ratingStats.bookstore.total_reviews > 0
                          ? (ratingStats.distribution[star] / ratingStats.bookstore.total_reviews) * 100
                          : 0
                      }%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {ratingStats.distribution[star]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">إضافة تقييم جديد</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التقييم *
              </label>
              <StarRating
                rating={newReview.rating}
                onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                size="large"
                showValue={false}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان التقييم
              </label>
              <input
                type="text"
                value={newReview.review_title}
                onChange={(e) => setNewReview(prev => ({ ...prev, review_title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="اكتب عنواناً لتقييمك..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التقييم التفصيلي
              </label>
              <textarea
                value={newReview.review_text}
                onChange={(e) => setNewReview(prev => ({ ...prev, review_text: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="شاركنا تجربتك مع هذه المكتبة..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || newReview.rating === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {showReviews && (
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              التقييمات ({ratingStats.bookstore.total_reviews})
            </h4>
          </div>

          <div className="divide-y">
            {loading ? (
              <div className="p-6 text-center">
                <LoadingSpinner size="medium" text="جاري تحميل التقييمات..." />
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>لا توجد تقييمات بعد</p>
                <p className="text-sm">كن أول من يقيم هذه المكتبة</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">
                          {review.user?.full_name || 'مستخدم'}
                        </h5>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} readonly size="small" showValue={false} />
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(review.created_at).toLocaleDateString('ar-IQ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {review.review_title && (
                    <h6 className="font-medium text-gray-900 mb-2">
                      {review.review_title}
                    </h6>
                  )}

                  {review.review_text && (
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {review.review_text}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleMarkHelpful(review.id)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      مفيد ({review.helpful_count})
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  السابق
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  صفحة {pagination.currentPage} من {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LibraryRating;
