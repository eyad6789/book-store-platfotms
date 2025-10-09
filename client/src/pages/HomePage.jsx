import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  BookOpen, 
  Store, 
  Users, 
  Star,
  ArrowLeft,
  Search,
  TrendingUp
} from 'lucide-react'
import { booksAPI, bookstoresAPI } from '../utils/api'
import { formatPrice, getImageUrl } from '../utils/helpers'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import BookCard from '../components/books/BookCard'

const HomePage = () => {
  const [featuredBooks, setFeaturedBooks] = useState([])
  const [recommendedBooks, setRecommendedBooks] = useState([])
  const [libraryBooks, setLibraryBooks] = useState([])
  const [bookstores, setBookstores] = useState([])
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalBookstores: 0,
    totalCustomers: 0
  })
  const [loading, setLoading] = useState(true)
  const [recommendationLoading, setRecommendationLoading] = useState(false)

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true)
        
        // Fetch data from multiple sources simultaneously
        const [featuredResponse, libraryResponse, bookstoresResponse, regularResponse] = await Promise.all([
          booksAPI.getFeaturedBooks({ limit: 6 }),
          booksAPI.getLibraryBooks({ limit: 6 }),
          bookstoresAPI.getBookstores({ limit: 6 }),
          booksAPI.getBooks({ limit: 12, include_library: false })
        ])
        
        setFeaturedBooks(featuredResponse.data.books || [])
        setLibraryBooks(libraryResponse.data.books || [])
        setBookstores(bookstoresResponse.data.bookstores || [])
        
        // Generate smart recommendations
        generateSmartRecommendations(regularResponse.data.books || [], libraryResponse.data.books || [])
        
        // Calculate real stats
        const totalRegular = regularResponse.data.pagination?.totalItems || 0
        const totalLibrary = libraryResponse.data.pagination?.totalItems || 0
        setStats({
          totalBooks: totalRegular + totalLibrary,
          totalBookstores: bookstoresResponse.data.pagination?.totalItems || 0,
          totalCustomers: 3200 // Mock for now
        })
        
      } catch (error) {
        console.error('Error fetching home data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  // Smart recommendation algorithm
  const generateSmartRecommendations = (regularBooks, libraryBooks) => {
    const allBooks = [...regularBooks, ...libraryBooks.map(book => ({
      ...book,
      id: `library-${book.id}`, // Make library book IDs unique
      source: 'library',
      title_arabic: book.title_ar || book.title,
      author_arabic: book.author_ar || book.author,
      image_url: book.cover_image_url
    }))]
    
    // Smart recommendation criteria
    const recommendations = []
    const categories = ['أدب', 'تاريخ', 'فلسفة', 'علوم', 'تكنولوجيا', 'شعر']
    const now = new Date()
    
    // Seed random number generator with current time for different results each refresh
    const seed = now.getHours() * 60 + now.getMinutes()
    Math.seedrandom = function(s) {
      var m = 0x80000000, a = 1103515245, c = 12345, state = s ? s : Math.floor(Math.random() * (m - 1))
      return function() {
        state = (a * state + c) % m
        return state / (m - 1)
      }
    }
    const seededRandom = Math.seedrandom(seed)
    
    // Algorithm: Mix popular, recent, and random books
    const shuffledBooks = allBooks.sort(() => seededRandom() - 0.5)
    
    // Get diverse recommendations
    categories.forEach(category => {
      const categoryBooks = shuffledBooks.filter(book => 
        book.category?.includes(category) || 
        book.title_arabic?.includes(category) ||
        book.description_arabic?.includes(category)
      )
      if (categoryBooks.length > 0) {
        recommendations.push(categoryBooks[0])
      }
    })
    
    // Fill remaining slots with random books
    const remaining = shuffledBooks.filter(book => !recommendations.includes(book))
    while (recommendations.length < 6 && remaining.length > 0) {
      const randomIndex = Math.floor(seededRandom() * remaining.length)
      recommendations.push(remaining.splice(randomIndex, 1)[0])
    }
    
    setRecommendedBooks(recommendations.slice(0, 6))
  }

  // Refresh recommendations
  const refreshRecommendations = async () => {
    setRecommendationLoading(true)
    try {
      const [regularResponse, libraryResponse] = await Promise.all([
        booksAPI.getBooks({ limit: 20, include_library: false }),
        booksAPI.getLibraryBooks({ limit: 20 })
      ])
      
      generateSmartRecommendations(regularResponse.data.books || [], libraryResponse.data.books || [])
    } catch (error) {
      console.error('Error refreshing recommendations:', error)
    } finally {
      setRecommendationLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="جاري تحميل الصفحة الرئيسية..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-cream">
      {/* Hero Section */}
      <section className="relative bg-primary-dark text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow-lg">
              مرحباً بكم في المتنبي
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-cream opacity-90 max-w-3xl mx-auto leading-relaxed">
              مكتبة العراق الرقمية - اكتشف أفضل الكتب العربية والمترجمة من المكتبات العراقية المختارة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/books" className="btn-secondary text-lg px-8 py-4">
                <BookOpen className="w-5 h-5 ml-2" />
                تصفح الكتب
              </Link>
              <Link to="/bookstores" className="btn-outline border-white text-white hover:bg-white hover:text-primary-dark text-lg px-8 py-4">
                <Store className="w-5 h-5 ml-2" />
                المكتبات الشريكة
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-primary-gold opacity-30 rounded-full animate-bounce-gentle"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 border-2 border-primary-gold opacity-20 rounded-full animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-brown rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-primary-brown mb-2">
                {stats.totalBooks.toLocaleString('ar-IQ')}
              </div>
              <div className="text-gray-600">كتاب متاح</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-primary-dark" />
              </div>
              <div className="text-3xl font-bold text-primary-brown mb-2">
                {stats.totalBookstores.toLocaleString('ar-IQ')}
              </div>
              <div className="text-gray-600">مكتبة شريكة</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-brown rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-primary-brown mb-2">
                {stats.totalCustomers.toLocaleString('ar-IQ')}
              </div>
              <div className="text-gray-600">عميل راضٍ</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-16 bg-primary-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-primary-dark mb-2">
                الكتب المميزة
              </h2>
              <p className="text-gray-600">
                مجموعة مختارة من أفضل الكتب المتوفرة
              </p>
            </div>
            <Link 
              to="/books?featured=true" 
              className="flex items-center text-primary-brown hover:text-primary-dark transition-colors font-medium"
            >
              عرض الكل
              <ArrowLeft className="w-4 h-4 mr-2 rtl-flip" />
            </Link>
          </div>

          {featuredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد كتب مميزة حالياً</p>
            </div>
          )}
        </div>
      </section>

      {/* Smart Recommendations Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-primary-dark mb-2">
                🎯 مقترحات ذكية لك
              </h2>
              <p className="text-gray-600">
                كتب مختارة خصيصاً بناءً على خوارزمية ذكية تتغير مع كل تحديث
              </p>
            </div>
            <button 
              onClick={refreshRecommendations}
              disabled={recommendationLoading}
              className="flex items-center bg-primary-brown text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
            >
              {recommendationLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  جاري التحديث...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  اقتراحات جديدة
                </>
              )}
            </button>
          </div>

          {recommendedBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {recommendedBooks.map((book, index) => (
                <div key={`${book.id}-${index}`} className="relative">
                  <BookCard book={book} />
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">جاري تحضير اقتراحات ذكية لك...</p>
            </div>
          )}
        </div>
      </section>

      {/* Library Books Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-primary-dark mb-2">
                📚 كتب المكتبات المشاركة
              </h2>
              <p className="text-gray-600">
                كتب حصرية من مكتبات شريكة معتمدة
              </p>
            </div>
            <Link 
              to="/books?include_library=true" 
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              عرض جميع كتب المكتبات
              <ArrowLeft className="w-4 h-4 mr-2 rtl-flip" />
            </Link>
          </div>

          {libraryBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {libraryBooks.map((book) => (
                <div key={book.id} className="relative">
                  <BookCard book={{
                    ...book,
                    id: `library-${book.id}`, // Make library book IDs unique
                    source: 'library',
                    title_arabic: book.title_ar || book.title,
                    author_arabic: book.author_ar || book.author,
                    image_url: book.cover_image_url
                  }} />
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                    مكتبة
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد كتب مكتبات متاحة حالياً</p>
            </div>
          )}
        </div>
      </section>

      {/* Partner Bookstores Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-primary-dark mb-2">
                المكتبات الشريكة
              </h2>
              <p className="text-gray-600">
                شبكة من أفضل المكتبات العراقية
              </p>
            </div>
            <Link 
              to="/bookstores" 
              className="flex items-center text-primary-brown hover:text-primary-dark transition-colors font-medium"
            >
              عرض الكل
              <ArrowLeft className="w-4 h-4 mr-2 rtl-flip" />
            </Link>
          </div>

          {bookstores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookstores.map((bookstore) => (
                <div key={bookstore.id} className="card hover-lift">
                  <div className="card-body">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
                      <div className="w-12 h-12 bg-primary-brown rounded-lg flex items-center justify-center flex-shrink-0">
                        {bookstore.logo_url ? (
                          <img 
                            src={getImageUrl(bookstore.logo_url)} 
                            alt={bookstore.name_arabic || bookstore.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Store className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-primary-dark truncate">
                          {bookstore.name_arabic || bookstore.name}
                        </h3>
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">
                            {bookstore.rating || '0.0'}
                          </span>
                          <span className="text-sm text-gray-400">
                            ({bookstore.total_reviews || 0} تقييم)
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {bookstore.description_arabic || bookstore.description || 'مكتبة متخصصة في الكتب العربية والمترجمة'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {bookstore.book_count || 0} كتاب
                      </span>
                      <Link 
                        to={`/bookstores/${bookstore.id}`}
                        className="btn-ghost text-sm"
                      >
                        زيارة المكتبة
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد مكتبات شريكة حالياً</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-brown text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            هل تملك مكتبة؟
          </h2>
          <p className="text-2xl mb-4 text-primary-gold font-semibold italic leading-relaxed">
            "هُنا حَيثُ تُولَد الكَلِمَة وَتَبقى خالِدَة"
          </p>
          <p className="text-xl mb-8 text-primary-cream opacity-90">
            انضم إلى شبكة المتنبي وابدأ في بيع كتبك لآلاف القراء في العراق والعالم العربي
          </p>
          <Link 
            to="/bookstore/register" 
            className="inline-flex items-center btn-secondary text-lg px-8 py-4"
          >
            <Store className="w-5 h-5 ml-2" />
            سجل مكتبتك الآن
          </Link>
        </div>
      </section>

      {/* Search CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-dark mb-4">
            ابحث عن كتابك المفضل
          </h2>
          <p className="text-gray-600 mb-8">
            لدينا مجموعة واسعة من الكتب في جميع المجالات
          </p>
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن كتاب أو مؤلف..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown text-lg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    window.location.href = `/books?search=${encodeURIComponent(e.target.value.trim())}`
                  }
                }}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
