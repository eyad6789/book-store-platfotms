import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'حدث خطأ غير متوقع'
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      toast.error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى')
    } else if (error.response?.status === 403) {
      toast.error('ليس لديك صلاحية للوصول إلى هذا المورد')
    } else if (error.response?.status === 404) {
      toast.error('المورد المطلوب غير موجود')
    } else if (error.response?.status >= 500) {
      toast.error('خطأ في الخادم، يرجى المحاولة لاحقاً')
    } else if (error.code === 'ECONNABORTED') {
      toast.error('انتهت مهلة الاتصال، يرجى المحاولة مرة أخرى')
    } else if (!error.response) {
      toast.error('خطأ في الاتصال بالخادم')
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  logout: () => api.post('/auth/logout'),
  uploadAvatar: (formData) => api.post('/auth/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// Books API
export const booksAPI = {
  getBooks: (params) => api.get('/books', { params }),
  getBook: (id) => api.get(`/books/${id}`),
  getFeaturedBooks: (params) => api.get('/books/featured', { params }),
  getCategories: () => api.get('/books/categories'),
  createBook: (bookData) => api.post('/books', bookData),
  updateBook: (id, bookData) => api.put(`/books/${id}`, bookData),
  deleteBook: (id) => api.delete(`/books/${id}`),
  uploadBookImage: (id, formData) => api.post(`/books/${id}/upload-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// Bookstores API
export const bookstoresAPI = {
  getBookstores: (params) => api.get('/bookstores', { params }),
  getBookstore: (id) => api.get(`/bookstores/${id}`),
  getBookstoreBooks: (id, params) => api.get(`/bookstores/${id}/books`, { params }),
  registerBookstore: (bookstoreData) => api.post('/bookstores/register', bookstoreData),
  getMyBookstore: () => api.get('/bookstores/my-bookstore'),
  updateMyBookstore: (bookstoreData) => api.put('/bookstores/my-bookstore', bookstoreData),
  uploadLogo: (formData) => api.post('/bookstores/my-bookstore/upload-logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyBooks: (params) => api.get('/bookstores/my-bookstore/books', { params }),
  // Admin endpoints
  getPendingBookstores: () => api.get('/bookstores/admin/pending'),
  approveBookstore: (id) => api.put(`/bookstores/admin/${id}/approve`),
}

// Orders API
export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  getOrderStats: () => api.get('/orders/stats'),
  // Admin endpoints
  getAllOrders: (params) => api.get('/orders/admin/all', { params }),
  updateOrderStatus: (id, statusData) => api.put(`/orders/admin/${id}/status`, statusData),
}

// Utility functions
export const handleApiError = (error) => {
  if (error.response?.data?.details) {
    // Handle validation errors
    const details = error.response.data.details
    if (Array.isArray(details)) {
      details.forEach(detail => {
        toast.error(`${detail.field}: ${detail.message}`)
      })
    } else {
      toast.error(details)
    }
  } else {
    const message = error.response?.data?.message || error.message || 'حدث خطأ غير متوقع'
    toast.error(message)
  }
}

export const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-IQ', {
    style: 'currency',
    currency: 'IQD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-book.jpg'
  if (imagePath.startsWith('http')) return imagePath
  return `${window.location.origin}${imagePath}`
}

export default api
