import { clsx } from 'clsx'

// Utility function for conditional class names (similar to clsx)
export function cn(...inputs) {
  return clsx(inputs)
}

// Format price in Iraqi Dinar
export const formatPrice = (price) => {
  if (typeof price !== 'number') {
    price = parseFloat(price) || 0
  }
  
  return new Intl.NumberFormat('ar-IQ', {
    style: 'currency',
    currency: 'IQD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

// Format date in Arabic
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }
  
  return new Intl.DateTimeFormat('ar-IQ', defaultOptions).format(new Date(date))
}

// Format date with time
export const formatDateTime = (date) => {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Get relative time (e.g., "منذ 5 دقائق")
export const getRelativeTime = (date) => {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((now - targetDate) / 1000)
  
  if (diffInSeconds < 60) {
    return 'منذ لحظات'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`
  } else {
    return formatDate(date)
  }
}

// Get image URL with fallback
export const getImageUrl = (imagePath, fallback = '/placeholder-book.jpg') => {
  if (!imagePath) return fallback
  if (imagePath.startsWith('http')) return imagePath
  return `${window.location.origin}${imagePath}`
}

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number (Iraqi format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+964|0)?[0-9]{10}$/
  return phoneRegex.test(phone.replace(/\s|-|\(|\)/g, ''))
}

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Convert Arabic numerals to English
export const arabicToEnglishNumbers = (str) => {
  const arabicNumbers = '٠١٢٣٤٥٦٧٨٩'
  const englishNumbers = '0123456789'
  
  return str.replace(/[٠-٩]/g, (match) => {
    return englishNumbers[arabicNumbers.indexOf(match)]
  })
}

// Convert English numerals to Arabic
export const englishToArabicNumbers = (str) => {
  const arabicNumbers = '٠١٢٣٤٥٦٧٨٩'
  const englishNumbers = '0123456789'
  
  return str.replace(/[0-9]/g, (match) => {
    return arabicNumbers[englishNumbers.indexOf(match)]
  })
}

// Get book status badge info
export const getBookStatusBadge = (book) => {
  if (!book.is_active) {
    return { text: 'غير متاح', className: 'badge-error' }
  }
  
  if (book.stock_quantity === 0) {
    return { text: 'نفد المخزون', className: 'badge-warning' }
  }
  
  if (book.stock_quantity < 5) {
    return { text: 'كمية محدودة', className: 'badge-warning' }
  }
  
  return { text: 'متاح', className: 'badge-success' }
}

// Get order status badge info
export const getOrderStatusBadge = (status) => {
  const statusMap = {
    pending: { text: 'في الانتظار', className: 'badge-warning' },
    confirmed: { text: 'مؤكد', className: 'badge-info' },
    processing: { text: 'قيد التجهيز', className: 'badge-info' },
    shipped: { text: 'تم الشحن', className: 'badge-info' },
    delivered: { text: 'تم التسليم', className: 'badge-success' },
    cancelled: { text: 'ملغي', className: 'badge-error' },
  }
  
  return statusMap[status] || { text: status, className: 'badge-info' }
}

// Get payment status badge info
export const getPaymentStatusBadge = (status) => {
  const statusMap = {
    pending: { text: 'في الانتظار', className: 'badge-warning' },
    paid: { text: 'مدفوع', className: 'badge-success' },
    failed: { text: 'فشل', className: 'badge-error' },
    refunded: { text: 'مسترد', className: 'badge-info' },
  }
  
  return statusMap[status] || { text: status, className: 'badge-info' }
}

// Local storage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error)
      return defaultValue
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error)
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
    }
  },
  
  clear: () => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }
}

// URL helpers
export const buildUrl = (base, params = {}) => {
  const url = new URL(base, window.location.origin)
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      url.searchParams.append(key, params[key])
    }
  })
  return url.toString()
}

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (fallbackError) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

// Scroll to top
export const scrollToTop = (smooth = true) => {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  })
}

// Check if element is in viewport
export const isInViewport = (element) => {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}
