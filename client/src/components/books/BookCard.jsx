import { Link } from 'react-router-dom'
import { Star, ShoppingCart, Eye } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { formatPrice, getImageUrl, getBookStatusBadge } from '../../utils/helpers'
import toast from 'react-hot-toast'

const BookCard = ({ book, showBookstore = true }) => {
  const { addToCart, isInCart, getItemQuantity } = useCart()

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
          
          {/* Status Badge */}
          <div className={`absolute top-2 right-2 badge ${statusBadge.className} text-xs`}>
            {statusBadge.text}
          </div>

          {/* Featured Badge */}
          {book.is_featured && (
            <div className="absolute top-2 left-2 bg-primary-gold text-primary-dark px-2 py-1 rounded text-xs font-medium">
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

          {/* Bookstore */}
          {showBookstore && book.bookstore && (
            <p className="text-xs text-gray-500 mb-2">
              {book.bookstore.name_arabic || book.bookstore.name}
            </p>
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
