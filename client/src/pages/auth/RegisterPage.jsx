import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, User, Phone, BookOpen, Store } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { register: registerUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm({
    defaultValues: {
      role: 'customer'
    }
  })

  const watchPassword = watch('password')
  const watchRole = watch('role')

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      const { confirmPassword, terms, ...userData } = data
      const result = await registerUser(userData)
      
      if (result.success) {
        navigate('/')
      } else {
        setError('root', {
          type: 'manual',
          message: result.error || 'فشل في إنشاء الحساب'
        })
      }
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'حدث خطأ غير متوقع'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-cream flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-primary-dark">
            إنشاء حساب جديد
          </h2>
          <p className="mt-2 text-gray-600">
            انضم إلى مجتمع قراء المتنبي
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Selection */}
            <div className="form-group">
              <label className="form-label">نوع الحساب</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 rtl:space-x-reverse p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value="customer"
                    className="text-primary-brown focus:ring-primary-brown"
                    {...register('role', { required: 'يرجى اختيار نوع الحساب' })}
                  />
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium">قارئ</span>
                </label>
                <label className="flex items-center space-x-3 rtl:space-x-reverse p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value="bookstore_owner"
                    className="text-primary-brown focus:ring-primary-brown"
                    {...register('role', { required: 'يرجى اختيار نوع الحساب' })}
                  />
                  <Store className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium">صاحب مكتبة</span>
                </label>
              </div>
              {errors.role && (
                <p className="form-error">{errors.role.message}</p>
              )}
            </div>

            {/* Full Name Field */}
            <div className="form-group">
              <label htmlFor="full_name" className="form-label">
                الاسم الكامل
              </label>
              <div className="relative">
                <input
                  id="full_name"
                  type="text"
                  autoComplete="name"
                  className={`input-field pl-10 ${errors.full_name ? 'input-error' : ''}`}
                  placeholder="أدخل اسمك الكامل"
                  {...register('full_name', {
                    required: 'الاسم الكامل مطلوب',
                    minLength: {
                      value: 2,
                      message: 'الاسم يجب أن يكون حرفين على الأقل'
                    },
                    maxLength: {
                      value: 255,
                      message: 'الاسم طويل جداً'
                    }
                  })}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              {errors.full_name && (
                <p className="form-error">{errors.full_name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`input-field pl-10 ${errors.email ? 'input-error' : ''}`}
                  placeholder="أدخل بريدك الإلكتروني"
                  {...register('email', {
                    required: 'البريد الإلكتروني مطلوب',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'يرجى إدخال بريد إلكتروني صحيح'
                    }
                  })}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                رقم الهاتف (اختياري)
              </label>
              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  className={`input-field pl-10 ${errors.phone ? 'input-error' : ''}`}
                  placeholder="مثال: +964 770 123 4567"
                  {...register('phone', {
                    pattern: {
                      value: /^[\+]?[0-9\s\-\(\)]+$/,
                      message: 'يرجى إدخال رقم هاتف صحيح'
                    }
                  })}
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              {errors.phone && (
                <p className="form-error">{errors.phone.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="أدخل كلمة المرور"
                  {...register('password', {
                    required: 'كلمة المرور مطلوبة',
                    minLength: {
                      value: 6,
                      message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
                    }
                  })}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="أعد إدخال كلمة المرور"
                  {...register('confirmPassword', {
                    required: 'تأكيد كلمة المرور مطلوب',
                    validate: value =>
                      value === watchPassword || 'كلمات المرور غير متطابقة'
                  })}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <input
                id="terms"
                type="checkbox"
                className="mt-1 h-4 w-4 text-primary-brown focus:ring-primary-brown border-gray-300 rounded"
                {...register('terms', {
                  required: 'يجب الموافقة على الشروط والأحكام'
                })}
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                أوافق على{' '}
                <Link
                  to="/terms"
                  className="text-primary-brown hover:text-primary-dark transition-colors"
                  target="_blank"
                >
                  الشروط والأحكام
                </Link>
                {' '}و{' '}
                <Link
                  to="/privacy"
                  className="text-primary-brown hover:text-primary-dark transition-colors"
                  target="_blank"
                >
                  سياسة الخصوصية
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="form-error">{errors.terms.message}</p>
            )}

            {/* Bookstore Owner Notice */}
            {watchRole === 'bookstore_owner' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>ملاحظة:</strong> بعد إنشاء الحساب، ستحتاج إلى تسجيل مكتبتك وانتظار موافقة الإدارة قبل البدء في بيع الكتب.
                </p>
              </div>
            )}

            {/* Error Message */}
            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.root.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" color="white" className="ml-2" />
                  جاري إنشاء الحساب...
                </>
              ) : (
                'إنشاء الحساب'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link
                to="/login"
                className="text-primary-brown hover:text-primary-dark font-medium transition-colors"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
