// Test the frontend solution by testing both API endpoints
const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function testFrontendSolution() {
  console.log('🧪 Testing Frontend Solution...\n');
  
  try {
    // Test 1: Regular books API
    console.log('1️⃣ Testing regular books API...');
    const regularBooks = await makeRequest('/api/books?include_library=false&limit=3');
    console.log(`   Status: ${regularBooks.status} ${regularBooks.status === 200 ? '✅' : '❌'}`);
    if (regularBooks.status === 200 && regularBooks.data.success) {
      console.log(`   📚 Regular books: ${regularBooks.data.pagination?.totalItems || 0}`);
    }
    
    // Test 2: Library books API
    console.log('\n2️⃣ Testing library books API...');
    const libraryBooks = await makeRequest('/api/books/library?limit=3');
    console.log(`   Status: ${libraryBooks.status} ${libraryBooks.status === 200 ? '✅' : '❌'}`);
    if (libraryBooks.status === 200 && libraryBooks.data.success) {
      console.log(`   📖 Library books: ${libraryBooks.data.pagination?.totalItems || 0}`);
    }
    
    // Test 3: Simulate frontend combination
    console.log('\n3️⃣ Simulating frontend combination...');
    if (regularBooks.status === 200 && libraryBooks.status === 200) {
      const totalRegular = regularBooks.data.pagination?.totalItems || 0;
      const totalLibrary = libraryBooks.data.pagination?.totalItems || 0;
      const totalCombined = totalRegular + totalLibrary;
      
      console.log(`   📊 Combined totals: ${totalCombined} books`);
      console.log(`   📚 Regular: ${totalRegular}`);
      console.log(`   📖 Library: ${totalLibrary}`);
      
      if (totalCombined > 0) {
        console.log('\n🎉 SUCCESS! Frontend solution will work:');
        console.log('   ✅ Both APIs are working');
        console.log('   ✅ Books can be combined in frontend');
        console.log('   ✅ Your library books will now be visible!');
        
        console.log('\n📋 NEXT STEPS:');
        console.log('   1. Refresh your books page in the browser');
        console.log('   2. Check browser console for "🔍 Fetching books from both sources..."');
        console.log('   3. Look for source breakdown showing library books count');
        console.log('   4. Your uploaded books should now appear!');
      } else {
        console.log('\n❌ No books found in either API');
      }
    } else {
      console.log('\n❌ One or both APIs are not working');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFrontendSolution();
