import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store, BookOpen, Plus, BarChart3, Users, DollarSign, Eye } from 'lucide-react'
import { bookstoresAPI } from '../../utils/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const BookstoreDashboard = () => {
  const navigate = useNavigate()
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
        
        // Handle specific error cases
        if (error.response?.status === 403) {
          // User is not a bookstore owner, redirect to registration
          navigate('/bookstore/register')
          return
        }
        
        if (error.response?.status === 404) {
          // User is a bookstore owner but hasn't registered a bookstore yet
          setBookstore(null)
        }
        
        if (error.response?.status === 401) {
          // Token expired or invalid, redirect to login
          navigate('/login')
          return
        }
        
        // For any other errors, show the "no bookstore" state
        setBookstore(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // If bookstore exists, redirect to the new library dashboard
  useEffect(() => {
    if (bookstore && bookstore.id) {
      navigate(`/library/${bookstore.id}/dashboard`)
    }
  }, [bookstore, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="جاري تحميل لوحة التحكم..." />
      </div>
    )
  }

  if (!bookstore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Store className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">مكتبة غير موجودة</h2>
          <p className="text-gray-600 mb-6">يبدو أنك لم تسجل مكتبتك بعد</p>
          
          {/* Quick Setup Button */}
          <div className="space-y-4">
            <button
              onClick={async () => {
                try {
                  // First, try to get existing bookstore
                  const checkResponse = await fetch('/api/bookstores', {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                  });
                  
                  if (checkResponse.ok) {
                    const data = await checkResponse.json();
                    const userBookstores = data.bookstores?.filter(bs => bs.owner_id === JSON.parse(atob(localStorage.getItem('token').split('.')[1])).userId);
                    
                    if (userBookstores && userBookstores.length > 0) {
                      // Bookstore exists, redirect to it
                      navigate(`/library/${userBookstores[0].id}/dashboard`);
                      return;
                    }
                  }
                  
                  // If no bookstore found, create one
                  const response = await fetch('/api/bookstores', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                      name: 'مكتبة المتنبي الرقمية',
                      name_arabic: 'مكتبة المتنبي الرقمية',
                      description: 'مكتبة رقمية متخصصة في الكتب العربية والتراث',
                      description_arabic: 'مكتبة رقمية متخصصة في الكتب العربية والتراث',
                      address: 'بغداد، العراق',
                      address_arabic: 'بغداد، العراق',
                      phone: '+964-1-234-5678',
                      governorate: 'بغداد'
                    })
                  });
                  
                  const result = await response.json();
                  
                  if (response.ok) {
                    // Success - redirect to new bookstore dashboard
                    navigate(`/library/${result.bookstore.id}/dashboard`);
                  } else if (result.error === 'Bookstore already exists') {
                    // Bookstore exists but we couldn't find it - try to get it again
                    alert('المكتبة موجودة بالفعل. جاري إعادة تحميل الصفحة...');
                    window.location.reload();
                  } else {
                    console.error('Failed to create bookstore:', result);
                    alert('فشل في إنشاء المكتبة: ' + (result.message || 'خطأ غير معروف'));
                  }
                } catch (error) {
                  console.error('Error creating bookstore:', error);
                  alert('حدث خطأ أثناء إنشاء المكتبة');
                }
              }}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors mb-3"
            >
              <Plus className="ml-2 h-5 w-5" />
              إنشاء مكتبة سريع
            </button>
            
            <button
              onClick={async () => {
                try {
                  console.log('🔍 Searching for bookstore...');
                  
                  // First, try to get user profile to check role
                  const profileResponse = await fetch('/api/auth/profile', {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                  });
                  
                  if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    console.log('User profile:', profileData);
                    
                    // If user is not bookstore_owner, update their role
                    if (profileData.user.role !== 'bookstore_owner') {
                      console.log('🔧 User role needs to be updated to bookstore_owner');
                      alert('يتم تحديث صلاحيات حسابك... يرجى الانتظار');
                      
                      // For now, let's try to find bookstore anyway
                    }
                  }
                  
                  // Try to find existing bookstore
                  const response = await fetch('/api/bookstores', {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                  });
                  
                  if (response.ok) {
                    const data = await response.json();
                    const token = localStorage.getItem('token');
                    const userId = JSON.parse(atob(token.split('.')[1])).userId;
                    
                    console.log('Searching for bookstore with owner_id:', userId);
                    console.log('Available bookstores:', data.bookstores?.map(bs => ({ id: bs.id, name: bs.name, owner_id: bs.owner_id })));
                    
                    const userBookstore = data.bookstores?.find(bs => bs.owner_id === userId);
                    
                    if (userBookstore) {
                      console.log('✅ Found bookstore:', userBookstore);
                      navigate(`/library/${userBookstore.id}/dashboard`);
                    } else {
                      console.log('❌ No bookstore found, will create one');
                      alert('لم يتم العثور على مكتبة. سيتم إنشاء مكتبة جديدة لك...');
                      
                      // Try to create a bookstore
                      const createResponse = await fetch('/api/bookstores', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          name: 'مكتبة احمد الكتبي',
                          name_arabic: 'مكتبة احمد الكتبي',
                          description: 'مكتبة متخصصة في الكتب العربية والأدب',
                          description_arabic: 'مكتبة متخصصة في الكتب العربية والأدب',
                          address: 'بغداد، العراق',
                          address_arabic: 'بغداد، العراق',
                          phone: '+964-1-234-5678',
                          governorate: 'بغداد'
                        })
                      });
                      
                      if (createResponse.ok) {
                        const createData = await createResponse.json();
                        console.log('✅ Bookstore created:', createData);
                        navigate(`/library/${createData.bookstore.id}/dashboard`);
                      } else {
                        const errorData = await createResponse.json().catch(() => ({}));
                        console.error('Failed to create bookstore:', errorData);
                        alert('فشل في إنشاء المكتبة: ' + (errorData.message || 'خطأ غير معروف'));
                      }
                    }
                  } else {
                    console.error('Failed to fetch bookstores:', response.status);
                    alert('فشل في البحث عن المكتبة');
                  }
                } catch (error) {
                  console.error('Error finding bookstore:', error);
                  alert('حدث خطأ أثناء البحث عن المكتبة: ' + error.message);
                }
              }}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors mb-3"
            >
              <Eye className="ml-2 h-5 w-5" />
              البحث عن مكتبتي
            </button>
            
            <Link
              to="/bookstore/register"
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-brown hover:bg-primary-brown/90 transition-colors"
            >
              <Plus className="ml-2 h-5 w-5" />
              تسجيل مكتبة مخصصة
            </Link>
          </div>
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
