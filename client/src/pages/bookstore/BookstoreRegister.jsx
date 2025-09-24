import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Store, MapPin, Phone, Mail, FileText } from 'lucide-react'
import { bookstoresAPI } from '../../utils/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const BookstoreRegister = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      const response = await bookstoresAPI.registerBookstore(data)
      
      if (response.data) {
        toast.success('تم تسجيل مكتبتك بنجاح! في انتظار موافقة الإدارة.')
        navigate('/bookstore/dashboard')
      }
    } catch (error) {
      console.error('Bookstore registration error:', error)
      const message = error.response?.data?.message || 'حدث خطأ أثناء تسجيل المكتبة'
      toast.error(message)
      
      if (error.response?.data?.details) {
        error.response.data.details.forEach(detail => {
          setError(detail.field, {
            type: 'manual',
            message: detail.message
          })
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-cream">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary-dark mb-2">
            تسجيل مكتبة جديدة
          </h1>
          <p className="text-gray-600">
            انضم إلى شبكة المتنبي وابدأ في بيع كتبك
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-primary-dark mb-4 flex items-center space-x-2 rtl:space-x-reverse">
                <Store className="w-5 h-5" />
                <span>المعلومات الأساسية</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="form-label">
                    اسم المكتبة (بالإنجليزية) *
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={`input-field ${errors.name ? 'input-error' : ''}`}
                    placeholder="Baghdad Heritage Bookstore"
                    {...register('name', {
                      required: 'اسم المكتبة مطلوب',
                      minLength: {
                        value: 2,
                        message: 'اسم المكتبة يجب أن يكون حرفين على الأقل'
                      }
                    })}
                  />
                  {errors.name && (
                    <p className="form-error">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="name_arabic" className="form-label">
                    اسم المكتبة (بالعربية)
                  </label>
                  <input
                    id="name_arabic"
                    type="text"
                    className="input-field"
                    placeholder="مكتبة بغداد للتراث"
                    {...register('name_arabic')}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-primary-dark mb-4 flex items-center space-x-2 rtl:space-x-reverse">
                <FileText className="w-5 h-5" />
                <span>وصف المكتبة</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="description" className="form-label">
                    وصف المكتبة (بالإنجليزية)
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className="input-field"
                    placeholder="Specialized bookstore for Arabic and translated books..."
                    {...register('description')}
                  />
                </div>

                <div>
                  <label htmlFor="description_arabic" className="form-label">
                    وصف المكتبة (بالعربية)
                  </label>
                  <textarea
                    id="description_arabic"
                    rows={3}
                    className="input-field"
                    placeholder="مكتبة متخصصة في الكتب العربية والمترجمة..."
                    {...register('description_arabic')}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-semibold text-primary-dark mb-4 flex items-center space-x-2 rtl:space-x-reverse">
                <Phone className="w-5 h-5" />
                <span>معلومات التواصل</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="phone" className="form-label">
                    رقم الهاتف
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      type="tel"
                      className={`input-field pl-10 ${errors.phone ? 'input-error' : ''}`}
                      placeholder="+964 770 123 4567"
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

                <div>
                  <label htmlFor="email" className="form-label">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      className={`input-field pl-10 ${errors.email ? 'input-error' : ''}`}
                      placeholder="info@bookstore.com"
                      {...register('email', {
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
              </div>
            </div>

            {/* Address */}
            <div>
              <h2 className="text-xl font-semibold text-primary-dark mb-4 flex items-center space-x-2 rtl:space-x-reverse">
                <MapPin className="w-5 h-5" />
                <span>العنوان</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="form-label">
                    العنوان (بالإنجليزية)
                  </label>
                  <textarea
                    id="address"
                    rows={2}
                    className="input-field"
                    placeholder="Al-Mutanabbi Street, Baghdad, Iraq"
                    {...register('address')}
                  />
                </div>

                <div>
                  <label htmlFor="address_arabic" className="form-label">
                    العنوان (بالعربية)
                  </label>
                  <textarea
                    id="address_arabic"
                    rows={2}
                    className="input-field"
                    placeholder="شارع المتنبي، بغداد، العراق"
                    {...register('address_arabic')}
                  />
                </div>
              </div>
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
                أوافق على شروط وأحكام منصة المتنبي وأتعهد بتقديم معلومات صحيحة ودقيقة
              </label>
            </div>
            {errors.terms && (
              <p className="form-error">{errors.terms.message}</p>
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
                  جاري التسجيل...
                </>
              ) : (
                'تسجيل المكتبة'
              )}
            </button>
          </form>

          {/* Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>ملاحظة:</strong> بعد تسجيل مكتبتك، ستحتاج إلى انتظار موافقة فريق الإدارة قبل البدء في عرض وبيع الكتب. 
              سيتم إشعارك عبر البريد الإلكتروني عند الموافقة على طلبك.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookstoreRegister
