import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, Grid, List, SortAsc, SortDesc } from 'lucide-react'
import { booksAPI } from '../utils/api'
import { debounce } from '../utils/helpers'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import BookCard from '../components/books/BookCard'

const BooksPage = () => {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [pagination, setPagination] = useState({})
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Get current filters from URL
  const currentFilters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    language: searchParams.get('language') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort_by: searchParams.get('sort_by') || 'created_at',
    sort_order: searchParams.get('sort_order') || 'DESC',
    featured_only: searchParams.get('featured') === 'true',
    page: parseInt(searchParams.get('page')) || 1
  }

  const [filters, setFilters] = useState(currentFilters)
  const [searchQuery, setSearchQuery] = useState(currentFilters.search)

  // Debounced search function
  const debouncedSearch = debounce((query) => {
    updateFilters({ search: query, page: 1 })
  }, 500)

  // Update URL params and fetch books
  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    
    // Update URL
    const params = new URLSearchParams()
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== false && value !== 1) {
        params.set(key, value.toString())
      }
    })
    setSearchParams(params)
  }

  // Fetch books
  const fetchBooks = async (filterParams = filters) => {
    try {
      setSearchLoading(true)
      
      // Clean up filters - remove empty values
      const cleanFilters = Object.entries(filterParams).reduce((acc, [key, value]) => {
        if (value && value !== '' && value !== false) {
          acc[key] = value
        }
        return acc
      }, {})

      const response = await booksAPI.getBooks(cleanFilters)
      setBooks(response.data.books || [])
      setPagination(response.data.pagination || {})
    } catch (error) {
      console.error('Error fetching books:', error)
      setBooks([])
    } finally {
      setSearchLoading(false)
      setLoading(false)
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await booksAPI.getCategories()
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Initial load
  useEffect(() => {
    fetchCategories()
    fetchBooks(currentFilters)
  }, [])

  // Fetch books when filters change
  useEffect(() => {
    if (!loading) {
      fetchBooks()
    }
  }, [filters])

  // Handle search input
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    debouncedSearch(query)
  }

  // Handle pagination
  const handlePageChange = (page) => {
    updateFilters({ page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setFilters({
      search: '',
      category: '',
      language: '',
      min_price: '',
      max_price: '',
      sort_by: 'created_at',
      sort_order: 'DESC',
      featured_only: false,
      page: 1
    })
    setSearchParams({})
  }

  const sortOptions = [
    { value: 'created_at:DESC', label: 'الأحدث أولاً' },
    { value: 'created_at:ASC', label: 'الأقدم أولاً' },
    { value: 'title:ASC', label: 'العنوان (أ-ي)' },
    { value: 'title:DESC', label: 'العنوان (ي-أ)' },
    { value: 'price:ASC', label: 'السعر (الأقل أولاً)' },
    { value: 'price:DESC', label: 'السعر (الأعلى أولاً)' },
    { value: 'rating:DESC', label: 'الأعلى تقييماً' },
    { value: 'total_sales:DESC', label: 'الأكثر مبيعاً' }
  ]

  const languageOptions = [
    { value: '', label: 'جميع اللغات' },
    { value: 'arabic', label: 'العربية' },
    { value: 'english', label: 'الإنجليزية' },
    { value: 'both', label: 'ثنائية اللغة' }
  ]

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-dark mb-2">
            تصفح الكتب
          </h1>
          <p className="text-gray-600">
            اكتشف مجموعة واسعة من الكتب العربية والمترجمة
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن كتاب أو مؤلف..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>

            {/* Sort */}
            <div className="lg:w-64">
              <select
                value={`${filters.sort_by}:${filters.sort_order}`}
                onChange={(e) => {
                  const [sort_by, sort_order] = e.target.value.split(':')
                  updateFilters({ sort_by, sort_order, page: 1 })
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-brown text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-brown text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center space-x-2 rtl:space-x-reverse"
            >
              <Filter className="w-4 h-4" />
              <span>فلترة</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التصنيف
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilters({ category: e.target.value, page: 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown"
                  >
                    <option value="">جميع التصنيفات</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category.arabic}>
                        {category.arabic}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اللغة
                  </label>
                  <select
                    value={filters.language}
                    onChange={(e) => updateFilters({ language: e.target.value, page: 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown"
                  >
                    {languageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر الأدنى
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.min_price}
                    onChange={(e) => updateFilters({ min_price: e.target.value, page: 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر الأعلى
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={filters.max_price}
                    onChange={(e) => updateFilters({ max_price: e.target.value, page: 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown"
                  />
                </div>
              </div>

              {/* Featured Toggle */}
              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center space-x-3 rtl:space-x-reverse">
                  <input
                    type="checkbox"
                    checked={filters.featured_only}
                    onChange={(e) => updateFilters({ featured_only: e.target.checked, page: 1 })}
                    className="h-4 w-4 text-primary-brown focus:ring-primary-brown border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">الكتب المميزة فقط</span>
                </label>

                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-brown hover:text-primary-dark transition-colors"
                >
                  مسح جميع الفلاتر
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {searchLoading ? (
                'جاري البحث...'
              ) : (
                `عُثر على ${pagination.total_items || 0} كتاب`
              )}
            </p>
            
            {pagination.total_pages > 1 && (
              <p className="text-sm text-gray-500">
                الصفحة {pagination.current_page} من {pagination.total_pages}
              </p>
            )}
          </div>
        </div>

        {/* Books Grid/List */}
        {searchLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" text="جاري البحث..." />
          </div>
        ) : books.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {books.map((book) => (
              <BookCard 
                key={book.id} 
                book={book} 
                showBookstore={true}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              لم يتم العثور على كتب
            </h3>
            <p className="text-gray-500 mb-6">
              جرب تغيير معايير البحث أو الفلاتر
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              مسح جميع الفلاتر
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={!pagination.has_prev}
                className={`px-4 py-2 rounded-lg border ${
                  pagination.has_prev
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                السابق
              </button>

              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                const page = Math.max(1, pagination.current_page - 2) + i
                if (page > pagination.total_pages) return null
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg border ${
                      page === pagination.current_page
                        ? 'border-primary-brown bg-primary-brown text-white'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={!pagination.has_next}
                className={`px-4 py-2 rounded-lg border ${
                  pagination.has_next
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BooksPage
