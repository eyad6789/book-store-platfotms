import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Store, Star, MapPin, Phone, Mail, BookOpen } from 'lucide-react'
import { bookstoresAPI } from '../utils/api'
import { getImageUrl } from '../utils/helpers'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import BookCard from '../components/books/BookCard'

const BookstoreDetailPage = () => {
  const { id } = useParams()
  const [bookstore, setBookstore] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookstore = async () => {
      try {
        setLoading(true)
        const response = await bookstoresAPI.getBookstore(id)
        setBookstore(response.data.bookstore)
      } catch (error) {
        console.error('Error fetching bookstore:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchBookstore()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="جاري تحميل تفاصيل المكتبة..." />
      </div>
    )
  }

  if (!bookstore) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-600 mb-2">المكتبة غير موجودة</h1>
          <p className="text-gray-500">لم يتم العثور على المكتبة المطلوبة</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8 rtl:space-x-reverse">
            {/* Logo */}
            <div className="w-32 h-32 bg-primary-brown rounded-lg flex items-center justify-center flex-shrink-0">
              {bookstore.logo_url ? (
                <img 
                  src={getImageUrl(bookstore.logo_url)} 
                  alt={bookstore.name_arabic || bookstore.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Store className="w-16 h-16 text-white" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-primary-dark mb-2">
                {bookstore.name_arabic || bookstore.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(bookstore.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-medium">
                  {bookstore.rating || '0.0'}
                </span>
                <span className="text-gray-600">
                  ({bookstore.total_reviews || 0} تقييم)
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                {bookstore.description_arabic || bookstore.description || 'مكتبة متخصصة في الكتب العربية والمترجمة'}
              </p>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookstore.address && (
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <MapPin className="w-5 h-5 text-primary-brown flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-sm text-gray-600">العنوان:</span>
                      <p className="font-medium">{bookstore.address_arabic || bookstore.address}</p>
                    </div>
                  </div>
                )}
                
                {bookstore.phone && (
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Phone className="w-5 h-5 text-primary-brown flex-shrink-0" />
                    <div>
                      <span className="text-sm text-gray-600">الهاتف:</span>
                      <p className="font-medium english-text" dir="ltr">{bookstore.phone}</p>
                    </div>
                  </div>
                )}
                
                {bookstore.email && (
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Mail className="w-5 h-5 text-primary-brown flex-shrink-0" />
                    <div>
                      <span className="text-sm text-gray-600">البريد الإلكتروني:</span>
                      <p className="font-medium english-text" dir="ltr">{bookstore.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-50 rounded-lg p-6 min-w-[200px]">
              <div className="text-center space-y-4">
                <div>
                  <div className="text-2xl font-bold text-primary-brown">
                    {bookstore.book_count || 0}
                  </div>
                  <div className="text-sm text-gray-600">كتاب متاح</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-brown">
                    {bookstore.total_reviews || 0}
                  </div>
                  <div className="text-sm text-gray-600">تقييم</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Books Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-primary-dark">
              كتب المكتبة
            </h2>
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600">
              <BookOpen className="w-5 h-5" />
              <span>{bookstore.books?.length || 0} كتاب</span>
            </div>
          </div>

          {bookstore.books && bookstore.books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bookstore.books.map((book) => (
                <BookCard key={book.id} book={book} showBookstore={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                لا توجد كتب حالياً
              </h3>
              <p className="text-gray-500">
                هذه المكتبة لم تضف أي كتب بعد
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookstoreDetailPage
