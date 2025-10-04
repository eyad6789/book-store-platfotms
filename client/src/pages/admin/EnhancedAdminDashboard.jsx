import { useState, useEffect } from 'react';
import {
  Users, BookOpen, Store, TrendingUp, Activity,
  Award, Eye, ShoppingBag, DollarSign, Calendar,
  BarChart3, PieChart, Download, Filter, RefreshCw,
  Check, X, Clock, MapPin, Phone, Mail
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function EnhancedAdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/dashboard?days=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const result = await response.json();
      setDashboardData(result.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const refreshData = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };
  
  const exportReport = async (type) => {
    try {
      const response = await fetch(`/api/admin/reports/export?type=${type}&days=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to export report');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" text="جاري تحميل لوحة التحكم..." />
      </div>
    );
  }
  
  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">حدث خطأ في تحميل البيانات</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم الإدارة</h1>
            <p className="text-gray-600 mt-1">نظرة شاملة على أداء المنصة</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              تحديث
            </button>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">آخر 7 أيام</option>
              <option value="30">آخر 30 يوم</option>
              <option value="90">آخر 3 أشهر</option>
              <option value="365">آخر سنة</option>
            </select>
            <button
              onClick={() => exportReport('comprehensive')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              تصدير التقرير
            </button>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b overflow-x-auto">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
            { id: 'users', label: 'المستخدمين', icon: Users },
            { id: 'libraries', label: 'المكتبات', icon: Store },
            { id: 'books', label: 'الكتب', icon: BookOpen },
            { id: 'engagement', label: 'التفاعل', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab data={dashboardData} exportReport={exportReport} />
      )}
      {activeTab === 'users' && (
        <UsersTab data={dashboardData.users} />
      )}
      {activeTab === 'libraries' && (
        <LibrariesTab data={dashboardData.libraries} />
      )}
      {activeTab === 'books' && (
        <BooksTab data={dashboardData.books} />
      )}
      {activeTab === 'engagement' && (
        <EngagementTab data={dashboardData.engagement} />
      )}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ data, exportReport }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminMetricCard
          icon={<DollarSign className="h-8 w-8" />}
          title="إجمالي الإيرادات"
          value={`${data.totalRevenue.toLocaleString()} د.ع`}
          change={data.revenueGrowth}
          color="green"
        />
        <AdminMetricCard
          icon={<ShoppingBag className="h-8 w-8" />}
          title="إجمالي الطلبات"
          value={data.totalOrders.toLocaleString()}
          change={data.ordersGrowth}
          color="blue"
        />
        <AdminMetricCard
          icon={<Users className="h-8 w-8" />}
          title="المستخدمين النشطين"
          value={data.activeUsers.toLocaleString()}
          change={data.usersGrowth}
          color="purple"
        />
        <AdminMetricCard
          icon={<Store className="h-8 w-8" />}
          title="المكتبات النشطة"
          value={data.activeLibraries}
          change={data.librariesGrowth}
          color="orange"
        />
      </div>
      
      {/* Platform Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">معدل التحويل</h3>
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.conversionRate}%</p>
          <div className="mt-2 h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full"
              style={{ width: `${Math.min(data.conversionRate, 100)}%` }}
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">متوسط قيمة الطلب</h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {data.avgOrderValue.toLocaleString()} د.ع
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {data.avgOrderValueGrowth >= 0 ? '+' : ''}{data.avgOrderValueGrowth}% من الفترة السابقة
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">رضا العملاء</h3>
            <Award className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-gray-900">{data.avgRating}</p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <svg
                  key={star}
                  className={`h-6 w-6 ${
                    star <= Math.round(data.avgRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            بناءً على {data.totalReviews.toLocaleString()} تقييم
          </p>
        </div>
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">الإيرادات الشهرية</h3>
            <button
              onClick={() => exportReport('revenue')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              تصدير
            </button>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>مخطط الإيرادات الشهرية</p>
              <p className="text-sm">سيتم تطبيق المخططات قريباً</p>
            </div>
          </div>
        </div>
        
        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">توزيع الكتب حسب التصنيف</h3>
            <button
              onClick={() => exportReport('books')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              تصدير
            </button>
          </div>
          <div className="space-y-3">
            {data.categoryDistribution.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{category.category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ 
                        width: `${(category.bookCount / Math.max(...data.categoryDistribution.map(c => c.bookCount))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-left">{category.bookCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Top Performing Libraries */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">أفضل المكتبات أداءً</h3>
            <button
              onClick={() => exportReport('libraries')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              تصدير التقرير
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {data.topLibraries.map((library, index) => (
              <div key={library.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{library.name}</h4>
                  <p className="text-sm text-gray-600">المالك: {library.owner}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">الكتب</p>
                  <p className="font-bold text-gray-900">{library.totalBooks}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">المبيعات</p>
                  <p className="font-bold text-green-600">{library.totalSales}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">المشاهدات</p>
                  <p className="font-bold text-blue-600">{library.totalViews.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">النشاطات الأخيرة</h3>
        </div>
        <div className="divide-y max-h-96 overflow-y-auto">
          {data.recentActivities.map((activity, index) => (
            <div key={index} className="p-4 hover:bg-gray-50">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${
                  activity.type === 'purchase' ? 'bg-green-100' :
                  activity.type === 'add_book' ? 'bg-blue-100' :
                  activity.type === 'register' ? 'bg-purple-100' :
                  'bg-gray-100'
                }`}>
                  {activity.type === 'purchase' && <ShoppingBag className="h-5 w-5 text-green-600" />}
                  {activity.type === 'add_book' && <BookOpen className="h-5 w-5 text-blue-600" />}
                  {activity.type === 'register' && <Users className="h-5 w-5 text-purple-600" />}
                  {!['purchase', 'add_book', 'register'].includes(activity.type) && 
                    <Activity className="h-5 w-5 text-gray-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">{activity.user}</p>
                    <span className="text-xs text-gray-400">•</span>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Users Tab Component
function UsersTab({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">إجمالي المستخدمين</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{data.total.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">العملاء</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{data.customers.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">أصحاب المكتبات</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{data.bookstoreOwners.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">المسؤولين</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{data.admins.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">المستخدمين الجدد هذا الشهر</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-2xl font-bold text-gray-900">{data.newThisMonth}</p>
            <p className="text-gray-600">مستخدم جديد</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Libraries Tab Component
function LibrariesTab({ data }) {
  const [pendingBookstores, setPendingBookstores] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchPendingBookstores();
  }, []);
  
  const fetchPendingBookstores = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/bookstores/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setPendingBookstores(result.bookstores || []);
      }
    } catch (error) {
      console.error('Error fetching pending bookstores:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApproval = async (bookstoreId, action) => {
    try {
      const response = await fetch(`/api/admin/bookstores/${bookstoreId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Refresh the list
        fetchPendingBookstores();
        // Show success message
        alert(`تم ${action === 'approve' ? 'قبول' : 'رفض'} المكتبة بنجاح`);
      } else {
        alert('حدث خطأ أثناء معالجة الطلب');
      }
    } catch (error) {
      console.error('Error processing bookstore:', error);
      alert('حدث خطأ أثناء معالجة الطلب');
    }
  };
  
  return (
    <div className="space-y-6" dir="rtl">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">إجمالي المكتبات</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{data?.total || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">المعتمدة</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{data?.approved || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">في الانتظار</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{data?.pending || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">المرفوضة</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{data?.rejected || 0}</p>
        </div>
      </div>
      
      {/* Pending Bookstores Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              المكتبات في انتظار الموافقة
            </h3>
            <button
              onClick={fetchPendingBookstores}
              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className="w-4 h-4" />
              تحديث
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="medium" text="جاري تحميل المكتبات..." />
            </div>
          ) : pendingBookstores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>لا توجد مكتبات في انتظار الموافقة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBookstores.map((bookstore) => (
                <div key={bookstore.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Store className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {bookstore.name_arabic || bookstore.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            مالك المكتبة: {bookstore.owner?.full_name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{bookstore.address_arabic || bookstore.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{bookstore.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{bookstore.email}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">الوصف:</p>
                          <p className="text-sm text-gray-800">
                            {bookstore.description_arabic || bookstore.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApproval(bookstore.id, 'approve')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        قبول
                      </button>
                      <button
                        onClick={() => handleApproval(bookstore.id, 'reject')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        رفض
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Books Tab Component
function BooksTab({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">إجمالي الكتب</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{data.total.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">المعتمدة</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{data.approved.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">في الانتظار</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{data.pending.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">المشاركة</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{data.shared.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

// Engagement Tab Component
function EngagementTab({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">إجمالي المشاهدات</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalViews.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">إجمالي المشاركات</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{data.totalShares.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">متوسط مدة الجلسة</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{data.avgSessionDuration}د</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">معدل الارتداد</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{data.bounceRate}%</p>
        </div>
      </div>
    </div>
  );
}

// Admin Metric Card Component
function AdminMetricCard({ icon, title, value, change, color = 'blue' }) {
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

export default EnhancedAdminDashboard;
