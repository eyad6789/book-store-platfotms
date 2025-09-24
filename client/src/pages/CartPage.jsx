import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { formatPrice, getImageUrl } from '../utils/helpers'

const CartPage = () => {
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartSummary 
  } = useCart()
  const { isAuthenticated } = useAuth()

  const summary = getCartSummary()

  const handleQuantityChange = (bookId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(bookId)
    } else {
      updateQuantity(bookId, newQuantity)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-primary-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-primary-dark mb-4">
              سلة التسوق فارغة
            </h1>
            <p className="text-gray-600 mb-8">
              لم تقم بإضافة أي كتب إلى سلة التسوق بعد
            </p>
            <Link to="/books" className="btn-primary">
              تصفح الكتب
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-dark mb-2">
            سلة التسوق
          </h1>
          <p className="text-gray-600">
            لديك {items.length} {items.length === 1 ? 'كتاب' : 'كتب'} في السلة
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-primary-dark">
                  الكتب المحددة
                </h2>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                >
                  إفراغ السلة
                </button>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                      {/* Book Image */}
                      <Link to={`/books/${item.id}`} className="flex-shrink-0">
                        <img
                          src={getImageUrl(item.image_url)}
                          alt={item.title_arabic || item.title}
                          className="w-20 h-28 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/placeholder-book.jpg'
                          }}
                        />
                      </Link>

                      {/* Book Details */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/books/${item.id}`}
                          className="block hover:text-primary-brown transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-primary-dark mb-1 line-clamp-2">
                            {item.title_arabic || item.title}
                          </h3>
                        </Link>
                        
                        <p className="text-gray-600 text-sm mb-2">
                          {item.author_arabic || item.author}
                        </p>

                        {item.bookstore && (
                          <p className="text-xs text-gray-500 mb-3">
                            {item.bookstore.name_arabic || item.bookstore.name}
                          </p>
                        )}

                        {/* Price */}
                        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                          <span className="text-lg font-bold text-primary-brown">
                            {formatPrice(item.price)}
                          </span>
                          <span className="text-sm text-gray-500">
                            للنسخة الواحدة
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <span className="text-sm text-gray-600">الكمية:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="p-2 hover:bg-gray-100 transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              
                              <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-2 hover:bg-gray-100 transition-colors"
                                disabled={item.quantity >= item.stock_quantity}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {item.quantity >= item.stock_quantity && (
                              <span className="text-xs text-orange-600">
                                الحد الأقصى المتاح
                              </span>
                            )}
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-800 p-2 transition-colors"
                            title="حذف من السلة"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              المجموع الفرعي:
                            </span>
                            <span className="text-lg font-semibold text-primary-brown">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-primary-dark mb-6">
                ملخص الطلب
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">المجموع الفرعي:</span>
                  <span className="font-medium">
                    {formatPrice(summary.subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">الشحن:</span>
                  <span className="font-medium">
                    {summary.shipping === 0 ? (
                      <span className="text-green-600">مجاني</span>
                    ) : (
                      formatPrice(summary.shipping)
                    )}
                  </span>
                </div>

                {summary.shipping === 0 && summary.subtotal < 50 && (
                  <p className="text-xs text-gray-500">
                    الشحن مجاني للطلبات أكثر من {formatPrice(50)}
                  </p>
                )}

                {summary.tax > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">الضريبة:</span>
                    <span className="font-medium">
                      {formatPrice(summary.tax)}
                    </span>
                  </div>
                )}

                <hr className="border-gray-200" />

                <div className="flex items-center justify-between text-lg font-bold">
                  <span className="text-primary-dark">المجموع الكلي:</span>
                  <span className="text-primary-brown">
                    {formatPrice(summary.total)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              {isAuthenticated ? (
                <Link
                  to="/checkout"
                  className="w-full btn-primary text-center block mb-4"
                >
                  متابعة الدفع
                </Link>
              ) : (
                <div className="space-y-3 mb-4">
                  <Link
                    to="/login"
                    state={{ from: { pathname: '/checkout' } }}
                    className="w-full btn-primary text-center block"
                  >
                    تسجيل الدخول للمتابعة
                  </Link>
                  <Link
                    to="/register"
                    className="w-full btn-outline text-center block"
                  >
                    إنشاء حساب جديد
                  </Link>
                </div>
              )}

              {/* Continue Shopping */}
              <Link
                to="/books"
                className="w-full btn-ghost text-center block flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <ArrowLeft className="w-4 h-4 rtl-flip" />
                <span>متابعة التسوق</span>
              </Link>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800">
                  🔒 معاملاتك آمنة ومحمية. نحن نحترم خصوصيتك ولا نشارك معلوماتك مع أطراف ثالثة.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Books */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-primary-dark mb-6">
            قد يعجبك أيضاً
          </h2>
          <div className="bg-white rounded-lg p-6">
            <p className="text-gray-600 text-center">
              سيتم عرض الكتب المقترحة هنا بناءً على اختياراتك
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
