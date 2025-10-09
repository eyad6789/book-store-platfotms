import { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'

// Initial state
const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
}

// Action types
const CART_ACTIONS = {
  LOAD_CART: 'LOAD_CART',
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
}

// Helper functions
const calculateTotal = (items) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0)
}

const calculateItemCount = (items) => {
  return items.reduce((count, item) => count + item.quantity, 0)
}

const saveToLocalStorage = (items) => {
  localStorage.setItem('cart', JSON.stringify(items))
}

// Reducer
const cartReducer = (state, action) => {
  let newItems

  switch (action.type) {
    case CART_ACTIONS.LOAD_CART:
      return {
        items: action.payload,
        total: calculateTotal(action.payload),
        itemCount: calculateItemCount(action.payload),
      }

    case CART_ACTIONS.ADD_ITEM:
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id
      )

      if (existingItemIndex >= 0) {
        // Item already exists, update quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        )
      } else {
        // New item, add to cart
        newItems = [...state.items, action.payload]
      }

      saveToLocalStorage(newItems)
      return {
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      }

    case CART_ACTIONS.REMOVE_ITEM:
      newItems = state.items.filter(item => item.id !== action.payload)
      saveToLocalStorage(newItems)
      return {
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      }

    case CART_ACTIONS.UPDATE_QUANTITY:
      newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0) // Remove items with 0 quantity

      saveToLocalStorage(newItems)
      return {
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      }

    case CART_ACTIONS.CLEAR_CART:
      saveToLocalStorage([])
      return initialState

    default:
      return state
  }
}

// Create context
const CartContext = createContext()

// Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        const cartItems = JSON.parse(savedCart)
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartItems })
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
      localStorage.removeItem('cart')
    }
  }, [])

  // Add item to cart
  const addToCart = (book, quantity = 1) => {
    // Validate stock
    if (book.stock_quantity < quantity) {
      toast.error(`متوفر فقط ${book.stock_quantity} نسخة من هذا الكتاب`)
      return false
    }

    // Check if adding this quantity would exceed stock
    const existingItem = state.items.find(item => item.id === book.id)
    const currentQuantity = existingItem ? existingItem.quantity : 0
    const newTotalQuantity = currentQuantity + quantity

    if (newTotalQuantity > book.stock_quantity) {
      toast.error(`لا يمكن إضافة أكثر من ${book.stock_quantity} نسخة من هذا الكتاب`)
      return false
    }

    const cartItem = {
      id: book.id,
      title: book.title,
      title_arabic: book.title_arabic,
      author: book.author,
      author_arabic: book.author_arabic,
      price: parseFloat(book.price),
      image_url: book.image_url,
      stock_quantity: book.stock_quantity,
      bookstore: book.bookstore,
      quantity,
    }

    dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: cartItem })
    
    if (existingItem) {
      toast.success(`تم تحديث كمية "${book.title_arabic || book.title}" في السلة`)
    } else {
      toast.success(`تم إضافة "${book.title_arabic || book.title}" إلى السلة`)
    }
    
    return true
  }

  // Remove item from cart
  const removeFromCart = (bookId) => {
    const item = state.items.find(item => item.id === bookId)
    if (item) {
      dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: bookId })
      toast.success(`تم حذف "${item.title_arabic || item.title}" من السلة`)
    }
  }

  // Update item quantity
  const updateQuantity = (bookId, quantity) => {
    if (quantity < 0) return

    const item = state.items.find(item => item.id === bookId)
    if (!item) return

    // Check stock availability
    if (quantity > item.stock_quantity) {
      toast.error(`متوفر فقط ${item.stock_quantity} نسخة من هذا الكتاب`)
      return false
    }

    if (quantity === 0) {
      removeFromCart(bookId)
      return true
    }

    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { id: bookId, quantity }
    })

    return true
  }

  // Clear entire cart
  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART })
    toast.success('تم إفراغ السلة')
  }

  // Get item quantity in cart
  const getItemQuantity = (bookId) => {
    const item = state.items.find(item => item.id === bookId)
    return item ? item.quantity : 0
  }

  // Check if item is in cart
  const isInCart = (bookId) => {
    return state.items.some(item => item.id === bookId)
  }

  // Get cart summary for checkout
  const getCartSummary = () => {
    const subtotal = state.total
    const shipping = subtotal > 50 ? 0 : 5 // Free shipping over $50
    const tax = 0 // No tax for MVP
    const total = subtotal + shipping + tax

    return {
      subtotal,
      shipping,
      tax,
      total,
      itemCount: state.itemCount,
    }
  }

  // Validate cart items (check stock availability)
  const validateCart = async () => {
    // This would typically make API calls to verify current stock
    // For now, we'll just check against the stored stock quantities
    const invalidItems = state.items.filter(item => item.quantity > item.stock_quantity)
    
    if (invalidItems.length > 0) {
      invalidItems.forEach(item => {
        toast.success(`تم تحديث كمية "${item.title_arabic || item.title}" - الكتاب متاح`)
        updateQuantity(item.id, item.stock_quantity)
      })
      return false
    }

    return true
  }

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart,
    getCartSummary,
    validateCart,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
