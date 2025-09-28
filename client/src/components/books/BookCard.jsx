import { Link } from 'react-router-dom'
import { Star, ShoppingCart, Eye, Heart, MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatPrice, getImageUrl, getBookStatusBadge } from '../../utils/helpers'
import toast from 'react-hot-toast'

const BookCard = ({ book, showBookstore = true }) => {
  const { addToCart, isInCart, getItemQuantity } = useCart()
  const { user, token } = useAuth()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  // Check if book is in wishlist on mount
  useEffect(() => {
    if (user && token) {
      checkWishlistStatus()
    }
  }, [user, token, book.id])

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch(`/api/wishlist/check/${book.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setIsWishlisted(data.wishlisted)
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error)
    }
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (book.stock_quantity === 0) {
      toast.error('هذا الكتاب غير متوفر حالياً')
      return
    }

    const success = addToCart(book, 1)
    if (success) {
      // Toast is handled in the cart context
    }
  }

  const toggleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user || !token) {
      toast.error('يجب تسجيل الدخول أولاً')
      return
    }

    setWishlistLoading(true)
    try {
      const method = isWishlisted ? 'DELETE' : 'POST'
      const response = await fetch(`/api/wishlist/${book.id}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      if (data.success) {
        setIsWishlisted(!isWishlisted)
        toast.success(data.message)
      } else {
        toast.error(data.error || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Wishlist error:', error)
      toast.error('حدث خطأ في إدارة قائمة الأمنيات')
    } finally {
      setWishlistLoading(false)
    }
  }

  const statusBadge = getBookStatusBadge(book)
  const inCart = isInCart(book.id)
  const cartQuantity = getItemQuantity(book.id)

  return (
    <div className="book-card group">
      <Link to={`/books/${book.id}`} className="block">
        {/* Book Image */}
        <div className="relative overflow-hidden">
          <img
            src={getImageUrl(book.image_url)}
            alt={book.title_arabic || book.title}
            className="book-card-image group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/placeholder-book.jpg'
            }}
          />
          
          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className={`absolute top-3 left-3 p-2 rounded-full transition-all duration-200 ${
              isWishlisted 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white text-gray-400 hover:bg-red-500 hover:text-white'
            } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Status Badge */}
          {book.condition !== 'new' && (
            <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs">
              {book.condition === 'like_new' ? 'كالجديد' : 
               book.condition === 'good' ? 'جيد' : 'مقبول'}
            </div>
          )}

          {/* Featured Badge */}
          {book.is_featured && (
            <div className="absolute top-12 right-3 bg-primary-gold text-primary-dark px-2 py-1 rounded text-xs font-medium">
              مميز
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Eye className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Book Info */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-primary-dark mb-2 line-clamp-2 group-hover:text-primary-brown transition-colors">
            {book.title_arabic || book.title}
          </h3>

          {/* Author */}
          <p className="text-gray-600 text-sm mb-2">
            {book.author_arabic || book.author}
          </p>

          {/* Bookstore Info */}
          {showBookstore && book.bookstore && (
            <div className="flex items-center gap-1 mb-3 text-sm text-gray-600">
              <MapPin className="h-3 w-3" />
              <span>{book.bookstore.name_arabic || book.bookstore.name}</span>
              {book.bookstore.governorate && (
                <>
                  <span>•</span>
                  <span>{book.bookstore.governorate}</span>
                </>
              )}
            </div>
          )}

          {/* Rating */}
          {book.rating > 0 && (
            <div className="flex items-center space-x-1 rtl:space-x-reverse mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(book.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">
                ({book.total_reviews || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-lg font-bold text-primary-brown">
                {formatPrice(book.price)}
              </span>
              {book.original_price && book.original_price > book.price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(book.original_price)}
                </span>
              )}
            </div>
            
            {book.original_price && book.original_price > book.price && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                خصم {Math.round(((book.original_price - book.price) / book.original_price) * 100)}%
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={book.stock_quantity === 0}
            className={`w-full flex items-center justify-center space-x-2 rtl:space-x-reverse py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
              book.stock_quantity === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : inCart
                ? 'bg-primary-gold text-primary-dark hover:bg-opacity-90'
                : 'bg-primary-brown text-white hover:bg-opacity-90'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>
              {book.stock_quantity === 0
                ? 'غير متوفر'
                : inCart
                ? `في السلة (${cartQuantity})`
                : 'أضف للسلة'
              }
            </span>
          </button>
        </div>
      </Link>
    </div>
  )
}

export default BookCard
