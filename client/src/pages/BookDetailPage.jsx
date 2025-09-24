import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, ShoppingCart, Heart, Share2, BookOpen, User, Store } from 'lucide-react'
import { booksAPI } from '../utils/api'
import { useCart } from '../contexts/CartContext'
import { formatPrice, getImageUrl, getBookStatusBadge } from '../utils/helpers'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import BookCard from '../components/books/BookCard'
import toast from 'react-hot-toast'

const BookDetailPage = () => {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [relatedBooks, setRelatedBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  const { addToCart, isInCart, getItemQuantity } = useCart()

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true)
        const response = await booksAPI.getBook(id)
        setBook(response.data.book)
        setRelatedBooks(response.data.related_books || [])
      } catch (error) {
        console.error('Error fetching book:', error)
        toast.error('حدث خطأ في تحميل تفاصيل الكتاب')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchBook()
    }
  }, [id])

  const handleAddToCart = () => {
    if (book && book.stock_quantity > 0) {
      const success = addToCart(book, quantity)
      if (success) {
        setQuantity(1)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="جاري تحميل تفاصيل الكتاب..." />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-600 mb-2">الكتاب غير موجود</h1>
          <p className="text-gray-500 mb-6">لم يتم العثور على الكتاب المطلوب</p>
          <Link to="/books" className="btn-primary">
            تصفح الكتب
          </Link>
        </div>
      </div>
    )
  }

  const statusBadge = getBookStatusBadge(book)
  const inCart = isInCart(book.id)
  const cartQuantity = getItemQuantity(book.id)

  return (
    <div className="min-h-screen bg-primary-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/" className="breadcrumb-item">الرئيسية</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/books" className="breadcrumb-item">الكتب</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="text-gray-500">{book.title_arabic || book.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Book Image */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={getImageUrl(book.image_url)}
                alt={book.title_arabic || book.title}
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = '/placeholder-book.jpg'
                }}
              />
              
              {/* Status Badge */}
              <div className={`absolute top-4 right-4 badge ${statusBadge.className}`}>
                {statusBadge.text}
              </div>

              {/* Featured Badge */}
              {book.is_featured && (
                <div className="absolute top-4 left-4 bg-primary-gold text-primary-dark px-3 py-1 rounded-full text-sm font-medium">
                  مميز
                </div>
              )}
            </div>

            {/* Additional Images */}
            {book.images && book.images.length > 0 && (
              <div className="flex space-x-2 rtl:space-x-reverse justify-center">
                {book.images.slice(0, 4).map((image, index) => (
                  <img
                    key={index}
                    src={getImageUrl(image)}
                    alt={`${book.title_arabic || book.title} - ${index + 1}`}
                    className="w-16 h-20 object-cover rounded border-2 border-gray-200 hover:border-primary-brown cursor-pointer transition-colors"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-primary-dark mb-2">
                {book.title_arabic || book.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-4">
                {book.author_arabic || book.author}
              </p>

              {/* Rating */}
              {book.rating > 0 && (
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(book.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({book.total_reviews || 0} تقييم)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center space-x-4 rtl:space-x-reverse mb-6">
                <span className="text-3xl font-bold text-primary-brown">
                  {formatPrice(book.price)}
                </span>
                {book.original_price && book.original_price > book.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(book.original_price)}
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      خصم {Math.round(((book.original_price - book.price) / book.original_price) * 100)}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Book Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg">
              {book.isbn && (
                <div>
                  <span className="text-sm text-gray-600">ISBN:</span>
                  <p className="font-medium english-text" dir="ltr">{book.isbn}</p>
                </div>
              )}
              
              {book.category && (
                <div>
                  <span className="text-sm text-gray-600">التصنيف:</span>
                  <p className="font-medium">{book.category_arabic || book.category}</p>
                </div>
              )}
              
              {book.language && (
                <div>
                  <span className="text-sm text-gray-600">اللغة:</span>
                  <p className="font-medium">
                    {book.language === 'arabic' ? 'العربية' : 
                     book.language === 'english' ? 'الإنجليزية' : 
                     book.language === 'both' ? 'ثنائية اللغة' : book.language}
                  </p>
                </div>
              )}
              
              {book.pages && (
                <div>
                  <span className="text-sm text-gray-600">عدد الصفحات:</span>
                  <p className="font-medium">{book.pages}</p>
                </div>
              )}
              
              {book.publication_year && (
                <div>
                  <span className="text-sm text-gray-600">سنة النشر:</span>
                  <p className="font-medium">{book.publication_year}</p>
                </div>
              )}
              
              {book.publisher && (
                <div>
                  <span className="text-sm text-gray-600">الناشر:</span>
                  <p className="font-medium">{book.publisher_arabic || book.publisher}</p>
                </div>
              )}
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              {book.stock_quantity > 0 && (
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <span className="text-sm text-gray-600">الكمية:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(book.stock_quantity, quantity + 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    متوفر {book.stock_quantity} نسخة
                  </span>
                </div>
              )}

              <div className="flex space-x-4 rtl:space-x-reverse">
                <button
                  onClick={handleAddToCart}
                  disabled={book.stock_quantity === 0}
                  className={`flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                    book.stock_quantity === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : inCart
                      ? 'bg-primary-gold text-primary-dark hover:bg-opacity-90'
                      : 'bg-primary-brown text-white hover:bg-opacity-90'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>
                    {book.stock_quantity === 0
                      ? 'غير متوفر'
                      : inCart
                      ? `في السلة (${cartQuantity})`
                      : 'أضف للسلة'
                    }
                  </span>
                </button>

                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>

                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Bookstore Info */}
            {book.bookstore && (
              <div className="p-4 bg-white rounded-lg">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Store className="w-5 h-5 text-primary-brown" />
                  <div>
                    <p className="font-medium text-primary-dark">
                      {book.bookstore.name_arabic || book.bookstore.name}
                    </p>
                    <Link 
                      to={`/bookstores/${book.bookstore.id}`}
                      className="text-sm text-primary-brown hover:text-primary-dark transition-colors"
                    >
                      زيارة المكتبة
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {(book.description || book.description_arabic) && (
          <div className="bg-white rounded-lg p-6 mb-16">
            <h2 className="text-2xl font-bold text-primary-dark mb-4">وصف الكتاب</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {book.description_arabic || book.description}
              </p>
            </div>
          </div>
        )}

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-primary-dark mb-6">كتب ذات صلة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedBooks.map((relatedBook) => (
                <BookCard key={relatedBook.id} book={relatedBook} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookDetailPage
