import { useState, useEffect } from 'react';
import { 
  Package, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

function OrderManagement({ bookstoreId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const statusOptions = [
    { value: 'all', label: 'جميع الطلبات', color: 'gray' },
    { value: 'pending', label: 'قيد الانتظار', color: 'yellow' },
    { value: 'confirmed', label: 'مؤكد', color: 'blue' },
    { value: 'processing', label: 'قيد التحضير', color: 'orange' },
    { value: 'shipped', label: 'تم الشحن', color: 'purple' },
    { value: 'delivered', label: 'تم التوصيل', color: 'green' },
    { value: 'cancelled', label: 'ملغي', color: 'red' }
  ];

  const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    confirmed: <CheckCircle className="h-4 w-4" />,
    processing: <Package className="h-4 w-4" />,
    shipped: <Truck className="h-4 w-4" />,
    delivered: <CheckCircle className="h-4 w-4" />,
    cancelled: <XCircle className="h-4 w-4" />
  };

  useEffect(() => {
    if (bookstoreId) {
      fetchOrders();
    }
  }, [bookstoreId, selectedStatus, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });
      
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }

      const response = await fetch(
        `/api/orders/bookstore/${bookstoreId}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchOrders(); // Refresh orders list
      } else {
        const error = await response.json();
        alert(error.message || 'فشل في تحديث حالة الطلب');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('حدث خطأ في تحديث حالة الطلب');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-orange-100 text-orange-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: 'confirmed',
      confirmed: 'processing',
      processing: 'shipped',
      shipped: 'delivered'
    };
    return statusFlow[currentStatus];
  };

  const getNextStatusLabel = (currentStatus) => {
    const labels = {
      pending: 'تأكيد الطلب',
      confirmed: 'بدء التحضير',
      processing: 'شحن الطلب',
      shipped: 'تأكيد التوصيل'
    };
    return labels[currentStatus];
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="medium" text="جاري تحميل الطلبات..." />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">إدارة الطلبات</h2>
        
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => {
                setSelectedStatus(option.value);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            لا توجد طلبات
          </h3>
          <p className="text-gray-500">
            {selectedStatus === 'all' 
              ? 'لم يتم تقديم أي طلبات بعد'
              : `لا توجد طلبات بحالة "${statusOptions.find(s => s.value === selectedStatus)?.label}"`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-soft p-6">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    طلب #{order.order_number}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {statusIcons[order.status]}
                      {statusOptions.find(s => s.value === order.status)?.label}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('ar-IQ')}
                    </span>
                  </div>
                </div>
                
                <div className="text-left mt-2 sm:mt-0">
                  <div className="text-2xl font-bold text-green-600">
                    {order.total_amount} د.ع
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.items?.length} كتاب
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    معلومات العميل
                  </h4>
                  <p className="text-sm text-gray-700">
                    <strong>الاسم:</strong> {order.customer?.full_name}
                  </p>
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {order.delivery_phone}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    عنوان التوصيل
                  </h4>
                  <p className="text-sm text-gray-700">
                    {order.delivery_address}
                  </p>
                  {order.delivery_notes && (
                    <p className="text-sm text-gray-600 italic">
                      ملاحظات: {order.delivery_notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">الكتب المطلوبة:</h4>
                <div className="space-y-2">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.book?.title_arabic || item.book?.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.book?.author_arabic || item.book?.author}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">
                          {item.quantity} × {item.price} د.ع
                        </p>
                        <p className="text-sm text-gray-600">
                          المجموع: {item.total} د.ع
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                {getNextStatus(order.status) && (
                  <button
                    onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    {getNextStatusLabel(order.status)}
                  </button>
                )}
                
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
                        updateOrderStatus(order.id, 'cancelled');
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    إلغاء الطلب
                  </button>
                )}
                
                <button
                  onClick={() => window.open(`tel:${order.delivery_phone}`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  اتصال بالعميل
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            السابق
          </button>
          
          <span className="px-3 py-1 text-sm text-gray-600">
            صفحة {pagination.current_page} من {pagination.total_pages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(pagination.total_pages, prev + 1))}
            disabled={currentPage === pagination.total_pages}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}

export default OrderManagement;
