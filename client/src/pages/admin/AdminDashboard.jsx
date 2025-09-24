import { useState, useEffect } from 'react'
import { Users, Store, BookOpen, Package, CheckCircle, Clock } from 'lucide-react'
import { bookstoresAPI } from '../../utils/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookstores: 0,
    pendingBookstores: 0,
    totalBooks: 0,
    totalOrders: 0
  })
  const [pendingBookstores, setPendingBookstores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch pending bookstores
        const pendingResponse = await bookstoresAPI.getPendingBookstores()
        setPendingBookstores(pendingResponse.data.bookstores || [])
        
        // Mock stats for now
        setStats({
          totalUsers: 150,
          totalBookstores: 12,
          pendingBookstores: pendingResponse.data.bookstores?.length || 0,
          totalBooks: 450,
          totalOrders: 89
        })
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleApproveBookstore = async (bookstoreId) => {
    try {
      await bookstoresAPI.approveBookstore(bookstoreId)
      toast.success('تم قبول المكتبة بنجاح')
      
      // Remove from pending list
      setPendingBookstores(prev => prev.filter(b => b.id !== bookstoreId))
      setStats(prev => ({
        ...prev,
        pendingBookstores: prev.pendingBookstores - 1,
        totalBookstores: prev.totalBookstores + 1
      }))
    } catch (error) {
      console.error('Error approving bookstore:', error)
      toast.error('حدث خطأ أثناء قبول المكتبة')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="جاري تحميل لوحة الإدارة..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-dark mb-2">
            لوحة الإدارة
          </h1>
          <p className="text-gray-600">
            إدارة منصة المتنبي
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المكتبات المعتمدة</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalBookstores}</p>
              </div>
              <Store className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">في انتظار الموافقة</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookstores}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الكتب</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalBooks}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalOrders}</p>
              </div>
              <Package className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Pending Bookstores */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-primary-dark mb-6 flex items-center space-x-2 rtl:space-x-reverse">
            <Clock className="w-5 h-5" />
            <span>المكتبات في انتظار الموافقة</span>
          </h2>

          {pendingBookstores.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المكتبة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      صاحب المكتبة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ التسجيل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingBookstores.map((bookstore) => (
                    <tr key={bookstore.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-primary-dark">
                            {bookstore.name_arabic || bookstore.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {bookstore.description_arabic || bookstore.description || 'لا يوجد وصف'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {bookstore.owner?.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {bookstore.owner?.email}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(bookstore.created_at).toLocaleDateString('ar-IQ')}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <button
                            onClick={() => handleApproveBookstore(bookstore.id)}
                            className="inline-flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>قبول</span>
                          </button>
                          
                          <button className="inline-flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium hover:bg-red-200 transition-colors">
                            <span>رفض</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                لا توجد مكتبات في انتظار الموافقة
              </h3>
              <p className="text-gray-500">
                جميع طلبات المكتبات تم معالجتها
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
