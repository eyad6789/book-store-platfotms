import { useState } from 'react';
import StarRating from '../components/ui/StarRating';
import LibraryRating from '../components/ratings/LibraryRating';

function TestRatingPage() {
  const [testRating, setTestRating] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">اختبار نظام التقييم</h1>
          
          {/* Test StarRating Component */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">اختبار مكون النجوم</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">تقييم تفاعلي:</p>
                <StarRating 
                  rating={testRating}
                  onRatingChange={setTestRating}
                  size="large"
                />
                <p className="text-sm text-gray-500 mt-2">التقييم الحالي: {testRating}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">تقييم للقراءة فقط:</p>
                <StarRating 
                  rating={4.5}
                  readonly
                  size="medium"
                />
              </div>
            </div>
          </div>

          {/* Test LibraryRating Component */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">اختبار مكون تقييم المكتبة</h2>
            <LibraryRating 
              bookstoreId={1} 
              showReviews={true}
            />
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default TestRatingPage;
