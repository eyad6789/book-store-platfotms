import { HelpCircle, MessageCircle, Phone, Mail, Clock, Search, BookOpen, ShoppingCart, CreditCard, Package } from 'lucide-react'
import { useState } from 'react'

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const faqs = [
    {
      category: 'orders',
      question: 'كيف يمكنني تتبع طلبي؟',
      answer: 'يمكنك تتبع طلبك من خلال صفحة "طلباتي" في حسابك. ستجد رابط التتبع مع كل طلب. كما سنرسل لك تحديثات عبر البريد الإلكتروني والرسائل النصية.'
    },
    {
      category: 'orders',
      question: 'كم يستغرق توصيل الطلب؟',
      answer: 'عادة ما يستغرق التوصيل من 3-7 أيام عمل داخل بغداد، و5-10 أيام للمحافظات الأخرى. المدة قد تختلف حسب موقعك والمكتبة البائعة.'
    },
    {
      category: 'orders',
      question: 'هل يمكنني إلغاء طلبي؟',
      answer: 'نعم، يمكنك إلغاء الطلب خلال 24 ساعة من تقديمه قبل شحنه. بعد الشحن، يمكنك استخدام سياسة الإرجاع.'
    },
    {
      category: 'payment',
      question: 'ما هي طرق الدفع المتاحة؟',
      answer: 'نقبل الدفع عند الاستلام، بطاقات الائتمان (Visa, Mastercard)، والمحافظ الإلكترونية المحلية.'
    },
    {
      category: 'payment',
      question: 'هل الدفع آمن؟',
      answer: 'نعم، جميع المعاملات المالية مشفرة باستخدام تقنية SSL. لا نحتفظ بمعلومات بطاقتك الائتمانية على خوادمنا.'
    },
    {
      category: 'payment',
      question: 'متى يتم خصم المبلغ؟',
      answer: 'في حالة الدفع الإلكتروني، يتم الخصم فوراً عند تأكيد الطلب. للدفع عند الاستلام، تدفع عند استلام الكتب.'
    },
    {
      category: 'returns',
      question: 'ما هي سياسة الإرجاع؟',
      answer: 'يمكنك إرجاع الكتب خلال 7 أيام من الاستلام إذا كانت في حالتها الأصلية. نقوم بإعادة المبلغ كاملاً أو استبدال الكتاب.'
    },
    {
      category: 'returns',
      question: 'كيف أقوم بإرجاع كتاب؟',
      answer: 'اذهب إلى "طلباتي"، اختر الطلب، واضغط على "طلب إرجاع". سيتواصل معك فريقنا لترتيب الاستلام.'
    },
    {
      category: 'returns',
      question: 'متى أحصل على استرداد المبلغ؟',
      answer: 'بعد استلام وفحص الكتاب المرتجع، سنقوم بإعادة المبلغ خلال 5-7 أيام عمل إلى نفس طريقة الدفع.'
    },
    {
      category: 'account',
      question: 'كيف أقوم بإنشاء حساب؟',
      answer: 'اضغط على "تسجيل" في أعلى الصفحة، أدخل معلوماتك الأساسية، وستتلقى بريداً إلكترونياً للتأكيد.'
    },
    {
      category: 'account',
      question: 'نسيت كلمة المرور',
      answer: 'اضغط على "نسيت كلمة المرور" في صفحة تسجيل الدخول، أدخل بريدك الإلكتروني، وسنرسل لك رابط إعادة تعيين.'
    },
    {
      category: 'account',
      question: 'كيف أحدث معلومات حسابي؟',
      answer: 'اذهب إلى "الملف الشخصي" في حسابك، يمكنك تحديث الاسم، العنوان، رقم الهاتف، وكلمة المرور.'
    },
    {
      category: 'books',
      question: 'كيف أبحث عن كتاب معين؟',
      answer: 'استخدم شريط البحث في أعلى الصفحة، أو تصفح حسب الفئة، المؤلف، أو المكتبة. يمكنك أيضاً استخدام الفلاتر المتقدمة.'
    },
    {
      category: 'books',
      question: 'هل جميع الكتب متوفرة؟',
      answer: 'نعرض فقط الكتب المتوفرة حالياً. بعض الكتب النادرة قد تنفد بسرعة. يمكنك إضافتها لقائمة الرغبات لتلقي إشعار عند توفرها.'
    },
    {
      category: 'books',
      question: 'هل يمكنني طلب كتاب غير متوفر؟',
      answer: 'نعم، استخدم خاصية "اطلب هذا الكتاب" وسنحاول توفيره من خلال شبكة مكتباتنا.'
    },
    {
      category: 'bookstores',
      question: 'كيف أصبح مكتبة شريكة؟',
      answer: 'اذهب إلى "انضم كمكتبة" في أسفل الصفحة، املأ نموذج التسجيل، وسيتواصل معك فريقنا لإتمام العملية.'
    },
    {
      category: 'bookstores',
      question: 'هل هناك رسوم للانضمام كمكتبة؟',
      answer: 'لا، الانضمام مجاني. نأخذ عمولة صغيرة فقط على المبيعات المحققة من خلال المنصة.'
    }
  ]

  const categories = [
    { id: 'all', name: 'الكل', icon: HelpCircle },
    { id: 'orders', name: 'الطلبات', icon: ShoppingCart },
    { id: 'payment', name: 'الدفع', icon: CreditCard },
    { id: 'returns', name: 'الإرجاع', icon: Package },
    { id: 'account', name: 'الحساب', icon: MessageCircle },
    { id: 'books', name: 'الكتب', icon: BookOpen },
    { id: 'bookstores', name: 'المكتبات', icon: HelpCircle }
  ]

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const matchesSearch = searchQuery === '' || 
      faq.question.includes(searchQuery) || 
      faq.answer.includes(searchQuery)
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-primary-dark" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary-dark mb-4">
            المساعدة والدعم
          </h1>
          <p className="text-lg text-gray-600">
            كيف يمكننا مساعدتك اليوم؟
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث عن إجابة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 pl-4 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-gold"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg transition-colors ${
                    activeCategory === category.id
                      ? 'bg-primary-gold text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-primary-dark mb-6">الأسئلة الشائعة</h2>
          <div className="space-y-6">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                  <h3 className="text-lg font-semibold text-primary-brown mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                لم نجد إجابات مطابقة لبحثك. جرب كلمات مختلفة أو تواصل معنا مباشرة.
              </p>
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Live Chat */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-primary-dark mb-2">الدردشة المباشرة</h3>
            <p className="text-gray-600 text-sm mb-4">
              تحدث مع فريق الدعم مباشرة
            </p>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
              ابدأ المحادثة
            </button>
          </div>

          {/* Phone */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-primary-dark mb-2">اتصل بنا</h3>
            <p className="text-gray-600 text-sm mb-4">
              متوفرون من السبت إلى الخميس
              <br />
              <span className="text-xs">9 صباحاً - 6 مساءً</span>
            </p>
            <a 
              href="tel:+9647701234567" 
              className="block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors english-text"
              dir="ltr"
            >
              +964 770 123 4567
            </a>
          </div>

          {/* Email */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-primary-dark mb-2">راسلنا</h3>
            <p className="text-gray-600 text-sm mb-4">
              سنرد عليك خلال 24 ساعة
            </p>
            <a 
              href="mailto:support@almutanabbi.com" 
              className="block w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors english-text"
              dir="ltr"
            >
              support@almutanabbi.com
            </a>
          </div>

        </div>

        {/* Business Hours */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse mb-4">
            <Clock className="w-6 h-6 text-primary-gold" />
            <h3 className="text-xl font-bold text-primary-dark">ساعات العمل</h3>
          </div>
          <div className="text-center text-gray-700 space-y-2">
            <p><strong>السبت - الخميس:</strong> 9:00 صباحاً - 6:00 مساءً</p>
            <p><strong>الجمعة:</strong> مغلق</p>
            <p className="text-sm text-gray-500 mt-4">
              * جميع الأوقات بتوقيت بغداد (GMT+3)
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default HelpPage
