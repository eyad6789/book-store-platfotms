# المتنبي (Al-Mutanabbi) - دليل الإعداد

## متطلبات النظام

### البرامج المطلوبة
- **Node.js 18+** - [تحميل من هنا](https://nodejs.org/)
- **PostgreSQL 12+** - [تحميل من هنا](https://www.postgresql.org/download/)
- **Git** (اختياري) - لتحميل المشروع

### متطلبات النظام
- **نظام التشغيل**: Windows 10/11, macOS, Linux
- **الذاكرة**: 4GB RAM كحد أدنى
- **مساحة القرص**: 1GB مساحة فارغة

## خطوات الإعداد السريع

### 1. تحميل المشروع
```bash
# إذا كان لديك Git
git clone <repository-url>
cd book-store-platforms

# أو قم بتحميل الملفات وفك الضغط
```

### 2. تشغيل سكريبت الإعداد التلقائي (Windows)
```batch
# تثبيت المتطلبات
install-dependencies.bat

# إعداد قاعدة البيانات
setup-database.bat

# إضافة بيانات تجريبية (اختياري)
seed-database.bat

# تشغيل التطبيق
start-dev.bat
```

### 3. الإعداد اليدوي

#### أ. تثبيت المتطلبات
```bash
# Backend dependencies
cd server
npm install

# Frontend dependencies  
cd ../client
npm install
```

#### ب. إعداد قاعدة البيانات
```bash
# إنشاء قاعدة البيانات
createdb almutanabbi

# تشغيل الترحيلات
cd server
npm run migrate

# إضافة بيانات تجريبية (اختياري)
npm run seed
```

#### ج. إعداد متغيرات البيئة
```bash
# نسخ ملف الإعدادات
cd server
cp .env.example .env

# تعديل الإعدادات حسب نظامك
# DB_HOST=localhost
# DB_PORT=5432  
# DB_NAME=almutanabbi
# DB_USER=postgres
# DB_PASSWORD=your_password
```

#### د. تشغيل التطبيق
```bash
# تشغيل الخادم الخلفي
cd server
npm run dev

# في نافذة طرفية جديدة - تشغيل الواجهة الأمامية
cd client  
npm run dev
```

## الوصول للتطبيق

بعد التشغيل الناجح:

- **الواجهة الأمامية**: http://localhost:3001
- **API الخلفية**: http://localhost:3000
- **صحة الخادم**: http://localhost:3000/api/health

## الحسابات التجريبية

### مدير النظام
- **البريد الإلكتروني**: admin@almutanabbi.com
- **كلمة المرور**: admin123
- **الصلاحيات**: إدارة كاملة للنظام

### صاحب مكتبة
- **البريد الإلكتروني**: owner@almutanabbi.com  
- **كلمة المرور**: owner123
- **المكتبة**: مكتبة بغداد للتراث (معتمدة)
- **الكتب**: 5 كتب تجريبية

### عميل
- **البريد الإلكتروني**: customer@example.com
- **كلمة المرور**: customer123
- **الصلاحيات**: تصفح وشراء الكتب

## الميزات المتاحة

### للعملاء
- ✅ تصفح الكتب والمكتبات
- ✅ البحث والفلترة المتقدمة  
- ✅ إضافة الكتب للسلة
- ✅ إتمام الطلبات
- ✅ تتبع الطلبات
- ✅ إدارة الملف الشخصي

### لأصحاب المكتبات
- ✅ تسجيل المكتبة
- ✅ إدارة الكتب (إضافة/تعديل/حذف)
- ✅ رفع صور الكتب
- ✅ إدارة المخزون والأسعار
- ✅ لوحة تحكم المكتبة

### للمديرين
- ✅ لوحة إدارة شاملة
- ✅ قبول/رفض المكتبات الجديدة
- ✅ إحصائيات النظام
- ✅ إدارة المستخدمين

## حل المشاكل الشائعة

### خطأ في الاتصال بقاعدة البيانات
```bash
# تأكد من تشغيل PostgreSQL
pg_isready -h localhost -p 5432

# تأكد من وجود قاعدة البيانات
psql -l | grep almutanabbi
```

### خطأ في المنافذ
```bash
# تأكد من عدم استخدام المنافذ
netstat -an | findstr :3000
netstat -an | findstr :3001
```

### مشاكل في تثبيت المتطلبات
```bash
# مسح cache npm
npm cache clean --force

# إعادة تثبيت المتطلبات
rm -rf node_modules package-lock.json
npm install
```

## البنية التقنية

### الخادم الخلفي (Backend)
- **إطار العمل**: Express.js
- **قاعدة البيانات**: PostgreSQL + Sequelize ORM
- **المصادقة**: JWT + bcrypt
- **رفع الملفات**: Multer
- **التحقق**: Joi

### الواجهة الأمامية (Frontend)  
- **إطار العمل**: React 18
- **التصميم**: Tailwind CSS
- **التوجيه**: React Router v6
- **النماذج**: React Hook Form
- **HTTP**: Axios
- **الحالة**: React Context API

## الدعم

للمساعدة والدعم:
1. راجع ملف README.md
2. تحقق من ملفات السجل في المجلد `server/logs`
3. تأكد من تشغيل جميع الخدمات المطلوبة

---

**مرحباً بكم في المتنبي - مكتبة العراق الرقمية** 📚
