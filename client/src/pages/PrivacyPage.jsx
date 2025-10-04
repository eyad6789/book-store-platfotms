import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react'

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary-dark" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary-dark mb-4">
            سياسة الخصوصية
          </h1>
          <p className="text-lg text-gray-600">
            نحن في المتنبي نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية
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
              تصف سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات الشخصية التي تقدمها عند استخدام منصة المتنبي. نحن ملتزمون بضمان حماية خصوصيتك وأمان معلوماتك الشخصية.
            </p>
          </section>

          {/* Data Collection */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <Database className="w-6 h-6 text-primary-gold" />
              <h2 className="text-2xl font-bold text-primary-dark">المعلومات التي نجمعها</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg text-primary-brown mb-2">المعلومات الشخصية:</h3>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>الاسم الكامل</li>
                  <li>عنوان البريد الإلكتروني</li>
                  <li>رقم الهاتف</li>
                  <li>عنوان التوصيل</li>
                  <li>معلومات الدفع (مشفرة)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-primary-brown mb-2">معلومات الاستخدام:</h3>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>سجل الطلبات والمشتريات</li>
                  <li>سجل التصفح والكتب المفضلة</li>
                  <li>التفاعل مع المكتبات والكتب</li>
                  <li>البيانات التقنية (عنوان IP، نوع المتصفح)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Data */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <Eye className="w-6 h-6 text-primary-gold" />
              <h2 className="text-2xl font-bold text-primary-dark">كيف نستخدم معلوماتك</h2>
            </div>
            <ul className="list-disc list-inside space-y-3 text-gray-700 mr-4">
              <li>معالجة الطلبات وتسليم الكتب</li>
              <li>التواصل معك بشأن طلباتك والعروض الخاصة</li>
              <li>تحسين تجربة المستخدم وتخصيص المحتوى</li>
              <li>تحليل الاستخدام لتطوير خدماتنا</li>
              <li>منع الاحتيال وضمان أمان المنصة</li>
              <li>الامتثال للمتطلبات القانونية</li>
            </ul>
          </section>

          {/* Data Protection */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <Lock className="w-6 h-6 text-primary-gold" />
              <h2 className="text-2xl font-bold text-primary-dark">حماية البيانات</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                نطبق إجراءات أمنية صارمة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الإفصاح أو الإتلاف:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>تشفير SSL/TLS لجميع عمليات نقل البيانات</li>
                <li>تشفير معلومات الدفع والبيانات الحساسة</li>
                <li>الوصول المحدود للموظفين المصرح لهم فقط</li>
                <li>مراقبة أمنية مستمرة للأنظمة</li>
                <li>نسخ احتياطي منتظم للبيانات</li>
              </ul>
            </div>
          </section>

          {/* User Rights */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <UserCheck className="w-6 h-6 text-primary-gold" />
              <h2 className="text-2xl font-bold text-primary-dark">حقوقك</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed mb-3">لديك الحق في:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>الوصول إلى معلوماتك الشخصية وتحديثها</li>
                <li>طلب حذف بياناتك الشخصية</li>
                <li>الاعتراض على معالجة بياناتك</li>
                <li>طلب نقل بياناتك</li>
                <li>سحب موافقتك في أي وقت</li>
                <li>تقديم شكوى للسلطات المختصة</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <div className="bg-amber-50 rounded-lg p-6 border-r-4 border-primary-gold">
              <h3 className="font-semibold text-lg text-primary-dark mb-3">ملفات تعريف الارتباط (Cookies)</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                نستخدم ملفات تعريف الارتباط لتحسين تجربتك على الموقع، بما في ذلك:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mr-4">
                <li>حفظ تفضيلاتك وإعداداتك</li>
                <li>تذكر سلة التسوق الخاصة بك</li>
                <li>تحليل استخدام الموقع</li>
                <li>تقديم محتوى مخصص</li>
              </ul>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-primary-dark mb-4">مشاركة البيانات</h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك مع:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>المكتبات الشريكة لمعالجة طلباتك</li>
                <li>شركات الشحن لتوصيل الكتب</li>
                <li>معالجي الدفع (بشكل آمن ومشفر)</li>
                <li>مقدمي الخدمات التقنية (بموجب اتفاقيات السرية)</li>
              </ul>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-primary-dark mb-4">خصوصية الأطفال</h2>
            <p className="text-gray-700 leading-relaxed">
              خدماتنا موجهة للبالغين. لا نجمع عمداً معلومات من الأطفال دون سن 18 عاماً. إذا اكتشفنا أننا جمعنا معلومات من طفل، سنقوم بحذفها فوراً.
            </p>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-bold text-primary-dark mb-4">التحديثات على السياسة</h2>
            <p className="text-gray-700 leading-relaxed">
              قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنقوم بإعلامك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار بارز على موقعنا. يُنصح بمراجعة هذه الصفحة بشكل دوري.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-gold rounded-lg p-6">
            <h2 className="text-2xl font-bold text-primary-dark mb-4">تواصل معنا</h2>
            <p className="text-gray-800 leading-relaxed mb-4">
              إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية، يرجى التواصل معنا:
            </p>
            <div className="space-y-2 text-gray-800">
              <p><strong>البريد الإلكتروني:</strong> <span className="english-text" dir="ltr">privacy@almutanabbi.com</span></p>
              <p><strong>الهاتف:</strong> <span className="english-text" dir="ltr">+964 770 123 4567</span></p>
              <p><strong>العنوان:</strong> شارع المتنبي، بغداد، العراق</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

export default PrivacyPage
