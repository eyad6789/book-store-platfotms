import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Users, Package, 
  Star, Eye, ShoppingCart, DollarSign,
  Calendar, BarChart3, PieChart, Activity
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

function BookstoreAnalyticsDashboard({ bookstoreId }) {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, bookstoreId]);
  
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/bookstore/${bookstoreId}?days=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        toast.error(data.error || 'خطأ في تحميل البيانات');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="جاري تحميل التحليلات..." />
      </div>
    );
  }
  
  if (!analytics) {
    return (
      <div className="text-center text-red-600 p-8">
        <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-medium mb-2">خطأ في تحميل البيانات</h3>
        <p className="text-gray-600 mb-4">تعذر تحميل بيانات التحليلات</p>
        <button
          onClick={fetchAnalytics}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }
  
  const { sales, orders, topBooks, customers, reviews } = analytics;
  
  const kpiCards = [
    {
      title: 'إجمالي المبيعات',
      value: `${sales.totalRevenue.toLocaleString()} د.ع`,
      change: sales.revenueGrowth,
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'عدد الطلبات',
      value: sales.totalOrders.toLocaleString(),
      change: orders.ordersGrowth,
      icon: ShoppingCart,
      color: 'blue'
    },
    {
      title: 'متوسط قيمة الطلب',
      value: `${Math.round(sales.avgOrderValue).toLocaleString()} د.ع`,
      change: sales.avgOrderGrowth,
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'عملاء جدد',
      value: customers.newCustomers.toLocaleString(),
      change: customers.customerGrowth,
      icon: Users,
      color: 'orange'
    }
  ];
  
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">لوحة التحليلات</h1>
        
        <div className="flex flex-wrap gap-3">
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
            onClick={fetchAnalytics}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            تحديث البيانات
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-reverse space-x-8">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
            { id: 'sales', label: 'المبيعات', icon: TrendingUp },
            { id: 'books', label: 'الكتب', icon: Package },
            { id: 'customers', label: 'العملاء', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiCards.map((kpi, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                    {kpi.change && (
                      <div className={`flex items-center gap-1 text-sm ${
                        kpi.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {kpi.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(kpi.change)}%
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg bg-${kpi.color}-100`}>
                    <kpi.icon className={`h-6 w-6 text-${kpi.color}-600`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">تطور المبيعات</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sales.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    `${parseInt(value).toLocaleString()} د.ع`,
                    name === 'revenue' ? 'المبيعات' : 'الطلبات'
                  ]} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Books */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4">الكتب الأكثر مبيعاً</h3>
              <div className="space-y-4">
                {topBooks.slice(0, 5).map((book, index) => (
                  <div key={book.id} className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-400">
                      {index + 1}
                    </span>
                    <img 
                      src={book.image_url || '/placeholder-book.jpg'}
                      alt={book.title_arabic || book.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {book.title_arabic || book.title}
                      </p>
                      <p className="text-sm text-gray-600">{book.author}</p>
                      <p className="text-sm font-medium text-blue-600">
                        {book.sold_quantity} نسخة مباعة
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">
                        {Math.round(book.revenue).toLocaleString()} د.ع
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4">النشاط الأخير</h3>
              <div className="space-y-4">
                {analytics.recentOrders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium">طلب #{order.id}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('ar-IQ')}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">
                        {order.total_amount.toLocaleString()} د.ع
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'completed' ? 'مكتمل' :
                         order.status === 'pending' ? 'قيد الانتظار' :
                         order.status === 'shipped' ? 'مرسل' : order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Sales Tab */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">تفاصيل المبيعات</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sales.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      
      {/* Books Tab */}
      {activeTab === 'books' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">أداء الكتب</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الكتاب
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المبيعات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإيرادات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التقييم
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topBooks.map((book) => (
                    <tr key={book.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            src={book.image_url || '/placeholder-book.jpg'}
                            alt={book.title_arabic || book.title}
                            className="w-10 h-12 object-cover rounded ml-4"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {book.title_arabic || book.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {book.author}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {book.sold_quantity} نسخة
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Math.round(book.revenue).toLocaleString()} د.ع
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current ml-1" />
                          <span className="text-sm text-gray-900">{book.rating}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4">إحصائيات العملاء</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">عملاء جدد</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {customers.newCustomers}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">عملاء عائدون</span>
                  <span className="text-2xl font-bold text-green-600">
                    {customers.returningCustomers}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4">التقييمات</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">إجمالي التقييمات</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {reviews.total_reviews}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">متوسط التقييم</span>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-2xl font-bold text-yellow-600">
                      {parseFloat(reviews.avg_rating).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookstoreAnalyticsDashboard;
