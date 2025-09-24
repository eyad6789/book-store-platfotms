import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { BookOpen, ArrowLeft } from 'lucide-react'
import { booksAPI } from '../../utils/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const EditBookPage = () => {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset
  } = useForm()

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true)
        const response = await booksAPI.getBook(id)
        const bookData = response.data.book
        setBook(bookData)
        
        // Reset form with book data
        reset({
          title: bookData.title || '',
          title_arabic: bookData.title_arabic || '',
          author: bookData.author || '',
          author_arabic: bookData.author_arabic || '',
          isbn: bookData.isbn || '',
          category: bookData.category || '',
          category_arabic: bookData.category_arabic || '',
          description: bookData.description || '',
          description_arabic: bookData.description_arabic || '',
          price: bookData.price || '',
          original_price: bookData.original_price || '',
          stock_quantity: bookData.stock_quantity || 0,
          language: bookData.language || 'arabic',
          publication_year: bookData.publication_year || '',
          publisher: bookData.publisher || '',
          publisher_arabic: bookData.publisher_arabic || '',
          pages: bookData.pages || '',
          is_active: bookData.is_active !== false
        })
      } catch (error) {
        console.error('Error fetching book:', error)
        toast.error('حدث خطأ في تحميل بيانات الكتاب')
        navigate('/bookstore/books')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchBook()
    }
  }, [id, reset, navigate])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    
    try {
      const response = await booksAPI.updateBook(id, data)
      
      if (response.data) {
        toast.success('تم تحديث الكتاب بنجاح!')
        navigate('/bookstore/books')
      }
    } catch (error) {
      console.error('Update book error:', error)
      const message = error.response?.data?.message || 'حدث خطأ أثناء تحديث الكتاب'
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
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="جاري تحميل بيانات الكتاب..." />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-600 mb-2">الكتاب غير موجود</h1>
          <p className="text-gray-500">لم يتم العثور على الكتاب المطلوب</p>
        </div>
      </div>
    )
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
            تعديل الكتاب
          </h1>
          <p className="text-gray-600">
            {book.title_arabic || book.title}
          </p>
        </div>

        {/* Form - Same structure as AddBookPage but with pre-filled data */}
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
                    {...register('author_arabic')}
                  />
                </div>

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
                  <label htmlFor="stock_quantity" className="form-label">
                    الكمية المتوفرة *
                  </label>
                  <input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    className={`input-field ${errors.stock_quantity ? 'input-error' : ''}`}
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

            {/* Status */}
            <div>
              <h2 className="text-xl font-semibold text-primary-dark mb-6">حالة الكتاب</h2>
              
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  id="is_active"
                  type="checkbox"
                  className="h-4 w-4 text-primary-brown focus:ring-primary-brown border-gray-300 rounded"
                  {...register('is_active')}
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  الكتاب نشط ومتاح للبيع
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
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
                disabled={isSubmitting}
                className="btn-primary flex items-center space-x-2 rtl:space-x-reverse"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    <span>جاري التحديث...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    <span>حفظ التغييرات</span>
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

export default EditBookPage
