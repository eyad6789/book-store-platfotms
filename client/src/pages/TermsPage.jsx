import { FileText, AlertCircle, ShieldCheck, Users, BookOpen, Scale } from 'lucide-react'

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center">
              <Scale className="w-8 h-8 text-primary-dark" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary-dark mb-4">
            الشروط والأحكام
          </h1>
          <p className="text-lg text-gray-600">
            شروط استخدام منصة المتنبي للكتب
          </p>
          <p className="text-sm text-gray-500 mt-2">
            آخر تحديث: {new Date().toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <FileText className="w-6 h-6 text-primary-gold" />
              <h2 className="text-2xl font-bold text-primary-dark">مقدمة</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              مرحباً بك في منصة المتنبي. من خلال استخدام موقعنا وخدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية قبل استخدام المنصة.
            </p>
          </section>

          {/* Acceptance */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <ShieldCheck className="w-6 h-6 text-primary-gold" />
              <h2 className="text-2xl font-bold text-primary-dark">قبول الشروط</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                باستخدامك لمنصة المتنبي، فإنك تقر وتوافق على:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>أنك بلغت السن القانونية لإبرام العقود في بلدك</li>
                <li>أن جميع المعلومات التي تقدمها صحيحة ودقيقة</li>
                <li>الالتزام بجميع القوانين واللوائح المعمول بها</li>
                <li>عدم استخدام المنصة لأي أغراض غير قانونية</li>
              </ul>
            </div>
          </section>

          {/* Account Registration */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <Users className="w-6 h-6 text-primary-gold" />
              <h2 className="text-2xl font-bold text-primary-dark">التسجيل والحساب</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg text-primary-brown mb-2">إنشاء الحساب:</h3>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>يجب تقديم معلومات صحيحة وكاملة عند التسجيل</li>
                  <li>أنت مسؤول عن الحفاظ على سرية بيانات حسابك</li>
                  <li>يجب إبلاغنا فوراً عن أي استخدام غير مصرح به لحسابك</li>
                  <li>لا يمكنك نقل حسابك إلى شخص آخر</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-primary-brown mb-2">إنهاء الحساب:</h3>
                <p className="leading-relaxed">
                  نحتفظ بالحق في تعليق أو إنهاء حسابك في حالة انتهاك هذه الشروط أو أي سلوك غير قانوني أو ضار.
                </p>
              </div>
            </div>
          </section>

          {/* Services */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <BookOpen className="w-6 h-6 text-primary-gold" />
              <h2 className="text-2xl font-bold text-primary-dark">الخدمات والطلبات</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg text-primary-brown mb-2">الطلبات:</h3>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>جميع الطلبات تخضع للتوفر والتأكيد</li>
                  <li>نحتفظ بالحق في رفض أو إلغاء أي طلب</li>
                  <li>الأسعار قابلة للتغيير دون إشعار مسبق</li>
                  <li>المكتبات الشريكة مسؤولة عن توفير الكتب</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-primary-brown mb-2">الدفع:</h3>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>الدفع مطلوب وقت تقديم الطلب</li>
                  <li>نقبل طرق الدفع المحددة في صفحة الدفع</li>
                  <li>جميع المعاملات المالية آمنة ومشفرة</li>
                  <li>الأسعار تشمل جميع الضرائب المطبقة</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Shipping & Delivery */}
          <section>
            <h2 className="text-2xl font-bold text-primary-dark mb-4">الشحن والتوصيل</h2>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>نسعى لتوصيل الطلبات في الوقت المحدد، لكننا لا نضمن ذلك</li>
                <li>مواعيد التسليم تقديرية وقد تتأخر بسبب ظروف خارجة عن إرادتنا</li>
                <li>أنت مسؤول عن تقديم عنوان توصيل صحيح وكامل</li>
                <li>تكاليف الشحن محددة عند الطلب وتختلف حسب الموقع</li>
                <li>لمزيد من التفاصيل، راجع <a href="/shipping" className="text-primary-gold hover:underline">سياسة الشحن</a></li>
              </ul>
            </div>
          </section>

          {/* Returns & Refunds */}
          <section>
            <h2 className="text-2xl font-bold text-primary-dark mb-4">الإرجاع والاستبدال</h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                يمكنك إرجاع الكتب خلال 7 أيام من تاريخ الاستلام وفقاً للشروط التالية:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>الكتب يجب أن تكون في حالتها الأصلية دون استخدام</li>
                <li>الغلاف والتغليف يجب أن يكونا سليمين</li>
                <li>إرفاق فاتورة الشراء الأصلية</li>
                <li>بعض الكتب الخاصة قد لا تكون قابلة للإرجاع</li>
                <li>لمزيد من التفاصيل، راجع <a href="/returns" className="text-primary-gold hover:underline">سياسة الإرجاع</a></li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-primary-dark mb-4">الملكية الفكرية</h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                جميع المحتويات على منصة المتنبي، بما في ذلك النصوص والصور والشعارات والتصاميم، محمية بحقوق الملكية الفكرية. يُمنع:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>نسخ أو توزيع أو تعديل أي محتوى دون إذن</li>
                <li>استخدام محتوى الموقع لأغراض تجارية</li>
                <li>إزالة أي علامات تجارية أو حقوق نشر</li>
                <li>الهندسة العكسية لأي جزء من المنصة</li>
              </ul>
            </div>
          </section>

          {/* Prohibited Activities */}
          <section className="bg-red-50 rounded-lg p-6 border-r-4 border-red-500">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-red-900">الأنشطة المحظورة</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">
              يُحظر عليك استخدام المنصة لـ:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
              <li>انتهاك أي قوانين محلية أو دولية</li>
              <li>نشر محتوى ضار أو مسيء أو غير قانوني</li>
              <li>محاولة الوصول غير المصرح به للأنظمة</li>
              <li>التلاعب بالأسعار أو المعلومات</li>
              <li>الاحتيال أو انتحال الشخصية</li>
              <li>إرسال رسائل غير مرغوب فيها (spam)</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-primary-dark mb-4">حدود المسؤولية</h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                المنصة تقدم "كما هي" دون أي ضمانات. نحن غير مسؤولين عن:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام المنصة</li>
                <li>فقدان البيانات أو الأرباح</li>
                <li>انقطاع الخدمة أو الأخطاء التقنية</li>
                <li>محتوى أو منتجات المكتبات الشريكة</li>
                <li>تأخيرات الشحن خارجة عن سيطرتنا</li>
              </ul>
            </div>
          </section>

          {/* Bookstore Partners */}
          <section>
            <h2 className="text-2xl font-bold text-primary-dark mb-4">المكتبات الشريكة</h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                المتنبي منصة تجمع المكتبات العراقية. المكتبات الشريكة مسؤولة عن:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>دقة وصف الكتب وتوفرها</li>
                <li>جودة الكتب المباعة</li>
                <li>معالجة الطلبات وتغليفها</li>
                <li>التعامل مع الاستفسارات المتعلقة بمنتجاتهم</li>
              </ul>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-bold text-primary-dark mb-4">حل النزاعات</h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                في حالة وجود نزاع:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>يجب محاولة حل النزاع ودياً أولاً</li>
                <li>يمكنك التواصل مع خدمة العملاء لدينا</li>
                <li>النزاعات التي لا يمكن حلها ودياً تخضع للقضاء العراقي</li>
                <li>القانون العراقي يحكم هذه الشروط</li>
              </ul>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-primary-dark mb-4">التعديلات على الشروط</h2>
            <p className="text-gray-700 leading-relaxed">
              نحتفظ بالحق في تعديل هذه الشروط في أي وقت. التعديلات الجوهرية سيتم إعلامك بها عبر البريد الإلكتروني أو إشعار على الموقع. استمرارك في استخدام المنصة بعد التعديلات يعني موافقتك على الشروط الجديدة.
            </p>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-2xl font-bold text-primary-dark mb-4">القابلية للفصل</h2>
            <p className="text-gray-700 leading-relaxed">
              إذا تبين أن أي بند من هذه الشروط غير قانوني أو غير صالح، فإن البنود الأخرى تظل سارية المفعول.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-gold rounded-lg p-6">
            <h2 className="text-2xl font-bold text-primary-dark mb-4">تواصل معنا</h2>
            <p className="text-gray-800 leading-relaxed mb-4">
              إذا كان لديك أي أسئلة حول هذه الشروط والأحكام:
            </p>
            <div className="space-y-2 text-gray-800">
              <p><strong>البريد الإلكتروني:</strong> <span className="english-text" dir="ltr">legal@almutanabbi.com</span></p>
              <p><strong>الهاتف:</strong> <span className="english-text" dir="ltr">+964 770 123 4567</span></p>
              <p><strong>العنوان:</strong> شارع المتنبي، بغداد، العراق</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

export default TermsPage
