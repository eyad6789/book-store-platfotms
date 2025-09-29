import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, Save, AlertCircle, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function BookForm() {
  const navigate = useNavigate();
  const { bookstoreId, bookId } = useParams();
  const isEditing = !!bookId;
  
  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    author: '',
    author_ar: '',
    isbn: '',
    description: '',
    description_ar: '',
    category_id: '',
    publisher: '',
    publication_year: '',
    language: 'ar',
    page_count: '',
    price: '',
    stock_quantity: '',
    condition: 'new'
  });
  
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchBookData();
    }
  }, [bookId]);
  
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/books/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  const fetchBookData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch(`/api/library/books/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const book = result.book;
        setFormData({
          title: book.title || '',
          title_ar: book.title_ar || '',
          author: book.author || '',
          author_ar: book.author_ar || '',
          isbn: book.isbn || '',
          description: book.description || '',
          description_ar: book.description_ar || '',
          category_id: book.category_id || '',
          publisher: book.publisher || '',
          publication_year: book.publication_year || '',
          language: book.language || 'ar',
          page_count: book.page_count || '',
          price: book.price || '',
          stock_quantity: book.stock_quantity || '',
          condition: book.condition || 'new'
        });
        
        if (book.cover_image_url) {
          setImagePreview(book.cover_image_url);
        }
      } else {
        throw new Error('Failed to fetch book data');
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      setErrors({ submit: 'حدث خطأ في تحميل بيانات الكتاب' });
    } finally {
      setInitialLoading(false);
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'حجم الصورة يجب أن لا يتجاوز 5MB' });
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, image: 'نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG أو PNG أو WebP' });
        return;
      }
      
      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors({ ...errors, image: null });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title_ar.trim()) {
      newErrors.title_ar = 'عنوان الكتاب بالعربية مطلوب';
    }
    
    if (!formData.author_ar.trim()) {
      newErrors.author_ar = 'اسم المؤلف بالعربية مطلوب';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'السعر يجب أن يكون أكبر من صفر';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'التصنيف مطلوب';
    }
    
    if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0) {
      newErrors.stock_quantity = 'الكمية يجب أن لا تكون سالبة';
    }
    
    if (formData.isbn && formData.isbn.length < 10) {
      newErrors.isbn = 'رقم ISBN يجب أن يكون 10 أرقام على الأقل';
    }
    
    if (formData.publication_year && (
      parseInt(formData.publication_year) < 1800 || 
      parseInt(formData.publication_year) > new Date().getFullYear()
    )) {
      newErrors.publication_year = 'سنة النشر غير صحيحة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append image if exists
      if (coverImage) {
        formDataToSend.append('cover_image', coverImage);
      }
      
      const url = isEditing 
        ? `/api/library/books/${bookId}` 
        : `/api/library/${bookstoreId}/books`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'حدث خطأ');
      }
      
      // Success - redirect to books list
      navigate(`/library/${bookstoreId}/books`, {
        state: { 
          message: isEditing ? 'تم تحديث الكتاب بنجاح' : 'تم إضافة الكتاب بنجاح' 
        }
      });
      
    } catch (error) {
      console.error('Error saving book:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="جاري تحميل بيانات الكتاب..." />
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/library/${bookstoreId}/books`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى قائمة الكتب
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'تعديل الكتاب' : 'إضافة كتاب جديد'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditing ? 'قم بتعديل معلومات الكتاب' : 'أضف كتاباً جديداً إلى مكتبتك'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Alert */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{errors.submit}</p>
          </div>
        )}
        
        {/* Cover Image Upload */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">صورة الغلاف</h2>
          <div className="flex items-start gap-6">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-40 h-52 object-cover rounded-lg border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="w-40 h-52 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">
                <Upload className="h-12 w-12 text-gray-400" />
                <span className="text-sm text-gray-500 mt-2 text-center">
                  اضغط لرفع صورة<br />أو اسحب الصورة هنا
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
            <div className="flex-1">
              <div className="text-sm text-gray-600 space-y-1">
                <p>• الحجم الأقصى: 5MB</p>
                <p>• الصيغ المدعومة: JPG, PNG, WebP</p>
                <p>• الأبعاد المفضلة: 600x800 بكسل</p>
                <p>• تأكد من وضوح الصورة وجودتها</p>
              </div>
              {errors.image && (
                <p className="text-sm text-red-600 mt-2">{errors.image}</p>
              )}
              {!imagePreview && (
                <label className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                  اختر صورة
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
        
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">المعلومات الأساسية</h2>
          
          {/* Arabic Title and Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان الكتاب (عربي) *
              </label>
              <input
                type="text"
                name="title_ar"
                value={formData.title_ar}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.title_ar ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="مثال: الأيام"
              />
              {errors.title_ar && (
                <p className="text-sm text-red-600 mt-1">{errors.title_ar}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المؤلف (عربي) *
              </label>
              <input
                type="text"
                name="author_ar"
                value={formData.author_ar}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.author_ar ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="مثال: طه حسين"
              />
              {errors.author_ar && (
                <p className="text-sm text-red-600 mt-1">{errors.author_ar}</p>
              )}
            </div>
          </div>
          
          {/* English Title and Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان الكتاب (إنجليزي)
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Example: The Days"
                dir="ltr"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المؤلف (إنجليزي)
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Example: Taha Hussein"
                dir="ltr"
              />
            </div>
          </div>
          
          {/* ISBN, Category, Language */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ISBN
              </label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.isbn ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="978-0-123456-78-9"
              />
              {errors.isbn && (
                <p className="text-sm text-red-600 mt-1">{errors.isbn}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التصنيف *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.category_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">اختر التصنيف</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_ar || cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-sm text-red-600 mt-1">{errors.category_id}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اللغة
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ar">العربية</option>
                <option value="en">الإنجليزية</option>
                <option value="ku">الكردية</option>
                <option value="other">أخرى</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Publishing Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">معلومات النشر</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الناشر
              </label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: دار الشروق"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سنة النشر
              </label>
              <input
                type="number"
                name="publication_year"
                value={formData.publication_year}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.publication_year ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="2024"
                min="1800"
                max={new Date().getFullYear()}
              />
              {errors.publication_year && (
                <p className="text-sm text-red-600 mt-1">{errors.publication_year}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">الوصف</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف الكتاب (عربي)
              </label>
              <textarea
                name="description_ar"
                value={formData.description_ar}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="اكتب وصفاً تفصيلياً للكتاب، محتواه، وما يميزه..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف الكتاب (إنجليزي)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Write a detailed book description..."
                dir="ltr"
              />
            </div>
          </div>
        </div>
        
        {/* Pricing and Stock */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">السعر والمخزون</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر (د.ع) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="25000"
                min="0"
                step="500"
              />
              {errors.price && (
                <p className="text-sm text-red-600 mt-1">{errors.price}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الكمية المتوفرة *
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.stock_quantity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="10"
                min="0"
              />
              {errors.stock_quantity && (
                <p className="text-sm text-red-600 mt-1">{errors.stock_quantity}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد الصفحات
              </label>
              <input
                type="number"
                name="page_count"
                value={formData.page_count}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="300"
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="new">جديد</option>
                <option value="like_new">شبه جديد</option>
                <option value="good">جيد</option>
                <option value="acceptable">مقبول</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={() => navigate(`/library/${bookstoreId}/books`)}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditing ? 'تحديث الكتاب' : 'إضافة الكتاب'}
              </>
            )}
          </button>
        </div>
        
        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>ملاحظة:</strong> سيتم مراجعة الكتاب من قبل إدارة الموقع قبل نشره. 
            عادة ما تستغرق عملية المراجعة 24-48 ساعة. ستتلقى إشعاراً عند الموافقة على الكتاب أو في حالة الحاجة لتعديلات.
          </p>
        </div>
      </form>
    </div>
  );
}

export default BookForm;
