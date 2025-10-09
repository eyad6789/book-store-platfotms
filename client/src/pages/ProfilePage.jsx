import { useState, useRef } from 'react'
import { User, Mail, Phone, Lock, Camera } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../utils/api'
import { getImageUrl } from '../utils/helpers'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || null)
  const avatarInputRef = useRef(null)

  const handleAvatarClick = () => {
    avatarInputRef.current?.click()
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن لا يتجاوز 5MB')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('يرجى اختيار صورة بصيغة JPG أو PNG أو WebP')
      return
    }

    try {
      setUploadingAvatar(true)
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await authAPI.uploadAvatar(formData)

      // Update local state
      setAvatarUrl(response.data.avatar_url)

      // Update user in localStorage
      const updatedUser = response.data.user
      localStorage.setItem('user', JSON.stringify(updatedUser))

      toast.success('تم تحديث الصورة الشخصية بنجاح')

      // Refresh page to update user context
      window.location.reload()
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('فشل في تحميل الصورة الشخصية')
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Profile Picture with Upload */}
              <div className="relative group">
                <div className="w-20 h-20 bg-primary-brown rounded-full flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={getImageUrl(avatarUrl)}
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>

                {/* Hover Overlay with Camera Icon */}
                <div
                  onClick={handleAvatarClick}
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploadingAvatar ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-primary-dark">{user.full_name}</h1>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {user.role === 'customer' ? 'عميل' :
                      user.role === 'bookstore_owner' ? 'صاحب مكتبة' :
                        user.role === 'admin' ? 'مدير' : user.role}
                  </span>
                  <button
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                    className="text-xs text-primary-brown hover:text-primary-dark transition-colors disabled:opacity-50"
                  >
                    {uploadingAvatar ? 'جاري الرفع...' : 'تغيير الصورة'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 rtl:space-x-reverse px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                    ? 'border-primary-brown text-primary-brown'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                المعلومات الشخصية
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'password'
                    ? 'border-primary-brown text-primary-brown'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                تغيير كلمة المرور
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-lg font-semibold text-primary-dark mb-6">المعلومات الشخصية</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">الاسم الكامل</label>
                      <div className="relative">
                        <input
                          type="text"
                          defaultValue={user.full_name}
                          className="input-field pl-10"
                        />
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">البريد الإلكتروني</label>
                      <div className="relative">
                        <input
                          type="email"
                          defaultValue={user.email}
                          className="input-field pl-10"
                          disabled
                        />
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">رقم الهاتف</label>
                      <div className="relative">
                        <input
                          type="tel"
                          defaultValue={user.phone || ''}
                          className="input-field pl-10"
                          placeholder="+964 770 123 4567"
                        />
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary">
                      حفظ التغييرات
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div>
                <h2 className="text-lg font-semibold text-primary-dark mb-6">تغيير كلمة المرور</h2>
                <form className="space-y-6 max-w-md">
                  <div>
                    <label className="form-label">كلمة المرور الحالية</label>
                    <div className="relative">
                      <input
                        type="password"
                        className="input-field pl-10"
                        placeholder="أدخل كلمة المرور الحالية"
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">كلمة المرور الجديدة</label>
                    <div className="relative">
                      <input
                        type="password"
                        className="input-field pl-10"
                        placeholder="أدخل كلمة المرور الجديدة"
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">تأكيد كلمة المرور الجديدة</label>
                    <div className="relative">
                      <input
                        type="password"
                        className="input-field pl-10"
                        placeholder="أعد إدخال كلمة المرور الجديدة"
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    تغيير كلمة المرور
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
