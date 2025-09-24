import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Package, MapPin, Phone, CreditCard, Truck, ArrowLeft } from 'lucide-react'
import { ordersAPI } from '../utils/api'
import { formatPrice, formatDateTime, getOrderStatusBadge, getPaymentStatusBadge } from '../utils/helpers'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const OrderDetailPage = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const response = await ordersAPI.getOrder(id)
        setOrder(response.data.order)
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchOrder()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="جاري تحميل تفاصيل الطلب..." />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-600 mb-2">الطلب غير موجود</h1>
          <p className="text-gray-500 mb-6">لم يتم العثور على الطلب المطلوب</p>
          <Link to="/orders" className="btn-primary">
            العودة للطلبات
          </Link>
        </div>
      </div>
    )
  }

  const statusBadge = getOrderStatusBadge(order.status)
  const paymentBadge = getPaymentStatusBadge(order.payment_status)

  return (
    <div className="min-h-screen bg-primary-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/orders"
          className="inline-flex items-center space-x-2 rtl:space-x-reverse text-primary-brown hover:text-primary-dark transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 rtl-flip" />
          <span>العودة للطلبات</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary-dark mb-2">
                طلب رقم: {order.order_number}
              </h1>
              <p className="text-gray-600">
                تاريخ الطلب: {formatDateTime(order.created_at)}
              </p>
            </div>
            
            <div className="flex flex-col sm:items-end space-y-2">
              <span className={`badge ${statusBadge.className} text-sm`}>
                {statusBadge.text}
              </span>
              <span className={`badge ${paymentBadge.className} text-sm`}>
                {paymentBadge.text}
              </span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-primary-brown">
                {formatPrice(order.total_amount)}
              </div>
              <div className="text-sm text-gray-600">المجموع الكلي</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-primary-brown">
                {order.items?.length || 0}
              </div>
              <div className="text-sm text-gray-600">عدد الكتب</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-primary-brown">
                {order.payment_method === 'cash_on_delivery' ? 'الدفع عند الاستلام' : order.payment_method}
              </div>
              <div className="text-sm text-gray-600">طريقة الدفع</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-primary-dark mb-6 flex items-center space-x-2 rtl:space-x-reverse">
              <Package className="w-5 h-5" />
              <span>الكتب المطلوبة</span>
            </h2>

            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 rtl:space-x-reverse p-4 border border-gray-200 rounded-lg">
                  <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-primary-dark mb-1">
                      {item.book?.title_arabic || item.book?.title || 'كتاب'}
                    </h3>
                    
                    {item.book?.author && (
                      <p className="text-sm text-gray-600 mb-2">
                        {item.book.author_arabic || item.book.author}
                      </p>
                    )}
                    
                    {item.book?.bookstore && (
                      <p className="text-xs text-gray-500 mb-2">
                        {item.book.bookstore.name_arabic || item.book.bookstore.name}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        الكمية: {item.quantity}
                      </span>
                      <span className="font-medium text-primary-brown">
                        {formatPrice(item.total)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total Breakdown */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">المجموع الفرعي:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">الشحن:</span>
                <span>
                  {order.shipping_cost === 0 ? (
                    <span className="text-green-600">مجاني</span>
                  ) : (
                    formatPrice(order.shipping_cost)
                  )}
                </span>
              </div>
              
              {order.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">الضريبة:</span>
                  <span>{formatPrice(order.tax_amount)}</span>
                </div>
              )}
              
              <hr />
              
              <div className="flex justify-between text-lg font-bold">
                <span>المجموع الكلي:</span>
                <span className="text-primary-brown">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="space-y-8">
            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-primary-dark mb-6 flex items-center space-x-2 rtl:space-x-reverse">
                <MapPin className="w-5 h-5" />
                <span>معلومات التسليم</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-600">العنوان:</span>
                  <p className="font-medium mt-1">{order.delivery_address}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">رقم الهاتف:</span>
                  <p className="font-medium mt-1 english-text" dir="ltr">{order.delivery_phone}</p>
                </div>
                
                {order.delivery_notes && (
                  <div>
                    <span className="text-sm text-gray-600">ملاحظات:</span>
                    <p className="font-medium mt-1">{order.delivery_notes}</p>
                  </div>
                )}
                
                {order.tracking_number && (
                  <div>
                    <span className="text-sm text-gray-600">رقم التتبع:</span>
                    <p className="font-medium mt-1 english-text" dir="ltr">{order.tracking_number}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-primary-dark mb-6 flex items-center space-x-2 rtl:space-x-reverse">
                <CreditCard className="w-5 h-5" />
                <span>معلومات الدفع</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-600">طريقة الدفع:</span>
                  <p className="font-medium mt-1">
                    {order.payment_method === 'cash_on_delivery' ? 'الدفع عند الاستلام' : order.payment_method}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">حالة الدفع:</span>
                  <span className={`badge ${paymentBadge.className} mt-1`}>
                    {paymentBadge.text}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-primary-dark mb-6 flex items-center space-x-2 rtl:space-x-reverse">
                <Truck className="w-5 h-5" />
                <span>تتبع الطلب</span>
              </h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-3 h-3 bg-primary-brown rounded-full"></div>
                  <div>
                    <p className="font-medium">تم إنشاء الطلب</p>
                    <p className="text-sm text-gray-600">{formatDateTime(order.created_at)}</p>
                  </div>
                </div>
                
                {order.status !== 'pending' && (
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-3 h-3 bg-primary-brown rounded-full"></div>
                    <div>
                      <p className="font-medium">تم تأكيد الطلب</p>
                      <p className="text-sm text-gray-600">في انتظار التحديث</p>
                    </div>
                  </div>
                )}
                
                {order.actual_delivery && (
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">تم التسليم</p>
                      <p className="text-sm text-gray-600">{formatDateTime(order.actual_delivery)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {order.status === 'pending' && (
          <div className="mt-8 text-center">
            <button className="btn-outline text-red-600 border-red-600 hover:bg-red-50">
              إلغاء الطلب
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetailPage
