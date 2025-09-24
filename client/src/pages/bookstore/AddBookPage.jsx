import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { BookOpen, Upload, ArrowLeft } from 'lucide-react'
import { booksAPI } from '../../utils/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const AddBookPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    defaultValues: {
      language: 'arabic',
      stock_quantity: 1
    }
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      const response = await booksAPI.createBook(data)
      
      if (response.data) {
        toast.success('تم إضافة الكتاب بنجاح!')
        navigate('/bookstore/books')
      }
    } catch (error) {
      console.error('Add book error:', error)
      const message = error.response?.data?.message || 'حدث خطأ أثناء إضافة الكتاب'
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/bookstore/books')}
          className="inline-flex items-center space-x-2 rtl:space-x-reverse text-primary-brown hover:text-primary-dark transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 rtl-flip" />
          <span>العودة لإدارة الكتب</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary-dark mb-2">
            إضافة كتاب جديد
          </h1>
          <p className="text-gray-600">
            أضف كتاباً جديداً إلى مكتبتك
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-primary-dark mb-6">المعلومات الأساسية</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="form-label">
                    عنوان الكتاب (بالإنجليزية) *
                  </label>
                  <input
                    id="title"
                    type="text"
                    className={`input-field ${errors.title ? 'input-error' : ''}`}
                    placeholder="Book Title"
                    {...register('title', {
                      required: 'عنوان الكتاب مطلوب'
                    })}
                  />
                  {errors.title && (
                    <p className="form-error">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="title_arabic" className="form-label">
                    عنوان الكتاب (بالعربية)
                  </label>
                  <input
                    id="title_arabic"
                    type="text"
                    className="input-field"
                    placeholder="عنوان الكتاب"
                    {...register('title_arabic')}
                  />
                </div>

                <div>
                  <label htmlFor="author" className="form-label">
                    المؤلف (بالإنجليزية) *
                  </label>
                  <input
                    id="author"
                    type="text"
                    className={`input-field ${errors.author ? 'input-error' : ''}`}
                    placeholder="Author Name"
                    {...register('author', {
                      required: 'اسم المؤلف مطلوب'
                    })}
                  />
                  {errors.author && (
                    <p className="form-error">{errors.author.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="author_arabic" className="form-label">
                    المؤلف (بالعربية)
                  </label>
                  <input
                    id="author_arabic"
                    type="text"
                    className="input-field"
                    placeholder="اسم المؤلف"
                    {...register('author_arabic')}
                  />
                </div>

                <div>
                  <label htmlFor="isbn" className="form-label">
                    رقم ISBN (اختياري)
                  </label>
                  <input
                    id="isbn"
                    type="text"
                    className="input-field"
                    placeholder="978-977-416-123-4"
                    {...register('isbn')}
                  />
                </div>

                <div>
                  <label htmlFor="language" className="form-label">
                    لغة الكتاب *
                  </label>
                  <select
                    id="language"
                    className="input-field"
                    {...register('language')}
                  >
                    <option value="arabic">العربية</option>
                    <option value="english">الإنجليزية</option>
                    <option value="both">ثنائية اللغة</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category and Details */}
            <div>
              <h2 className="text-xl font-semibold text-primary-dark mb-6">التصنيف والتفاصيل</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="form-label">
                    التصنيف (بالإنجليزية)
                  </label>
                  <input
                    id="category"
                    type="text"
                    className="input-field"
                    placeholder="Fiction, Poetry, History..."
                    {...register('category')}
                  />
                </div>

                <div>
                  <label htmlFor="category_arabic" className="form-label">
                    التصنيف (بالعربية)
                  </label>
                  <input
                    id="category_arabic"
                    type="text"
                    className="input-field"
                    placeholder="رواية، شعر، تاريخ..."
                    {...register('category_arabic')}
                  />
                </div>

                <div>
                  <label htmlFor="publisher" className="form-label">
                    الناشر (بالإنجليزية)
                  </label>
                  <input
                    id="publisher"
                    type="text"
                    className="input-field"
                    placeholder="Publisher Name"
                    {...register('publisher')}
                  />
                </div>

                <div>
                  <label htmlFor="publisher_arabic" className="form-label">
                    الناشر (بالعربية)
                  </label>
                  <input
                    id="publisher_arabic"
                    type="text"
                    className="input-field"
                    placeholder="اسم الناشر"
                    {...register('publisher_arabic')}
                  />
                </div>

                <div>
                  <label htmlFor="publication_year" className="form-label">
                    سنة النشر
                  </label>
                  <input
                    id="publication_year"
                    type="number"
                    min="1000"
                    max={new Date().getFullYear() + 1}
                    className="input-field"
                    placeholder="2023"
                    {...register('publication_year')}
                  />
                </div>

                <div>
                  <label htmlFor="pages" className="form-label">
                    عدد الصفحات
                  </label>
                  <input
                    id="pages"
                    type="number"
                    min="1"
                    className="input-field"
                    placeholder="320"
                    {...register('pages')}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-primary-dark mb-6">الوصف</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="description" className="form-label">
                    وصف الكتاب (بالإنجليزية)
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className="input-field"
                    placeholder="Book description..."
                    {...register('description')}
                  />
                </div>

                <div>
                  <label htmlFor="description_arabic" className="form-label">
                    وصف الكتاب (بالعربية)
                  </label>
                  <textarea
                    id="description_arabic"
                    rows={4}
                    className="input-field"
                    placeholder="وصف الكتاب..."
                    {...register('description_arabic')}
                  />
                </div>
              </div>
            </div>

            {/* Pricing and Stock */}
            <div>
              <h2 className="text-xl font-semibold text-primary-dark mb-6">السعر والمخزون</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="price" className="form-label">
                    السعر (دينار عراقي) *
                  </label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    className={`input-field ${errors.price ? 'input-error' : ''}`}
                    placeholder="25000"
                    {...register('price', {
                      required: 'السعر مطلوب',
                      min: {
                        value: 0,
                        message: 'السعر يجب أن يكون أكبر من الصفر'
                      }
                    })}
                  />
                  {errors.price && (
                    <p className="form-error">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="original_price" className="form-label">
                    السعر الأصلي (اختياري)
                  </label>
                  <input
                    id="original_price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="input-field"
                    placeholder="30000"
                    {...register('original_price')}
                  />
                </div>

                <div>
                  <label htmlFor="stock_quantity" className="form-label">
                    الكمية المتوفرة *
                  </label>
                  <input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    className={`input-field ${errors.stock_quantity ? 'input-error' : ''}`}
                    placeholder="10"
                    {...register('stock_quantity', {
                      required: 'الكمية مطلوبة',
                      min: {
                        value: 0,
                        message: 'الكمية يجب أن تكون صفر أو أكثر'
                      }
                    })}
                  />
                  {errors.stock_quantity && (
                    <p className="form-error">{errors.stock_quantity.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 rtl:space-x-reverse">
              <button
                type="button"
                onClick={() => navigate('/bookstore/books')}
                className="btn-outline"
              >
                إلغاء
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex items-center space-x-2 rtl:space-x-reverse"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    <span>جاري الإضافة...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    <span>إضافة الكتاب</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddBookPage
