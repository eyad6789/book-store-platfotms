import { Routes, Route } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Layout components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Public pages
import HomePage from './pages/HomePage'
import BooksPage from './pages/BooksPage'
import BookDetailPage from './pages/BookDetailPage'
import BookstoresPage from './pages/BookstoresPage'
import BookstoreDetailPage from './pages/BookstoreDetailPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'

// Protected pages
import ProfilePage from './pages/ProfilePage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'

// Bookstore owner pages
import BookstoreDashboard from './pages/bookstore/BookstoreDashboard'
import BookstoreRegister from './pages/bookstore/BookstoreRegister'
import ManageBooksPage from './pages/bookstore/ManageBooksPage'
import AddBookPage from './pages/bookstore/AddBookPage'
import EditBookPage from './pages/bookstore/EditBookPage'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'

// Components
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoadingSpinner from './components/ui/LoadingSpinner'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-cream">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-cream flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/bookstores" element={<BookstoresPage />} />
          <Route path="/bookstores/:id" element={<BookstoreDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected customer routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } />
          <Route path="/orders/:id" element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          } />
          
          {/* Bookstore owner routes */}
          <Route path="/bookstore/register" element={
            <ProtectedRoute requiredRole="bookstore_owner">
              <BookstoreRegister />
            </ProtectedRoute>
          } />
          <Route path="/bookstore/dashboard" element={
            <ProtectedRoute requiredRole="bookstore_owner">
              <BookstoreDashboard />
            </ProtectedRoute>
          } />
          <Route path="/bookstore/books" element={
            <ProtectedRoute requiredRole="bookstore_owner">
              <ManageBooksPage />
            </ProtectedRoute>
          } />
          <Route path="/bookstore/books/add" element={
            <ProtectedRoute requiredRole="bookstore_owner">
              <AddBookPage />
            </ProtectedRoute>
          } />
          <Route path="/bookstore/books/:id/edit" element={
            <ProtectedRoute requiredRole="bookstore_owner">
              <EditBookPage />
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* 404 page */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-primary-brown mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">الصفحة غير موجودة</p>
                <a href="/" className="btn-primary">
                  العودة للصفحة الرئيسية
                </a>
              </div>
            </div>
          } />
        </Routes>
      </main>
      
      <Footer />
    </div>
  )
}

export default App
