import { RotateCcw, Calendar, CheckCircle, XCircle, AlertTriangle, DollarSign } from 'lucide-react'

const ReturnsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center">
              <RotateCcw className="w-8 h-8 text-primary-dark" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary-dark mb-4">
            الإرجاع والاستبدال
          </h1>
          <p className="text-lg text-gray-600">
            رضاك هو أولويتنا - سياسة إرجاع سهلة وواضحة
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          
          {/* Return Period */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <Calendar className="w-6 h-6 text-primary-gold" />
              <h2 className="text-2xl font-bold text-primary-dark">مدة الإرجاع</h2>
            </div>
            <div className="bg-green-50 rounded-lg p-6 border-r-4 border-green-500">
              <p className="text-lg text-gray-800 leading-relaxed">
                يمكنك إرجاع أو استبدال الكتب خلال <strong className="text-green-700">7 أيام</strong> من تاريخ الاستلام دون الحاجة لتقديم سبب.
              </p>
            </div>
          </section>

          {/* Return Conditions */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <CheckCircle className="w-6 h-6 text-primary-gold" />
              <h2 className="text-2xl font-bold text-primary-dark">شروط الإرجاع</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                لكي يكون الكتاب قابلاً للإرجاع، يجب أن يستوفي الشروط التالية:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 rtl:space-x-reverse bg-gray-50 p-4 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-primary-brown mb-1">الحالة الأصلية</h3>
                    <p className="text-sm text-gray-600">الكتاب يجب أن يكون في حالته الأصلية كما استلمته</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 rtl:space-x-reverse bg-gray-50 p-4 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-primary-brown mb-1">غير مستخدم</h3>
                    <p className="text-sm text-gray-600">لم يتم القراءة منه أو الكتابة عليه</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 rtl:space-x-reverse bg-gray-50 p-4 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-primary-brown mb-1">التغليف الأصلي</h3>
                    <p className="text-sm text-gray-600">مع الغلاف البلاستيكي والعلامات الأصلية</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 rtl:space-x-reverse bg-gray-50 p-4 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-primary-brown mb-1">الفاتورة</h3>
                    <p className="text-sm text-gray-600">إرفاق نسخة من فاتورة الشراء</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Non-Returnable Items */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-primary-dark">منتجات غير قابلة للإرجاع</h2>
            </div>
            <div className="bg-red-50 rounded-lg p-6 border-r-4 border-red-500">
              <p className="text-gray-700 leading-relaxed mb-3">
                بعض الكتب لا يمكن إرجاعها لأسباب صحية أو قانونية:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
                <li>الكتب الرقمية والتنزيلات الإلكترونية</li>
                <li>الكتب المخفضة بنسبة 50% أو أكثر (تخفيضات نهائية)</li>
                <li>الكتب المطبوعة حسب الطلب</li>
                <li>الكتب التي تم فتح تغليفها البلاستيكي (للمجلات والدوريات)</li>
                <li>الكتب التالفة أو المستخدمة من قبل العميل</li>
              </ul>
            </div>
          </section>

          {/* How to Return */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <RotateCcw className="w-6 h-6 text-primary-gold" />
              <h2 className="text-2xl font-bold text-primary-dark">كيفية الإرجاع</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                اتبع هذه الخطوات السهلة لإرجاع كتابك:
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-gold rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary-brown mb-1">تسجيل الدخول</h3>
                    <p className="text-gray-700">اذهب إلى "طلباتي" في حسابك واختر الطلب الذي تريد إرجاعه</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-gold rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary-brown mb-1">طلب الإرجاع</h3>
                    <p className="text-gray-700">اضغط على "طلب إرجاع" واختر الكتب التي تريد إرجاعها وحدد السبب</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-gold rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary-brown mb-1">التأكيد</h3>
                    <p className="text-gray-700">ستتلقى بريداً إلكترونياً بتأكيد طلب الإرجاع وتعليمات الشحن</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-gold rounded-full flex items-center justify-center text-white font-bold">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary-brown mb-1">تغليف الكتب</h3>
                    <p className="text-gray-700">أعد تغليف الكتب بعناية مع الفاتورة والملحقات</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-gold rounded-full flex items-center justify-center text-white font-bold">
                    5
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary-brown mb-1">التسليم</h3>
                    <p className="text-gray-700">سيأتي مندوب لاستلام الطرد من عنوانك (مجاناً) حسب الموعد المحدد</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-gold rounded-full flex items-center justify-center text-white font-bold">
                    6
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary-brown mb-1">المراجعة والاسترداد</h3>
                    <p className="text-gray-700">سنفحص الكتب وإعادة المبلغ خلال 5-7 أيام عمل</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Refund Policy */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <DollarSign className="w-6 h-6 text-primary-gold" />
              <h2 className="text-2xl font-bold text-primary-dark">استرداد الأموال</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg text-primary-brown mb-2">طريقة الاسترداد:</h3>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li><strong>الدفع الإلكتروني:</strong> سيتم إعادة المبلغ لنفس طريقة الدفع (بطاقة، محفظة إلكترونية)</li>
                  <li><strong>الدفع عند الاستلام:</strong> سيتم التحويل لحسابك البنكي أو محفظتك الإلكترونية</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-primary-brown mb-2">مدة الاسترداد:</h3>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>5-7 أيام عمل بعد استلامنا وفحص الكتب</li>
                  <li>قد تأخذ البنوك 3-5 أيام إضافية لمعالجة الاسترداد</li>
                  <li>ستتلقى بريداً إلكترونياً عند إتمام الاسترداد</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-primary-brown mb-2">المبلغ المسترد:</h3>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>سعر الكتاب كاملاً</li>
                  <li>تكلفة الشحن الأصلية (إذا كان العيب من طرفنا)</li>
                  <li>استلام الإرجاع مجاني - لا تكاليف عليك</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Exchange */}
          <section>
            <h2 className="text-2xl font-bold text-primary-dark mb-4">الاستبدال</h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                يمكنك استبدال الكتاب بكتاب آخر بنفس القيمة أو أكثر:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>اختر "استبدال" بدلاً من "إرجاع" عند تقديم الطلب</li>
                <li>حدد الكتاب البديل الذي تريده</li>
                <li>إذا كان الكتاب البديل أغلى، ادفع الفرق</li>
                <li>إذا كان أرخص، سنعيد الفرق لك</li>
                <li>الاستبدال أسرع من الإرجاع (3-5 أيام)</li>
              </ul>
            </div>
          </section>

          {/* Damaged or Wrong Items */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-primary-dark">كتب تالفة أو خاطئة</h2>
            </div>
            <div className="bg-orange-50 rounded-lg p-6 border-r-4 border-orange-500">
              <p className="text-gray-700 leading-relaxed mb-3">
                إذا استلمت كتاباً تالفاً أو خاطئاً:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
                <li>لا تقبل الطرد إذا كان تالفاً بشكل واضح</li>
                <li>التقط صوراً للعيب أو الخطأ فوراً</li>
                <li>تواصل معنا خلال 48 ساعة</li>
                <li>سنستبدل الكتاب مجاناً أو نعيد المبلغ كاملاً</li>
                <li>لن تتحمل أي تكاليف شحن</li>
                <li>سنعطيك الأولوية في المعالجة</li>
              </ul>
            </div>
          </section>

          {/* Important Notes */}
          <section className="bg-blue-50 rounded-lg p-6 border-r-4 border-blue-500">
            <h2 className="text-2xl font-bold text-primary-dark mb-4">ملاحظات هامة</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• لا يمكن إرجاع الكتب بعد مرور 7 أيام من الاستلام</li>
              <li>• الكتب المرتجعة التي لا تستوفي الشروط سيتم إرجاعها لك</li>
              <li>• نحتفظ بالحق في رفض الإرجاع إذا كان هناك إساءة استخدام واضحة</li>
              <li>• تأكد من حصولك على إيصال استلام من المندوب</li>
              <li>• الإرجاعات والاستبدالات متاحة فقط للطلبات المشتراة عبر منصة المتنبي</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="bg-gradient-gold rounded-lg p-6">
            <h2 className="text-2xl font-bold text-primary-dark mb-4">استفسارات الإرجاع</h2>
            <p className="text-gray-800 leading-relaxed mb-4">
              لأي أسئلة حول سياسة الإرجاع والاستبدال:
            </p>
            <div className="space-y-2 text-gray-800">
              <p><strong>البريد الإلكتروني:</strong> <span className="english-text" dir="ltr">returns@almutanabbi.com</span></p>
              <p><strong>الهاتف:</strong> <span className="english-text" dir="ltr">+964 770 123 4567</span></p>
              <p><strong>ساعات العمل:</strong> السبت - الخميس، 9 صباحاً - 6 مساءً</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

export default ReturnsPage
