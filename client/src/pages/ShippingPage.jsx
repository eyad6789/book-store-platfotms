import { Truck, MapPin, Clock, DollarSign, Package, CheckCircle, AlertCircle } from 'lucide-react'

const ShippingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center">
              <Truck className="w-8 h-8 text-primary-dark" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary-dark mb-4">
            الشحن والتوصيل
          </h1>
          <p className="text-lg text-gray-600">
            نوصل الكتب إلى باب منزلك بكل سهولة
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          
          {/* Delivery Areas */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <MapPin className="w-6 h-6 text-primary-gold" />
              <h2 className="text-2xl font-bold text-primary-dark">مناطق التوصيل</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              نوصل إلى جميع أنحاء العراق:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border-r-4 border-green-500">
                <h3 className="font-semibold text-lg text-green-900 mb-2">داخل بغداد</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• التوصيل: 3-5 أيام عمل</li>
                  <li>• تكلفة الشحن: 2,000 دينار</li>
                  <li>• مجاناً للطلبات فوق 50,000 دينار</li>
                </ul>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border-r-4 border-blue-500">
                <h3 className="font-semibold text-lg text-blue-900 mb-2">المحافظات</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• التوصيل: 5-10 أيام عمل</li>
                  <li>• تكلفة الشحن: 5,000 دينار</li>
                  <li>• مجاناً للطلبات فوق 75,000 دينار</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Delivery Time */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <Clock className="w-6 h-6 text-primary-gold" />
              <h2 className="text-2xl font-bold text-primary-dark">أوقات التوصيل</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                نسعى لتوصيل طلبك في أسرع وقت ممكن. المدة تعتمد على:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>موقعك الجغرافي</li>
                <li>توفر الكتب في المكتبة الشريكة</li>
                <li>وقت تأكيد الطلب</li>
                <li>الظروف الجوية وحالة الطرق</li>
              </ul>
              <div className="bg-amber-50 rounded-lg p-4 border-r-4 border-amber-500 mt-4">
                <p className="text-gray-700">
                  <strong>ملاحظة:</strong> الطلبات المؤكدة قبل الساعة 12 ظهراً تُعالج في نفس اليوم. الطلبات بعد ذلك تُعالج في اليوم التالي.
                </p>
              </div>
            </div>
          </section>

          {/* Shipping Cost */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <DollarSign className="w-6 h-6 text-primary-gold" />
              <h2 className="text-2xl font-bold text-primary-dark">تكلفة الشحن</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-dark text-white">
                  <tr>
                    <th className="px-4 py-3 text-right">المنطقة</th>
                    <th className="px-4 py-3 text-right">المدة</th>
                    <th className="px-4 py-3 text-right">التكلفة</th>
                    <th className="px-4 py-3 text-right">شحن مجاني</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b">
                    <td className="px-4 py-3">بغداد - الرصافة</td>
                    <td className="px-4 py-3">3-4 أيام</td>
                    <td className="px-4 py-3">2,000 د.ع</td>
                    <td className="px-4 py-3">+50,000 د.ع</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3">بغداد - الكرخ</td>
                    <td className="px-4 py-3">3-4 أيام</td>
                    <td className="px-4 py-3">2,000 د.ع</td>
                    <td className="px-4 py-3">+50,000 د.ع</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3">البصرة، الموصل، أربيل</td>
                    <td className="px-4 py-3">5-7 أيام</td>
                    <td className="px-4 py-3">5,000 د.ع</td>
                    <td className="px-4 py-3">+75,000 د.ع</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3">محافظات أخرى</td>
                    <td className="px-4 py-3">7-10 أيام</td>
                    <td className="px-4 py-3">5,000 د.ع</td>
                    <td className="px-4 py-3">+75,000 د.ع</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Packaging */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <Package className="w-6 h-6 text-primary-gold" />
              <h2 className="text-2xl font-bold text-primary-dark">التغليف</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                نحرص على تغليف كتبك بعناية فائقة لضمان وصولها بحالة ممتازة:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>تغليف كل كتاب بغلاف حماية بلاستيكي</li>
                <li>استخدام صناديق كرتون قوية ومبطنة</li>
                <li>إضافة مواد حماية (bubble wrap) للكتب الثمينة</li>
                <li>ملصق "Handle with Care" على الطرود</li>
                <li>كتيب صغير عن المتنبي وبطاقة شكر شخصية</li>
              </ul>
            </div>
          </section>

          {/* Tracking */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <CheckCircle className="w-6 h-6 text-primary-gold" />
              <h2 className="text-2xl font-bold text-primary-dark">تتبع الشحنة</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                يمكنك تتبع طلبك من خلال:
              </p>
              <ol className="list-decimal list-inside space-y-3 mr-4">
                <li>
                  <strong>صفحة "طلباتي":</strong> ستجد رابط التتبع المباشر مع كل طلب
                </li>
                <li>
                  <strong>البريد الإلكتروني:</strong> سنرسل لك تحديثات عند كل مرحلة:
                  <ul className="list-disc list-inside mr-8 mt-2 space-y-1">
                    <li>تأكيد الطلب</li>
                    <li>جاري التحضير</li>
                    <li>تم الشحن</li>
                    <li>في الطريق للتوصيل</li>
                    <li>تم التسليم</li>
                  </ul>
                </li>
                <li>
                  <strong>الرسائل النصية:</strong> إشعارات فورية على هاتفك
                </li>
              </ol>
            </div>
          </section>

          {/* Delivery Issues */}
          <section>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <AlertCircle className="w-6 h-6 text-primary-gold" />
              <h2 className="text-2xl font-bold text-primary-dark">مشاكل التوصيل</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg text-primary-brown mb-2">إذا لم تستلم طلبك:</h3>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>تحقق من حالة التتبع على الموقع</li>
                  <li>تواصل مع شركة الشحن مباشرة</li>
                  <li>اتصل بخدمة العملاء لدينا</li>
                  <li>لديك 48 ساعة للإبلاغ عن عدم الاستلام</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-primary-brown mb-2">إذا وصل الطرد تالفاً:</h3>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>لا تقبل الطرد إذا كان تالفاً بشكل واضح</li>
                  <li>التقط صوراً للضرر فوراً</li>
                  <li>تواصل معنا خلال 24 ساعة</li>
                  <li>سنستبدل الكتب التالفة مجاناً</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-primary-brown mb-2">عنوان خاطئ:</h3>
                <p className="leading-relaxed">
                  إذا أدخلت عنواناً خاطئاً، يرجى التواصل معنا فوراً. قد نتمكن من تغيير العنوان قبل الشحن. بعد الشحن، قد تطبق رسوم إعادة توجيه.
                </p>
              </div>
            </div>
          </section>

          {/* Special Notes */}
          <section className="bg-blue-50 rounded-lg p-6 border-r-4 border-blue-500">
            <h2 className="text-2xl font-bold text-primary-dark mb-4">ملاحظات هامة</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• يجب أن يكون شخص بالغ متواجد لاستلام الطلب</li>
              <li>• قد يُطلب منك إثبات الهوية عند التسليم</li>
              <li>• للدفع عند الاستلام، يجب دفع المبلغ الكامل نقداً</li>
              <li>• لا نوصل في الأعياد والعطل الرسمية</li>
              <li>• قد تتأخر التوصيلات في الظروف الاستثنائية والطوارئ</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="bg-gradient-gold rounded-lg p-6">
            <h2 className="text-2xl font-bold text-primary-dark mb-4">استفسارات الشحن</h2>
            <p className="text-gray-800 leading-relaxed mb-4">
              لأي أسئلة حول الشحن والتوصيل، يرجى التواصل معنا:
            </p>
            <div className="space-y-2 text-gray-800">
              <p><strong>البريد الإلكتروني:</strong> <span className="english-text" dir="ltr">shipping@almutanabbi.com</span></p>
              <p><strong>الهاتف:</strong> <span className="english-text" dir="ltr">+964 770 123 4567</span></p>
              <p><strong>ساعات العمل:</strong> السبت - الخميس، 9 صباحاً - 6 مساءً</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

export default ShippingPage
