import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Eye, BookOpen, AlertCircle, CheckCircle, Clock, X } from 'lucide-react'
import { bookstoresAPI } from '../../utils/api'
import { formatPrice, getImageUrl, getBookStatusBadge } from '../../utils/helpers'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import SafeImage from '../../components/ui/SafeImage'
import toast from 'react-hot-toast'

const ManageBooksPage = () => {
  const { bookstoreId } = useParams() // Get bookstoreId from URL if present
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingBook, setEditingBook] = useState(null)
  const [deletingBook, setDeletingBook] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)
  
  // Determine if this is a library context (has bookstoreId in URL)
  const isLibraryContext = !!bookstoreId

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true)
        console.log('🔍 Fetching books for bookstore owner...')
        
        const params = {}
        if (searchQuery.trim()) {
          params.search = searchQuery.trim()
        }
        if (filter !== 'all') {
          params.is_active = filter === 'active'
        }
        
        let response
        if (isLibraryContext) {
          // For library context, fetch library books
          console.log('📚 Fetching library books for bookstore:', bookstoreId)
          response = await fetch(`/api/library/${bookstoreId}/books`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
          const result = await response.json()
          console.log('📚 Library books fetched:', result.books?.map(b => ({ id: b.id, title: b.title_arabic, availability_status: b.availability_status })))
          setBooks(result.books || [])
        } else {
          // For regular bookstore context, fetch bookstore books
          response = await bookstoresAPI.getMyBooks(params)
          console.log('📚 Books response:', response)
          setBooks(response.data.books || [])
        }
      } catch (error) {
        console.error('❌ Error fetching books:', error)
        
        // Show user-friendly error message
        if (error.response?.status === 403) {
          toast.error('ليس لديك صلاحية للوصول إلى هذه الصفحة')
        } else if (error.response?.status === 404) {
          toast.error('لم يتم العثور على مكتبة مسجلة لحسابك')
        } else if (error.response?.status === 401) {
          toast.error('يجب تسجيل الدخول أولاً')
        } else {
          toast.error('حدث خطأ في تحميل الكتب')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [searchQuery, filter])

  // Update book availability status
  const updateAvailabilityStatus = async (bookId, newStatus) => {
    try {
      setStatusLoading(true)
      
      const endpoint = isLibraryContext 
        ? `/api/library/books/${bookId}/availability`
        : `/api/bookstore/books/${bookId}/status`
      
      const body = isLibraryContext
        ? { availability_status: newStatus }
        : { is_active: newStatus === 'active', availability_status: newStatus }
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const result = await response.json()
      
      if (response.ok) {
        // Update the book with the actual response data
        const updatedBook = result.book || { availability_status: newStatus };
        console.log('🔄 Updating book state:', { bookId, updatedBook });
        
        setBooks(prevBooks => prevBooks.map(book => 
          book.id === bookId 
            ? { ...book, ...updatedBook }
            : book
        ))
        
        const statusText = {
          'available': 'متاح',
          'unavailable': 'غير متوفر',
          'coming_soon': 'قريباً'
        }
        
        toast.success(`تم تحديث حالة الكتاب إلى: ${statusText[newStatus]}`)
        setEditingBook(null)
      } else {
        toast.error(result.error || 'فشل في تحديث حالة الكتاب')
      }
    } catch (error) {
      console.error('Error updating book status:', error)
      toast.error('حدث خطأ في تحديث حالة الكتاب')
    } finally {
      setStatusLoading(false)
    }
  }

  // Delete book
  const deleteBook = async (bookId) => {
    try {
      const endpoint = isLibraryContext 
        ? `/api/library/books/${bookId}`
        : `/api/bookstore/books/${bookId}`
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const result = await response.json()
      
      if (response.ok) {
        setBooks(books.filter(book => book.id !== bookId))
        toast.success('تم حذف الكتاب بنجاح')
        setDeletingBook(null)
      } else {
        toast.error(result.error || 'فشل في حذف الكتاب')
      }
    } catch (error) {
      console.error('Error deleting book:', error)
      toast.error('حدث خطأ في حذف الكتاب')
    }
  }

  // Get availability status badge
  const getAvailabilityBadge = (book) => {
    if (!book.is_active) {
      return { text: 'غير متوفر', color: 'bg-red-100 text-red-800' }
    }
    if (book.availability_status === 'coming_soon') {
      return { text: 'قريباً', color: 'bg-blue-100 text-blue-800' }
    }
    return { text: 'متاح', color: 'bg-green-100 text-green-800' }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="جاري تحميل الكتب..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-dark mb-2">
              إدارة الكتب
            </h1>
            <p className="text-gray-600">
              عرض وتعديل كتب مكتبتك
            </p>
          </div>
          
          <Link
            to={isLibraryContext ? `/library/${bookstoreId}/books/add` : "/bookstore/books/add"}
            className="btn-primary flex items-center space-x-2 rtl:space-x-reverse mt-4 sm:mt-0"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة كتاب جديد</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث في كتبك..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>

            {/* Filter */}
            <div className="md:w-48">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown"
              >
                <option value="all">جميع الكتب</option>
                <option value="active">الكتب النشطة</option>
                <option value="inactive">الكتب غير النشطة</option>
              </select>
            </div>
          </div>
        </div>

        {/* Books List */}
        {books.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الكتاب
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      السعر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      حالة التوفر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {books.map((book) => {
                    const statusBadge = getBookStatusBadge(book)
                    
                    return (
                      <tr key={book.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-4 rtl:space-x-reverse">
                            <SafeImage
                              src={getImageUrl(book.image_url)}
                              alt={book.title_arabic || book.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-primary-dark truncate">
                                {book.title_arabic || book.title}
                              </p>
                              <p className="text-sm text-gray-600 truncate">
                                {book.author_arabic || book.author}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-primary-brown">
                            {formatPrice(book.price)}
                          </div>
                          {book.original_price && book.original_price > book.price && (
                            <div className="text-xs text-gray-500 line-through">
                              {formatPrice(book.original_price)}
                            </div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}>
                              {statusBadge.text}
                            </span>
                            <button
                              onClick={() => setEditingBook(book)}
                              className="text-blue-600 hover:text-blue-800 text-xs underline"
                            >
                              تغيير
                            </button>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Link
                              to={isLibraryContext ? `/books/library-${book.id}` : `/books/${book.id}`}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="عرض"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            
                            <Link
                              to={`/bookstore/books/${book.id}/edit`}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            
                            <button
                              onClick={() => setDeletingBook(book)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              لا توجد كتب
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'لم يتم العثور على كتب تطابق البحث' : 'لم تضف أي كتب بعد'}
            </p>
            <Link 
              to={isLibraryContext ? `/library/${bookstoreId}/books/add` : "/bookstore/books/add"} 
              className="btn-primary"
            >
              إضافة كتاب جديد
            </Link>
          </div>
        )}

        {/* Edit Availability Status Modal */}
        {editingBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">تحديث حالة التوفر</h3>
              <p className="text-gray-600 mb-4">"{editingBook.title_arabic || editingBook.title}"</p>
              
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => updateAvailabilityStatus(editingBook.id, 'available')}
                  disabled={statusLoading}
                  className={`w-full p-3 rounded-lg border-2 transition-colors ${
                    editingBook.is_active && editingBook.availability_status !== 'coming_soon'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300'
                  } ${statusLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    <div className="text-right">
                      <div className="font-medium">متاح</div>
                      <div className="text-sm text-gray-600">الكتاب متوفر للشراء</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => updateAvailabilityStatus(editingBook.id, 'unavailable')}
                  disabled={statusLoading}
                  className={`w-full p-3 rounded-lg border-2 transition-colors ${
                    !editingBook.is_active
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-red-300'
                  } ${statusLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center">
                    <X className="w-5 h-5 mr-3 text-red-500" />
                    <div className="text-right">
                      <div className="font-medium">غير متوفر</div>
                      <div className="text-sm text-gray-600">الكتاب غير متاح حالياً</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => updateAvailabilityStatus(editingBook.id, 'coming_soon')}
                  disabled={statusLoading}
                  className={`w-full p-3 rounded-lg border-2 transition-colors ${
                    editingBook.availability_status === 'coming_soon'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                  } ${statusLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-3 text-blue-500" />
                    <div className="text-right">
                      <div className="font-medium">قريباً</div>
                      <div className="text-sm text-gray-600">الكتاب سيكون متاحاً قريباً</div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditingBook(null)}
                  disabled={statusLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold">تأكيد الحذف</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                هل أنت متأكد من حذف الكتاب "{deletingBook.title_arabic || deletingBook.title}"؟
              </p>
              <p className="text-sm text-red-600 mb-6">
                هذا الإجراء لا يمكن التراجع عنه.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingBook(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => deleteBook(deletingBook.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageBooksPage
