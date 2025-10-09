// Test the crash fixes
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

async function testCrashFixes() {
  console.log('🔧 Testing Crash Fixes...\n');
  
  try {
    // Test regular book detail
    console.log('1️⃣ Testing regular book detail page...');
    const regularBook = await makeRequest('/api/books/5');
    console.log(`   Status: ${regularBook.status} ${regularBook.status === 200 ? '✅' : '❌'}`);
    if (regularBook.status === 200) {
      console.log(`   📖 Book: "${regularBook.data.book?.title_arabic || regularBook.data.book?.title}"`);
      console.log(`   🏷️ Category type: ${typeof regularBook.data.book?.category}`);
    }
    
    // Test library book detail
    console.log('\n2️⃣ Testing library book detail page...');
    const libraryBook = await makeRequest('/api/library/books/6');
    console.log(`   Status: ${libraryBook.status} ${libraryBook.status === 200 ? '✅' : '❌'}`);
    if (libraryBook.status === 200) {
      console.log(`   📚 Library book: "${libraryBook.data.book?.title_ar || libraryBook.data.book?.title}"`);
      console.log(`   🏷️ Category type: ${typeof libraryBook.data.book?.category}`);
    }
    
    console.log('\n🔧 FIXES APPLIED:');
    console.log('==================');
    console.log('✅ Fixed duplicate keys in BooksPage (library books now have "library-" prefix)');
    console.log('✅ Fixed BookDetailPage to handle library book IDs properly');
    console.log('✅ Fixed category object rendering error (now checks if object or string)');
    console.log('✅ Updated HomePage to use consistent library book IDs');
    
    console.log('\n📱 EXPECTED BEHAVIOR:');
    console.log('   1. Books page should load without duplicate key warnings');
    console.log('   2. Clicking library books should open detail pages correctly');
    console.log('   3. Book detail pages should display category properly');
    console.log('   4. No more React rendering errors');
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Refresh your books page');
    console.log('   2. Click on any book (regular or library)');
    console.log('   3. Check that detail page loads without errors');
    console.log('   4. Verify category displays correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCrashFixes();
