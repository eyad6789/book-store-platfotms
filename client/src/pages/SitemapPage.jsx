import { Link } from 'react-router-dom'
import { BookOpen, Home, ShoppingCart, Users, HelpCircle, FileText, Store, User, Shield } from 'lucide-react'

const SitemapPage = () => {
  const siteStructure = [
    {
      title: 'الصفحات الرئيسية',
      icon: Home,
      links: [
        { name: 'الصفحة الرئيسية', url: '/' },
        { name: 'تصفح الكتب', url: '/books' },
        { name: 'المكتبات الشريكة', url: '/bookstores' },
        { name: 'الكتب المميزة', url: '/books?featured=true' },
      ]
    },
    {
      title: 'الفئات',
      icon: BookOpen,
      links: [
        { name: 'الروايات', url: '/books?category=رواية' },
        { name: 'الشعر', url: '/books?category=شعر' },
        { name: 'التاريخ', url: '/books?category=تاريخ' },
        { name: 'الفلسفة', url: '/books?category=فلسفة' },
        { name: 'العلوم', url: '/books?category=علوم' },
        { name: 'التنمية الذاتية', url: '/books?category=تنمية' },
        { name: 'الأطفال', url: '/books?category=أطفال' },
        { name: 'الدين', url: '/books?category=دين' },
      ]
    },
    {
      title: 'حسابي',
      icon: User,
      links: [
        { name: 'الملف الشخصي', url: '/profile' },
        { name: 'طلباتي', url: '/orders' },
        { name: 'سلة التسوق', url: '/cart' },
        { name: 'قائمة الرغبات', url: '/wishlist' },
        { name: 'العناوين المحفوظة', url: '/addresses' },
      ]
    },
    {
      title: 'التسوق',
      icon: ShoppingCart,
      links: [
        { name: 'إتمام الطلب', url: '/checkout' },
        { name: 'تتبع الطلب', url: '/track-order' },
        { name: 'العروض الخاصة', url: '/offers' },
        { name: 'الخصومات', url: '/discounts' },
      ]
    },
    {
      title: 'خدمة العملاء',
      icon: HelpCircle,
      links: [
        { name: 'المساعدة والدعم', url: '/help' },
        { name: 'الشحن والتوصيل', url: '/shipping' },
        { name: 'الإرجاع والاستبدال', url: '/returns' },
        { name: 'الأسئلة الشائعة', url: '/faq' },
        { name: 'تواصل معنا', url: '/contact' },
      ]
    },
    {
      title: 'للمكتبات',
      icon: Store,
      links: [
        { name: 'انضم كمكتبة', url: '/bookstore/register' },
        { name: 'لوحة تحكم المكتبة', url: '/library/dashboard' },
        { name: 'إدارة الكتب', url: '/library/books' },
        { name: 'الطلبات', url: '/library/orders' },
      ]
    },
    {
      title: 'معلومات عنا',
      icon: Users,
      links: [
        { name: 'من نحن', url: '/about' },
        { name: 'رؤيتنا ورسالتنا', url: '/mission' },
        { name: 'فريق العمل', url: '/team' },
        { name: 'الشراكات', url: '/partnerships' },
        { name: 'الأخبار', url: '/news' },
        { name: 'المدونة', url: '/blog' },
      ]
    },
    {
      title: 'السياسات والشروط',
      icon: Shield,
      links: [
        { name: 'سياسة الخصوصية', url: '/privacy' },
        { name: 'الشروط والأحكام', url: '/terms' },
        { name: 'سياسة الاستخدام', url: '/usage-policy' },
        { name: 'سياسة ملفات تعريف الارتباط', url: '/cookies' },
      ]
    },
    {
      title: 'الحساب',
      icon: FileText,
      links: [
        { name: 'تسجيل الدخول', url: '/auth/login' },
        { name: 'إنشاء حساب', url: '/auth/register' },
        { name: 'استعادة كلمة المرور', url: '/auth/forgot-password' },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary-dark" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary-dark mb-4">
            خريطة الموقع
          </h1>
          <p className="text-lg text-gray-600">
            تصفح جميع صفحات وأقسام منصة المتنبي
          </p>
        </div>

        {/* Sitemap Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {siteStructure.map((section, index) => {
            const Icon = section.icon
            return (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                  <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-dark" />
                  </div>
                  <h2 className="text-xl font-bold text-primary-dark">
                    {section.title}
                  </h2>
                </div>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        to={link.url}
                        className="text-gray-700 hover:text-primary-gold transition-colors flex items-center space-x-2 rtl:space-x-reverse"
                      >
                        <span className="w-1.5 h-1.5 bg-primary-gold rounded-full"></span>
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Bottom Info */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-primary-dark mb-4">معلومات إضافية</h2>
          <div className="grid md:grid-cols-3 gap-6 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg text-primary-brown mb-2">التحديثات</h3>
              <p className="text-sm">
                يتم تحديث خريطة الموقع بانتظام لتعكس أحدث الصفحات والميزات المضافة إلى المنصة.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-primary-brown mb-2">الوصول</h3>
              <p className="text-sm">
                جميع صفحات الموقع مصممة لتكون سهلة الوصول ومتوافقة مع معايير الويب الحديثة.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-primary-brown mb-2">المساعدة</h3>
              <p className="text-sm">
                إذا كنت تواجه صعوبة في العثور على صفحة معينة، يرجى <Link to="/help" className="text-primary-gold hover:underline">التواصل معنا</Link>.
              </p>
            </div>
          </div>
        </div>

        {/* SEO Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            آخر تحديث: {new Date().toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="mt-2">
            منصة المتنبي - مكتبة العراق الرقمية | جميع الحقوق محفوظة © {new Date().getFullYear()}
          </p>
        </div>

      </div>
    </div>
  )
}

export default SitemapPage
