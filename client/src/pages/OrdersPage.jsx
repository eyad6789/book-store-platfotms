import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Eye, X } from 'lucide-react'
import { ordersAPI } from '../utils/api'
import { formatPrice, formatDate, getOrderStatusBadge } from '../utils/helpers'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const params = {}
        if (filter !== 'all') {
          params.status = filter
        }
        
        const response = await ordersAPI.getOrders(params)
        setOrders(response.data.orders || [])
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [filter])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="جاري تحميل الطلبات..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-dark mb-2">
            طلباتي
          </h1>
          <p className="text-gray-600">
            تتبع جميع طلباتك وحالتها
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'جميع الطلبات' },
              { value: 'pending', label: 'في الانتظار' },
              { value: 'confirmed', label: 'مؤكدة' },
              { value: 'shipped', label: 'تم الشحن' },
              { value: 'delivered', label: 'تم التسليم' },
              { value: 'cancelled', label: 'ملغية' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-primary-brown text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusBadge = getOrderStatusBadge(order.status)
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="mb-4 sm:mb-0">
                        <div className="flex items-center space-x-4 rtl:space-x-reverse mb-2">
                          <h3 className="text-lg font-semibold text-primary-dark">
                            طلب رقم: {order.order_number}
                          </h3>
                          <span className={`badge ${statusBadge.className}`}>
                            {statusBadge.text}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          تاريخ الطلب: {formatDate(order.created_at)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className="text-lg font-bold text-primary-brown">
                          {formatPrice(order.total_amount)}
                        </span>
                        <Link
                          to={`/orders/${order.id}`}
                          className="btn-ghost flex items-center space-x-2 rtl:space-x-reverse"
                        >
                          <Eye className="w-4 h-4" />
                          <span>عرض</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.items?.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 rtl:space-x-reverse">
                          <div className="w-12 h-16 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-primary-dark truncate">
                              {item.book?.title_arabic || item.book?.title || 'كتاب'}
                            </p>
                            <p className="text-xs text-gray-600">
                              الكمية: {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {order.items?.length > 3 && (
                        <div className="flex items-center justify-center text-sm text-gray-500">
                          +{order.items.length - 3} كتب أخرى
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              لا توجد طلبات
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' ? 'لم تقم بأي طلبات بعد' : `لا توجد طلبات ${filter === 'pending' ? 'في الانتظار' : filter === 'confirmed' ? 'مؤكدة' : filter === 'shipped' ? 'مشحونة' : filter === 'delivered' ? 'مسلمة' : 'ملغية'}`}
            </p>
            <Link to="/books" className="btn-primary">
              تصفح الكتب
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage
