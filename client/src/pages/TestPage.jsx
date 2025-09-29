import { useParams } from 'react-router-dom';

function TestPage() {
  const { bookstoreId } = useParams();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">صفحة اختبار</h1>
        <p className="text-gray-600 mb-4">
          معرف المكتبة: {bookstoreId || 'غير محدد'}
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ التوجيه يعمل بشكل صحيح</p>
          <p>✅ المعاملات يتم استخراجها</p>
          <p>✅ المكونات يتم تحميلها</p>
        </div>
      </div>
    </div>
  );
}

export default TestPage;
