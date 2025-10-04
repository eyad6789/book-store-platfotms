import { useState, useEffect } from 'react';
import { 
  TrendingUp, Package, Users, Eye, ShoppingCart, 
  Star, Calendar, DollarSign, Activity, Share2,
  Plus, BookOpen, BarChart3
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { runAuthDiagnostics } from '../../utils/authCheck';

function LibraryDashboard({ bookstoreId: propBookstoreId }) {
  const { bookstoreId: paramBookstoreId } = useParams();
  const bookstoreId = propBookstoreId || paramBookstoreId;
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Run authentication diagnostics first
    runAuthDiagnostics().then(isAuthenticated => {
      if (isAuthenticated) {
        fetchDashboardData();
      } else {
        setError('لم يتم العثور على رمز مصادقة صالح. يرجى تسجيل الدخول مرة أخرى.');
        setLoading(false);
      }
    });
  }, [timeRange, bookstoreId]);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching dashboard data for bookstore:', bookstoreId);
      
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.');
      }
      
      console.log('Token found, making request...');
      
      const response = await fetch(
        `/api/library/${bookstoreId}/dashboard?days=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle authentication errors
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        
        throw new Error(errorData.error || errorData.message || 'فشل في تحميل البيانات');
      }
      
      const result = await response.json();
      console.log('Dashboard data loaded successfully:', result);
      setStats(result.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="جاري تحميل لوحة التحكم..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64" dir="rtl">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-2 space-x-reverse">
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              إعادة المحاولة
            </button>
            {error.includes('المصادقة') && (
              <button
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                تسجيل الدخول
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">حدث خطأ في تحميل البيانات</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم المكتبة</h1>
          <p className="text-gray-600 mt-1">{stats.bookstore.name}</p>
          {!stats.bookstore.is_approved && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
              في انتظار الموافقة
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">آخر 7 أيام</option>
            <option value="30">آخر 30 يوم</option>
            <option value="90">آخر 3 أشهر</option>
            <option value="365">السنة الماضية</option>
          </select>
          <Link
            to={`/library/${bookstoreId}/books/add`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            إضافة كتاب
          </Link>
        </div>
      </div>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <MetricCard
          icon={<DollarSign className="h-8 w-8" />}
          title="إجمالي المبيعات"
          value={`${stats.totalRevenue.toLocaleString()} د.ع`}
          change={stats.revenueChange}
          color="green"
        />
        
        {/* Total Orders */}
        <MetricCard
          icon={<ShoppingCart className="h-8 w-8" />}
          title="عدد الطلبات"
          value={stats.totalOrders}
          change={stats.ordersChange}
          color="blue"
        />
        
        {/* Total Views */}
        <MetricCard
          icon={<Eye className="h-8 w-8" />}
          title="مشاهدات الكتب"
          value={stats.totalViews.toLocaleString()}
          change={stats.viewsChange}
          color="purple"
        />
        
        {/* Active Books */}
        <MetricCard
          icon={<Package className="h-8 w-8" />}
          title="الكتب النشطة"
          value={stats.activeBooks}
          subtitle={`${stats.pendingBooks} في الانتظار`}
          color="orange"
        />
      </div>
      
      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">متوسط قيمة الطلب</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.avgOrderValue.toLocaleString()} د.ع
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">معدل التحويل</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.conversionRate}%
              </p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">التقييم العام</p>
              <div className="flex items-center mt-1">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.avgRating}
                </p>
                <Star className="h-5 w-5 text-yellow-400 mr-1 fill-current" />
                <span className="text-sm text-gray-600 mr-2">
                  ({stats.totalReviews} تقييم)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Performing Books */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">الكتب الأكثر مبيعاً</h2>
        </div>
        <div className="p-6">
          {stats.topBooks.length > 0 ? (
            <div className="space-y-4">
              {stats.topBooks.map((book, index) => (
                <div key={book.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <img
                    src={book.cover_image_url || '/placeholder-book.jpg'}
                    alt={book.title_ar}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{book.title_ar}</h3>
                    <p className="text-sm text-gray-600">{book.author_ar}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-600">المبيعات</p>
                    <p className="font-bold text-gray-900">{book.sales_count}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-600">الإيرادات</p>
                    <p className="font-bold text-green-600">
                      {(book.sales_count * book.price).toLocaleString()} د.ع
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد مبيعات بعد</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">الطلبات الأخيرة</h2>
          </div>
          <div className="p-6">
            {stats.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {stats.recentOrders.map(order => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">
                        طلب #{order.id}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('ar-IQ')}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900">
                        {order.total_amount.toLocaleString()} د.ع
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد طلبات بعد</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Shared Books Performance */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              الكتب المشاركة
            </h2>
          </div>
          <div className="p-6">
            {stats.sharedBooks.length > 0 ? (
              <div className="space-y-3">
                {stats.sharedBooks.map(book => (
                  <div key={book.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{book.title_ar}</h4>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                        {book.share_type === 'public' ? 'عامة' : 
                         book.share_type === 'featured' ? 'مميزة' : 'ترويجية'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">مشاهدات</p>
                        <p className="font-semibold">{book.views_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">نقرات</p>
                        <p className="font-semibold">{book.clicks_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">مبيعات</p>
                        <p className="font-semibold text-green-600">{book.conversions_count}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد كتب مشاركة</p>
                <Link
                  to={`/library/${bookstoreId}/books`}
                  className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                >
                  ابدأ بمشاركة كتبك
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to={`/library/${bookstoreId}/books/add`}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">إضافة كتاب جديد</h3>
              <p className="text-sm text-gray-600">أضف كتاباً جديداً إلى مكتبتك</p>
            </div>
          </div>
        </Link>
        
        <Link
          to={`/library/${bookstoreId}/books`}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">إدارة الكتب</h3>
              <p className="text-sm text-gray-600">عرض وتعديل كتبك</p>
            </div>
          </div>
        </Link>
        
        <Link
          to={`/library/${bookstoreId}/analytics`}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">التحليلات المتقدمة</h3>
              <p className="text-sm text-gray-600">تقارير مفصلة عن الأداء</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ icon, title, value, change, subtitle, color = 'blue' }) {
  const colorClasses = {
    green: 'text-green-600 bg-green-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50'
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {change !== undefined && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-4 w-4 ${change < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(change)}% من الفترة السابقة
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function getStatusLabel(status) {
  const labels = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي'
  };
  return labels[status] || status;
}

export default LibraryDashboard;
