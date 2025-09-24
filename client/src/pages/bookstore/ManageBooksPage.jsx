import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Eye, BookOpen } from 'lucide-react'
import { bookstoresAPI } from '../../utils/api'
import { formatPrice, getImageUrl, getBookStatusBadge } from '../../utils/helpers'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const ManageBooksPage = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true)
        const params = {}
        if (searchQuery.trim()) {
          params.search = searchQuery.trim()
        }
        if (filter !== 'all') {
          params.is_active = filter === 'active'
        }
        
        const response = await bookstoresAPI.getMyBooks(params)
        setBooks(response.data.books || [])
      } catch (error) {
        console.error('Error fetching books:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [searchQuery, filter])

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
            to="/bookstore/books/add"
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
                      المخزون
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
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
                            <img
                              src={getImageUrl(book.image_url)}
                              alt={book.title_arabic || book.title}
                              className="w-12 h-16 object-cover rounded"
                              onError={(e) => {
                                e.target.src = '/placeholder-book.jpg'
                              }}
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
                          <div className="text-sm text-gray-900">
                            {book.stock_quantity}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${statusBadge.className} text-xs`}>
                            {statusBadge.text}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Link
                              to={`/books/${book.id}`}
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
                              onClick={() => {
                                if (confirm('هل أنت متأكد من حذف هذا الكتاب؟')) {
                                  // Handle delete
                                }
                              }}
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
            <Link to="/bookstore/books/add" className="btn-primary">
              إضافة كتاب جديد
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageBooksPage
