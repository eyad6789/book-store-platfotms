import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { MapPin, Phone, CreditCard, Truck, CheckCircle } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { ordersAPI } from '../utils/api'
import { formatPrice, getImageUrl } from '../utils/helpers'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const CheckoutPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderData, setOrderData] = useState(null)
  
  const { items, getCartSummary, clearCart, validateCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    defaultValues: {
      delivery_address: '',
      delivery_phone: user?.phone || '',
      delivery_notes: '',
      payment_method: 'cash_on_delivery'
    }
  })

  const summary = getCartSummary()

  // Redirect if cart is empty
  if (items.length === 0 && !orderSuccess) {
    navigate('/cart')
    return null
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      // Validate cart items
      const isValid = await validateCart()
      if (!isValid) {
        setIsLoading(false)
        return
      }

      // Prepare order data
      const orderPayload = {
        items: items.map(item => ({
          book_id: item.id,
          quantity: item.quantity
        })),
        delivery_address: data.delivery_address,
        delivery_phone: data.delivery_phone,
        delivery_notes: data.delivery_notes,
        payment_method: data.payment_method
      }

      // Create order
      const response = await ordersAPI.createOrder(orderPayload)
      
      if (response.data) {
        setOrderData(response.data.order)
        setOrderSuccess(true)
        clearCart()
        toast.success('تم إنشاء طلبك بنجاح!')
      }

    } catch (error) {
      console.error('Checkout error:', error)
      const message = error.response?.data?.message || 'حدث خطأ أثناء إنشاء الطلب'
      toast.error(message)
      
      if (error.response?.data?.details) {
        error.response.data.details.forEach(detail => {
          setError(detail.field, {
            type: 'manual',
            message: detail.message
          })
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Success page
  if (orderSuccess && orderData) {
    return (
      <div className="min-h-screen bg-primary-cream">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold text-primary-dark mb-4">
              تم إنشاء طلبك بنجاح!
            </h1>
            
            <p className="text-gray-600 mb-6">
              رقم الطلب: <span className="font-mono font-bold">{orderData.order_number}</span>
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-right">
              <h3 className="font-semibold text-primary-dark mb-4">تفاصيل الطلب:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>المجموع الكلي:</span>
                  <span className="font-bold">{formatPrice(orderData.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>طريقة الدفع:</span>
                  <span>
                    {orderData.payment_method === 'cash_on_delivery' ? 'الدفع عند الاستلام' : orderData.payment_method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>حالة الطلب:</span>
                  <span className="text-yellow-600">في الانتظار</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate(`/orders/${orderData.id}`)}
                className="w-full btn-primary"
              >
                عرض تفاصيل الطلب
              </button>
              
              <button
                onClick={() => navigate('/books')}
                className="w-full btn-outline"
              >
                متابعة التسوق
              </button>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                سيتم التواصل معك قريباً لتأكيد الطلب وتحديد موعد التسليم.
                يمكنك متابعة حالة طلبك من صفحة "طلباتي".
              </p>
            </div>
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
            إتمام الطلب
          </h1>
          <p className="text-gray-600">
            أكمل معلومات التسليم لإتمام طلبك
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
                  <MapPin className="w-6 h-6 text-primary-brown" />
                  <h2 className="text-xl font-semibold text-primary-dark">
                    معلومات التسليم
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Delivery Address */}
                  <div>
                    <label htmlFor="delivery_address" className="form-label">
                      عنوان التسليم *
                    </label>
                    <textarea
                      id="delivery_address"
                      rows={3}
                      className={`input-field ${errors.delivery_address ? 'input-error' : ''}`}
                      placeholder="أدخل العنوان الكامل للتسليم..."
                      {...register('delivery_address', {
                        required: 'عنوان التسليم مطلوب',
                        minLength: {
                          value: 10,
                          message: 'يرجى إدخال عنوان مفصل'
                        }
                      })}
                    />
                    {errors.delivery_address && (
                      <p className="form-error">{errors.delivery_address.message}</p>
                    )}
                  </div>

                  {/* Delivery Phone */}
                  <div>
                    <label htmlFor="delivery_phone" className="form-label">
                      رقم الهاتف للتسليم *
                    </label>
                    <div className="relative">
                      <input
                        id="delivery_phone"
                        type="tel"
                        className={`input-field pl-10 ${errors.delivery_phone ? 'input-error' : ''}`}
                        placeholder="+964 770 123 4567"
                        {...register('delivery_phone', {
                          required: 'رقم الهاتف مطلوب للتسليم',
                          pattern: {
                            value: /^[\+]?[0-9\s\-\(\)]+$/,
                            message: 'يرجى إدخال رقم هاتف صحيح'
                          }
                        })}
                      />
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                    {errors.delivery_phone && (
                      <p className="form-error">{errors.delivery_phone.message}</p>
                    )}
                  </div>

                  {/* Delivery Notes */}
                  <div>
                    <label htmlFor="delivery_notes" className="form-label">
                      ملاحظات التسليم (اختياري)
                    </label>
                    <textarea
                      id="delivery_notes"
                      rows={2}
                      className="input-field"
                      placeholder="أي ملاحظات خاصة للتسليم..."
                      {...register('delivery_notes')}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
                  <CreditCard className="w-6 h-6 text-primary-brown" />
                  <h2 className="text-xl font-semibold text-primary-dark">
                    طريقة الدفع
                  </h2>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center space-x-3 rtl:space-x-reverse p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      value="cash_on_delivery"
                      className="text-primary-brown focus:ring-primary-brown"
                      {...register('payment_method')}
                    />
                    <Truck className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="font-medium">الدفع عند الاستلام</div>
                      <div className="text-sm text-gray-600">
                        ادفع نقداً عند استلام الكتب
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 rtl:space-x-reverse p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors opacity-50">
                    <input
                      type="radio"
                      value="bank_transfer"
                      disabled
                      className="text-primary-brown focus:ring-primary-brown"
                      {...register('payment_method')}
                    />
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="font-medium">التحويل البنكي</div>
                      <div className="text-sm text-gray-600">
                        قريباً - غير متاح حالياً
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-primary-dark mb-6">
                  ملخص الطلب
                </h2>

                {/* Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 rtl:space-x-reverse">
                      <img
                        src={getImageUrl(item.image_url)}
                        alt={item.title_arabic || item.title}
                        className="w-12 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.src = '/placeholder-book.jpg'
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary-dark truncate">
                          {item.title_arabic || item.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          الكمية: {item.quantity}
                        </p>
                        <p className="text-sm font-medium text-primary-brown">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="space-y-3 mb-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">المجموع الفرعي:</span>
                    <span>{formatPrice(summary.subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">الشحن:</span>
                    <span>
                      {summary.shipping === 0 ? (
                        <span className="text-green-600">مجاني</span>
                      ) : (
                        formatPrice(summary.shipping)
                      )}
                    </span>
                  </div>

                  {summary.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">الضريبة:</span>
                      <span>{formatPrice(summary.tax)}</span>
                    </div>
                  )}

                  <hr />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>المجموع الكلي:</span>
                    <span className="text-primary-brown">
                      {formatPrice(summary.total)}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="small" color="white" className="ml-2" />
                      جاري إنشاء الطلب...
                    </>
                  ) : (
                    'تأكيد الطلب'
                  )}
                </button>

                {/* Security Notice */}
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-800">
                    🔒 معلوماتك محمية وآمنة. لن يتم خصم أي مبلغ حتى تأكيد الطلب.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckoutPage
