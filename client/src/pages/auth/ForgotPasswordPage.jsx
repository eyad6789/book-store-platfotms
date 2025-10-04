import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowRight, CheckCircle } from 'lucide-react'
import { authAPI } from '../../utils/api'
import toast from 'react-hot-toast'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('يرجى إدخال البريد الإلكتروني')
      return
    }

    setLoading(true)
    try {
      const response = await authAPI.forgotPassword({ email })
      setEmailSent(true)
      toast.success(response.data.message || 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ، يرجى المحاولة مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-primary-dark mb-4">
                تم إرسال البريد الإلكتروني
              </h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                تم إرسال رابط إعادة تعيين كلمة المرور إلى:
                <br />
                <strong className="text-primary-brown english-text" dir="ltr">{email}</strong>
              </p>
              
              <div className="bg-blue-50 border-r-4 border-blue-500 p-4 mb-6 text-right">
                <p className="text-sm text-gray-700">
                  يرجى التحقق من صندوق الوارد الخاص بك (وصندوق البريد العشوائي) واتباع التعليمات في البريد الإلكتروني.
                </p>
              </div>

              <div className="space-y-3">
                <Link 
                  to="/login"
                  className="block w-full bg-primary-brown text-white py-3 rounded-lg hover:bg-opacity-90 transition-colors font-medium"
                >
                  العودة إلى تسجيل الدخول
                </Link>
                
                <button
                  onClick={() => {
                    setEmailSent(false)
                    setEmail('')
                  }}
                  className="block w-full text-primary-gold hover:underline"
                >
                  إرسال البريد مرة أخرى
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary-dark" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-primary-dark mb-2">
            نسيت كلمة المرور؟
          </h2>
          <p className="text-gray-600">
            لا تقلق، سنرسل لك تعليمات إعادة التعيين
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent english-text"
                  placeholder="example@email.com"
                  dir="ltr"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse bg-primary-brown text-white py-3 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <span>إرسال رابط إعادة التعيين</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              تذكرت كلمة المرور؟{' '}
              <Link to="/login" className="text-primary-gold hover:underline font-medium">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong>ملاحظة:</strong> الرابط صالح لمدة ساعة واحدة فقط. إذا لم تستلم البريد الإلكتروني، يرجى التحقق من مجلد الرسائل العشوائية.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
