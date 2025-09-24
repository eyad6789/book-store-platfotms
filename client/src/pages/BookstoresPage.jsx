import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Store, Star, Search, MapPin, Phone, Mail } from 'lucide-react'
import { bookstoresAPI } from '../utils/api'
import { getImageUrl } from '../utils/helpers'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const BookstoresPage = () => {
  const [bookstores, setBookstores] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    const fetchBookstores = async () => {
      try {
        setLoading(true)
        const params = {}
        if (searchQuery.trim()) {
          params.search = searchQuery.trim()
        }
        
        const response = await bookstoresAPI.getBookstores(params)
        setBookstores(response.data.bookstores || [])
        setPagination(response.data.pagination || {})
      } catch (error) {
        console.error('Error fetching bookstores:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookstores()
  }, [searchQuery])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="جاري تحميل المكتبات..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-dark mb-4">
            المكتبات الشريكة
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            شبكة من أفضل المكتبات العراقية المختارة بعناية لتقديم أجود الكتب العربية والمترجمة
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن مكتبة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Results */}
        <div className="mb-8">
          <p className="text-gray-600 text-center">
            {bookstores.length} مكتبة شريكة
          </p>
        </div>

        {/* Bookstores Grid */}
        {bookstores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookstores.map((bookstore) => (
              <div key={bookstore.id} className="card hover-lift">
                <div className="card-body">
                  {/* Header */}
                  <div className="flex items-center space-x-4 rtl:space-x-reverse mb-6">
                    <div className="w-16 h-16 bg-primary-brown rounded-lg flex items-center justify-center flex-shrink-0">
                      {bookstore.logo_url ? (
                        <img 
                          src={getImageUrl(bookstore.logo_url)} 
                          alt={bookstore.name_arabic || bookstore.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Store className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-primary-dark mb-1 truncate">
                        {bookstore.name_arabic || bookstore.name}
                      </h3>
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          {bookstore.rating || '0.0'}
                        </span>
                        <span className="text-sm text-gray-400">
                          ({bookstore.total_reviews || 0})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                    {bookstore.description_arabic || bookstore.description || 'مكتبة متخصصة في الكتب العربية والمترجمة'}
                  </p>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-6">
                    {bookstore.address && (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{bookstore.address_arabic || bookstore.address}</span>
                      </div>
                    )}
                    
                    {bookstore.phone && (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span className="english-text" dir="ltr">{bookstore.phone}</span>
                      </div>
                    )}
                    
                    {bookstore.email && (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="english-text" dir="ltr">{bookstore.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary-brown">
                        {bookstore.book_count || 0}
                      </div>
                      <div className="text-xs text-gray-600">كتاب</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary-brown">
                        {bookstore.total_reviews || 0}
                      </div>
                      <div className="text-xs text-gray-600">تقييم</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary-brown">
                        {bookstore.rating || '0.0'}
                      </div>
                      <div className="text-xs text-gray-600">نجمة</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link 
                    to={`/bookstores/${bookstore.id}`}
                    className="w-full btn-primary text-center block"
                  >
                    زيارة المكتبة
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              لا توجد مكتبات
            </h3>
            <p className="text-gray-500">
              {searchQuery ? 'جرب البحث بكلمات مختلفة' : 'لا توجد مكتبات شريكة حالياً'}
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-20 text-center bg-white rounded-lg p-12">
          <Store className="w-16 h-16 text-primary-brown mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-primary-dark mb-4">
            هل تملك مكتبة؟
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            انضم إلى شبكة المتنبي وابدأ في بيع كتبك لآلاف القراء في العراق والعالم العربي. 
            نوفر لك منصة متكاملة لإدارة مكتبتك وعرض كتبك بأفضل شكل ممكن.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center rtl:space-x-reverse">
            <Link to="/bookstore/register" className="btn-primary">
              سجل مكتبتك الآن
            </Link>
            <Link to="/help" className="btn-outline">
              تعرف على المزيد
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookstoresPage
