import { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../utils/api'
import toast from 'react-hot-toast'

// Initial state
const initialState = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
}

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_ERROR: 'SET_ERROR',
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      }
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      }
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        loading: false,
      }
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }
    
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        loading: false,
      }
    
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (token && userData) {
          // Verify token is still valid
          const response = await authAPI.getProfile()
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: response.data.user,
              token,
            },
          })
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        }
      } catch (error) {
        // Token is invalid, clear storage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        dispatch({ type: AUTH_ACTIONS.SET_ERROR })
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
      
      const response = await authAPI.login(credentials)
      const { user, token } = response.data

      // Store in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      })

      toast.success(`مرحباً بك ${user.full_name}`)
      return { success: true }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR })
      const message = error.response?.data?.message || 'فشل في تسجيل الدخول'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
      
      const response = await authAPI.register(userData)
      const { user, token } = response.data

      // Store in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      })

      toast.success(`مرحباً بك ${user.full_name}، تم إنشاء حسابك بنجاح`)
      return { success: true }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR })
      const message = error.response?.data?.message || 'فشل في إنشاء الحساب'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error)
    } finally {
      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
      toast.success('تم تسجيل الخروج بنجاح')
    }
  }

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData)
      const updatedUser = response.data.user

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser))

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: updatedUser,
      })

      toast.success('تم تحديث الملف الشخصي بنجاح')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'فشل في تحديث الملف الشخصي'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Change password
  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData)
      toast.success('تم تغيير كلمة المرور بنجاح')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'فشل في تغيير كلمة المرور'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role)
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    hasRole,
    hasAnyRole,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
