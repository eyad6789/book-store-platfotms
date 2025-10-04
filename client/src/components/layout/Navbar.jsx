import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  Menu, 
  X, 
  ShoppingCart, 
  User, 
  Search,
  BookOpen,
  Store,
  LogOut,
  Settings,
  Package,
  Plus,
  LayoutDashboard
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { bookstoresAPI } from '../../utils/api'
import { getImageUrl } from '../../utils/helpers'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [bookstore, setBookstore] = useState(null)
  const [hasCheckedBookstore, setHasCheckedBookstore] = useState(false)
  const [isCheckingBookstore, setIsCheckingBookstore] = useState(false)
  
  const { user, isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsUserMenuOpen(false)
  }

  const isActivePath = (path) => {
    return location.pathname === path
  }

  // Check if bookstore owner has a registered library
  useEffect(() => {
    const checkBookstore = async () => {
      // Reset check when user changes
      if (!user || !isAuthenticated || user.role !== 'bookstore_owner') {
        setBookstore(null)
        setHasCheckedBookstore(false)
        setIsCheckingBookstore(false)
        return
      }

      // Only check once unless forced
      if (hasCheckedBookstore || isCheckingBookstore) {
        return
      }

      setIsCheckingBookstore(true)

      try {
        console.log('🔍 Checking for bookstore registration for user:', user.id)
        const response = await bookstoresAPI.getMyBookstore()
        
        if (response.data && response.data.bookstore) {
          console.log('✅ Bookstore found:', response.data.bookstore.name, 'ID:', response.data.bookstore.id)
          setBookstore(response.data.bookstore)
        } else {
          console.log('⚠️ API returned but no bookstore data')
          setBookstore(null)
        }
      } catch (error) {
        console.log('❌ No bookstore found:', error.response?.status, error.response?.data?.message)
        setBookstore(null)
      } finally {
        setHasCheckedBookstore(true)
        setIsCheckingBookstore(false)
      }
    }

    checkBookstore()
  }, [user, isAuthenticated, hasCheckedBookstore, isCheckingBookstore])

  const handleCreateLibrary = async () => {
    navigate('/bookstore/register')
    setIsUserMenuOpen(false)
  }

  const refreshBookstoreCheck = () => {
    console.log('🔄 Manually refreshing bookstore check...')
    setHasCheckedBookstore(false)
    setIsCheckingBookstore(false)
    setBookstore(null)
  }

  const navLinks = [
    { path: '/', label: 'الرئيسية', icon: null },
    { path: '/books', label: 'الكتب', icon: BookOpen },
    { path: '/bookstores', label: 'المكتبات', icon: Store },
  ]

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="text-xl font-bold text-primary-brown">
              المتنبي
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isActivePath(link.path) ? 'nav-link-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="ابحث عن كتاب أو مؤلف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-brown"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-primary-brown transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-brown text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 rtl:space-x-reverse p-2 text-gray-600 hover:text-primary-brown transition-colors"
                >
                  {user?.avatar_url ? (
                    <img 
                      src={getImageUrl(user.avatar_url)} 
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary-brown"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary-brown rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium">
                    {user?.full_name}
                  </span>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>الملف الشخصي</span>
                    </Link>
                    
                    <Link
                      to="/orders"
                      className="flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Package className="w-4 h-4" />
                      <span>طلباتي</span>
                    </Link>

                    {user?.role === 'bookstore_owner' && (
                      <>
                        {isCheckingBookstore ? (
                          // Loading state
                          <div className="px-4 py-3 border-t border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-brown"></div>
                              <span>جاري التحقق...</span>
                            </div>
                          </div>
                        ) : !bookstore && hasCheckedBookstore ? (
                          // User has NOT registered a library yet
                          <div className="px-4 py-3 border-t border-b border-gray-200 bg-gray-50">
                            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                              يبدو أنك لم تسجل مكتبتك بعد
                            </p>
                            <button
                              onClick={handleCreateLibrary}
                              className="w-full inline-flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              <span>إنشاء مكتبة رقمية</span>
                            </button>
                          </div>
                        ) : bookstore ? (
                          // User HAS registered a library
                          <>
                            <div className="px-4 py-2 border-t border-gray-200">
                              <p className="text-xs text-gray-500 mb-1">مكتبتي</p>
                              <p className="text-sm font-semibold text-primary-brown">{bookstore.name}</p>
                            </div>
                            <Link
                              to={`/library/${bookstore.id}/dashboard`}
                              className="flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              <span>لوحة التحكم</span>
                            </Link>
                            <Link
                              to={`/library/${bookstore.id}/books/add`}
                              className="flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Plus className="w-4 h-4" />
                              <span>إضافة كتاب</span>
                            </Link>
                          </>
                        ) : null}
                      </>
                    )}

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>لوحة الإدارة</span>
                      </Link>
                    )}

                    <hr className="my-2" />
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-right"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Link
                  to="/login"
                  className="btn-ghost"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-brown"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="px-4 mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن كتاب أو مؤلف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <div className="space-y-2 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block py-2 text-base font-medium ${
                    isActivePath(link.path) 
                      ? 'text-primary-brown' 
                      : 'text-gray-600 hover:text-primary-brown'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="block py-2 text-base font-medium text-gray-600 hover:text-primary-brown"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    to="/register"
                    className="block py-2 text-base font-medium text-gray-600 hover:text-primary-brown"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    إنشاء حساب
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </nav>
  )
}

export default Navbar
