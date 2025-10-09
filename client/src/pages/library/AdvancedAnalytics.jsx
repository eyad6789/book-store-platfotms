import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  Eye,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Target,
  Award,
  Clock,
  Star
} from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const AdvancedAnalytics = () => {
  const { bookstoreId } = useParams()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // days
  const [activeTab, setActiveTab] = useState('overview')
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalBooks: 0,
      totalViews: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      growthRate: 0,
      conversionRate: 0
    },
    performance: {
      topBooks: [],
      revenueByMonth: [],
      viewsByCategory: [],
      customerActivity: []
    },
    trends: {
      dailyViews: [],
      monthlyRevenue: [],
      categoryTrends: [],
      customerGrowth: []
    }
  })

  // Fetch real analytics data from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      
      try {
        console.log('🔍 Fetching analytics for bookstore:', bookstoreId)
        
        const response = await fetch(`/api/analytics/library/${bookstoreId}?days=${dateRange}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('📊 Analytics data received:', result)

        if (result.success) {
          // Map API response to component state structure
          setAnalyticsData({
            overview: {
              totalBooks: result.data.overview.totalBooks,
              totalViews: result.data.overview.totalOrders, // Using orders as views for now
              totalRevenue: result.data.overview.totalRevenue,
              totalCustomers: result.data.overview.totalCustomers,
              growthRate: result.data.overview.growthRate,
              conversionRate: parseFloat(result.data.overview.conversionRate),
              averageRating: parseFloat(result.data.overview.averageRating)
            },
            performance: {
              topBooks: result.data.performance.topBooks.map(book => ({
                id: book.id,
                title: book.title,
                author: book.author,
                views: book.uniqueCustomers, // Using unique customers as views
                revenue: book.revenue,
                sales: book.sales
              })),
              revenueByMonth: result.data.performance.monthlyRevenue.map(item => ({
                month: item.monthName || item.month,
                revenue: item.revenue
              })),
              viewsByCategory: result.data.performance.categoryPerformance.map((cat, index) => {
                const totalRevenue = result.data.performance.categoryPerformance.reduce((sum, c) => sum + c.revenue, 0)
                const percentage = totalRevenue > 0 ? Math.round((cat.revenue / totalRevenue) * 100) : 0
                return {
                  category: cat.category,
                  views: cat.sales,
                  percentage: percentage
                }
              })
            },
            trends: {
              dailyViews: [], // Can be implemented later
              monthlyRevenue: result.data.performance.monthlyRevenue
            },
            books: result.data.books,
            customers: result.data.customers
          })
        } else {
          console.error('❌ Analytics API error:', result.error)
          // Keep default empty state on error
        }
      } catch (error) {
        console.error('❌ Error fetching analytics:', error)
        // Keep default empty state on error
      } finally {
        setLoading(false)
      }
    }

    if (bookstoreId) {
      fetchAnalytics()
    }
  }, [bookstoreId, dateRange])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ar-IQ').format(num)
  }

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="جاري تحميل التحليلات..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-dark mb-2">
                التحليلات المتقدمة
              </h1>
              <p className="text-gray-600">
                تقارير مفصلة عن أداء مكتبتك ومبيعاتك
              </p>
            </div>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse mt-4 sm:mt-0">
              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown"
              >
                <option value="7">آخر 7 أيام</option>
                <option value="30">آخر 30 يوم</option>
                <option value="90">آخر 3 أشهر</option>
                <option value="365">آخر سنة</option>
              </select>
              
              {/* Export Button */}
              <button className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-primary-brown text-white rounded-lg hover:bg-primary-dark transition-colors">
                <Download className="w-4 h-4" />
                <span>تصدير التقرير</span>
              </button>
              
              {/* Refresh Button */}
              <button 
                onClick={() => window.location.reload()}
                className="p-2 text-gray-600 hover:text-primary-brown transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8 rtl:space-x-reverse">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
              { id: 'performance', label: 'الأداء', icon: TrendingUp },
              { id: 'books', label: 'الكتب', icon: BookOpen },
              { id: 'customers', label: 'العملاء', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 rtl:space-x-reverse py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-brown text-primary-brown'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="إجمالي الكتب"
                value={formatNumber(analyticsData.overview.totalBooks)}
                change={12.5}
                icon={BookOpen}
                color="blue"
              />
              <StatCard
                title="إجمالي المشاهدات"
                value={formatNumber(analyticsData.overview.totalViews)}
                change={analyticsData.overview.growthRate}
                icon={Eye}
                color="green"
              />
              <StatCard
                title="إجمالي الإيرادات"
                value={formatCurrency(analyticsData.overview.totalRevenue)}
                change={8.3}
                icon={DollarSign}
                color="purple"
              />
              <StatCard
                title="إجمالي العملاء"
                value={formatNumber(analyticsData.overview.totalCustomers)}
                change={15.2}
                icon={Users}
                color="orange"
              />
            </div>

            {/* Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">معدل النمو</h3>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  +{analyticsData.overview.growthRate}%
                </div>
                <p className="text-sm text-gray-600">مقارنة بالشهر الماضي</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">معدل التحويل</h3>
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {analyticsData.overview.conversionRate}%
                </div>
                <p className="text-sm text-gray-600">من المشاهدات إلى المبيعات</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">متوسط التقييم</h3>
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {analyticsData.overview.averageRating || '0.0'}
                </div>
                <p className="text-sm text-gray-600">من أصل 5 نجوم</p>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-8">
            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">الإيرادات الشهرية</h3>
              <div className="h-64 flex items-end justify-between space-x-2 rtl:space-x-reverse">
                {analyticsData.performance.revenueByMonth.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="bg-primary-brown rounded-t w-full transition-all duration-300 hover:bg-primary-dark"
                      style={{
                        height: `${(item.revenue / 650000) * 100}%`,
                        minHeight: '20px'
                      }}
                      title={formatCurrency(item.revenue)}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Performance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">الأداء حسب الفئة</h3>
              <div className="space-y-4">
                {analyticsData.performance.viewsByCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <span className="font-medium text-gray-900">{category.category}</span>
                      <span className="text-sm text-gray-600">
                        {formatNumber(category.views)} مشاهدة
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-brown h-2 rounded-full transition-all duration-300"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12">
                        {category.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Books Tab */}
        {activeTab === 'books' && (
          <div className="space-y-8">
            {/* Top Performing Books */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">أفضل الكتب أداءً</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الكتاب
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المشاهدات
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المبيعات
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإيرادات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analyticsData.performance.topBooks.map((book, index) => (
                      <tr key={book.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary-brown rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            </div>
                            <div className="mr-4">
                              <div className="text-sm font-medium text-gray-900">{book.title}</div>
                              <div className="text-sm text-gray-500">{book.author}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(book.views)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(book.sales)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(book.revenue)}
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
          <div className="space-y-8">
            {/* Customer Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">عملاء جدد</h3>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">+47</div>
                <p className="text-sm text-gray-600">هذا الشهر</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">عملاء نشطون</h3>
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">234</div>
                <p className="text-sm text-gray-600">آخر 30 يوم</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">متوسط الزيارة</h3>
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">4.2</div>
                <p className="text-sm text-gray-600">دقيقة</p>
              </div>
            </div>

            {/* Customer Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">نشاط العملاء</h3>
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">تفاصيل نشاط العملاء</h3>
                <p className="text-gray-500">ستظهر هنا تفاصيل أكثر عن نشاط وسلوك العملاء</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdvancedAnalytics
