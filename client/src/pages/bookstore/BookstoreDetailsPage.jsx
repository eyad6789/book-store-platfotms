import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Store, MapPin, Phone, Mail, Clock, Star } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import LibraryRating from '../../components/ratings/LibraryRating';

function BookstoreDetailsPage() {
  const { bookstoreId } = useParams();
  const [bookstore, setBookstore] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookstoreId) {
      fetchBookstoreDetails();
    }
  }, [bookstoreId]);

  const fetchBookstoreDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch bookstore details
      const bookstoreResponse = await fetch(`/api/bookstores/${bookstoreId}`);
      if (bookstoreResponse.ok) {
        const bookstoreResult = await bookstoreResponse.json();
        setBookstore(bookstoreResult.data);
      }

      // Fetch bookstore books
      const booksResponse = await fetch(`/api/books?bookstore=${bookstoreId}`);
      if (booksResponse.ok) {
        const booksResult = await booksResponse.json();
        setBooks(booksResult.data || []);
      }

    } catch (error) {
      console.error('Error fetching bookstore details:', error);
      setError('حدث خطأ في تحميل بيانات المكتبة');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="جاري تحميل بيانات المكتبة..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!bookstore) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">المكتبة غير موجودة</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Bookstore Header */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-soft">
              <Store className="w-12 h-12 text-white" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {bookstore.name_arabic || bookstore.name}
              </h1>
              
              {/* Rating Display */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(bookstore.rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {bookstore.rating ? bookstore.rating.toFixed(1) : '0.0'}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({bookstore.total_reviews || 0} تقييم)
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                {bookstore.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{bookstore.address_arabic || bookstore.address}</span>
                  </div>
                )}
                
                {bookstore.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{bookstore.phone}</span>
                  </div>
                )}
                
                {bookstore.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{bookstore.email}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>عضو منذ {new Date(bookstore.created_at).getFullYear()}</span>
                </div>
              </div>
              
              {bookstore.description && (
                <p className="mt-4 text-gray-700 leading-relaxed">
                  {bookstore.description_arabic || bookstore.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Books Section */}
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              كتب المكتبة ({books.length})
            </h2>
          </div>
          
          <div className="p-6">
            {books.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {books.map(book => (
                  <div key={book.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                    {book.cover_image_url && (
                      <img
                        src={book.cover_image_url}
                        alt={book.title_arabic || book.title}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {book.title_arabic || book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {book.author_arabic || book.author}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        {book.price.toLocaleString()} د.ع
                      </span>
                      {book.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">
                            {book.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>لا توجد كتب متاحة حالياً</p>
              </div>
            )}
          </div>
        </div>

        {/* Rating and Reviews Section */}
        <LibraryRating 
          bookstoreId={bookstoreId} 
          showReviews={true}
        />
        
      </div>
    </div>
  );
}

export default BookstoreDetailsPage;
