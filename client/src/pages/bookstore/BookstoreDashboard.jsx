import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Store, BookOpen, Plus, BarChart3, Users, DollarSign } from 'lucide-react'
import { bookstoresAPI } from '../../utils/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const BookstoreDashboard = () => {
  const [bookstore, setBookstore] = useState(null)
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeBooks: 0,
    totalOrders: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await bookstoresAPI.getMyBookstore()
        setBookstore(response.data.bookstore)
        
        // Mock stats for now
        setStats({
          totalBooks: response.data.bookstore.statistics?.total_books || 0,
          activeBooks: response.data.bookstore.statistics?.total_books || 0,
          totalOrders: 0,
          totalRevenue: 0
        })
      } catch (error) {
        console.error('Error fetching bookstore data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="جاري تحميل لوحة التحكم..." />
      </div>
    )
  }

  if (!bookstore) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-600 mb-2">مكتبة غير موجودة</h1>
          <p className="text-gray-500 mb-6">يبدو أنك لم تسجل مكتبتك بعد</p>
          <Link to="/bookstore/register" className="btn-primary">
            سجل مكتبتك الآن
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
            <div className="w-16 h-16 bg-primary-brown rounded-lg flex items-center justify-center">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-dark">
                {bookstore.name_arabic || bookstore.name}
              </h1>
              <p className="text-gray-600">
                {bookstore.is_approved ? 'مكتبة معتمدة' : 'في انتظار الموافقة'}
              </p>
            </div>
          </div>

          {!bookstore.is_approved && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                مكتبتك في انتظار موافقة الإدارة. سيتم إشعارك عند الموافقة عليها.
              </p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الكتب</p>
                <p className="text-2xl font-bold text-primary-brown">{stats.totalBooks}</p>
              </div>
              <BookOpen className="w-8 h-8 text-primary-brown" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الكتب النشطة</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeBooks}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalRevenue} د.ع</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/bookstore/books/add"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-primary-brown rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary-dark">إضافة كتاب جديد</h3>
                <p className="text-sm text-gray-600">أضف كتاباً جديداً إلى مكتبتك</p>
              </div>
            </div>
          </Link>

          <Link
            to="/bookstore/books"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary-dark">إدارة الكتب</h3>
                <p className="text-sm text-gray-600">عرض وتعديل كتبك</p>
              </div>
            </div>
          </Link>

          <Link
            to="/profile"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary-dark">إعدادات المكتبة</h3>
                <p className="text-sm text-gray-600">تحديث معلومات مكتبتك</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-primary-dark mb-6">النشاط الأخير</h2>
          
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">لا يوجد نشاط حالياً</h3>
            <p className="text-gray-500">ستظهر هنا آخر الأنشطة في مكتبتك</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookstoreDashboard
