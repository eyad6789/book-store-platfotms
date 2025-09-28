import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, SlidersHorizontal, Star, MapPin } from 'lucide-react';
import { debounce } from 'lodash';
import { motion, AnimatePresence } from 'framer-motion';
import BookCard from '../books/BookCard';
import LoadingSpinner from '../ui/LoadingSpinner';

function AdvancedSearchSystem() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    author: '',
    publisher: '',
    minPrice: '',
    maxPrice: '',
    language: '',
    condition: '',
    minYear: '',
    maxYear: '',
    minRating: '',
    tags: '',
    governorate: '',
    sortBy: 'relevance'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query, currentFilters, page = 1) => {
      performSearch(query, currentFilters, page);
    }, 300),
    []
  );

  const performSearch = async (query = searchQuery, currentFilters = filters, page = 1) => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: '12',
        ...Object.fromEntries(
          Object.entries(currentFilters).filter(([_, value]) => value !== '')
        )
      });

      const response = await fetch(`/api/books/search?${searchParams}`);
      const data = await response.json();

      if (data.success) {
        setBooks(page === 1 ? data.books : [...books, ...data.books]);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
      setShowSuggestions(false);
    }
  };

  // Get search suggestions
  const getSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/books/suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  };

  // Load categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/books/categories');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Categories error:', error);
      }
    };
    fetchCategories();
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      getSuggestions(query);
      debouncedSearch(query, filters);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    debouncedSearch(searchQuery, newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      subcategory: '',
      author: '',
      publisher: '',
      minPrice: '',
      maxPrice: '',
      language: '',
      condition: '',
      minYear: '',
      maxYear: '',
      minRating: '',
      tags: '',
      governorate: '',
      sortBy: 'relevance'
    };
    setFilters(clearedFilters);
    performSearch(searchQuery, clearedFilters);
  };

  // Load more results
  const loadMore = () => {
    if (pagination.hasNext) {
      performSearch(searchQuery, filters, pagination.currentPage + 1);
    }
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length - 1; // -1 for sortBy

  return (
    <div className="max-w-7xl mx-auto p-4" dir="rtl">
      {/* Search Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Main Search Bar */}
        <div className="relative mb-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن كتاب، مؤلف، ناشر، أو موضوع..."
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              />
              
              {/* Search Suggestions */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 z-50 max-h-60 overflow-y-auto"
                  >
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setSearchQuery(suggestion.text);
                          performSearch(suggestion.text, filters);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Search className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-800">{suggestion.text}</span>
                          {suggestion.type && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {suggestion.type === 'book' ? 'كتاب' : 
                               suggestion.type === 'author' ? 'مؤلف' : 
                               suggestion.type === 'category' ? 'تصنيف' : suggestion.type}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-xl hover:bg-gray-50 flex items-center gap-2 relative ${
                showFilters ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span className="hidden sm:inline">فلترة</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Results Summary */}
        {(books.length > 0 || searchQuery || activeFiltersCount > 0) && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>عرض {books.length} من {pagination.totalItems || 0} نتيجة</span>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التصنيف
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">جميع التصنيفات</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name_ar || cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اللغة
                </label>
                <select
                  value={filters.language}
                  onChange={(e) => handleFilterChange('language', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">جميع اللغات</option>
                  <option value="ar">العربية</option>
                  <option value="en">الإنجليزية</option>
                  <option value="ku">الكردية</option>
                  <option value="fr">الفرنسية</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر (دينار عراقي)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="من"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="إلى"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  حالة الكتاب
                </label>
                <select
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">جميع الحالات</option>
                  <option value="new">جديد</option>
                  <option value="like_new">كالجديد</option>
                  <option value="good">جيد</option>
                  <option value="acceptable">مقبول</option>
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التقييم الأدنى
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">أي تقييم</option>
                  <option value="4">4 نجوم فأكثر</option>
                  <option value="3">3 نجوم فأكثر</option>
                  <option value="2">2 نجوم فأكثر</option>
                  <option value="1">1 نجمة فأكثر</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المحافظة
                </label>
                <select
                  value={filters.governorate}
                  onChange={(e) => handleFilterChange('governorate', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">جميع المحافظات</option>
                  <option value="baghdad">بغداد</option>
                  <option value="basra">البصرة</option>
                  <option value="erbil">أربيل</option>
                  <option value="najaf">النجف</option>
                  <option value="mosul">الموصل</option>
                  <option value="karbala">كربلاء</option>
                  <option value="kirkuk">كركوك</option>
                  <option value="anbar">الأنبار</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ترتيب النتائج
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">الأكثر صلة</option>
                  <option value="newest">الأحدث</option>
                  <option value="price_low">السعر: من الأقل للأعلى</option>
                  <option value="price_high">السعر: من الأعلى للأقل</option>
                  <option value="rating">الأعلى تقييماً</option>
                  <option value="popular">الأكثر مبيعاً</option>
                  <option value="title_ar">العنوان أ-ي</option>
                  <option value="author">المؤلف أ-ي</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t">
              <button
                onClick={clearFilters}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2 justify-center"
              >
                <X className="h-4 w-4" />
                مسح جميع الفلاتر
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="large" text="جاري البحث..." />
        </div>
      )}

      {/* Load More Button */}
      {pagination.hasNext && !loading && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            تحميل المزيد
          </button>
        </div>
      )}

      {/* No Results */}
      {!loading && books.length === 0 && (searchQuery || activeFiltersCount > 0) && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
          <p className="text-gray-600 mb-4">جرب تعديل البحث أو الفلاتر</p>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800"
          >
            مسح جميع الفلاتر
          </button>
        </div>
      )}
    </div>
  );
}

export default AdvancedSearchSystem;
