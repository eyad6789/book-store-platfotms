// Verification script for library books integration
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

async function verifyIntegration() {
  console.log('🔍 Verifying Library Books Integration...\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing server health...');
    const health = await makeRequest('/api/health');
    console.log(`   Status: ${health.status} ${health.status === 200 ? '✅' : '❌'}`);
    
    // Test 2: Main books API
    console.log('\n2️⃣ Testing main books API...');
    const books = await makeRequest('/api/books?limit=3&include_library=true');
    console.log(`   Status: ${books.status} ${books.status === 200 ? '✅' : '❌'}`);
    if (books.status === 200 && books.data.success) {
      console.log(`   📚 Total books: ${books.data.pagination.totalItems}`);
      console.log(`   📊 Sources: Regular=${books.data.sources?.regular_books || 0}, Library=${books.data.sources?.library_books || 0}`);
    }
    
    // Test 3: Library books only
    console.log('\n3️⃣ Testing library books API...');
    const libraryBooks = await makeRequest('/api/books/library?limit=3');
    console.log(`   Status: ${libraryBooks.status} ${libraryBooks.status === 200 ? '✅' : '❌'}`);
    if (libraryBooks.status === 200 && libraryBooks.data.success) {
      console.log(`   📖 Library books: ${libraryBooks.data.pagination.totalItems}`);
      if (libraryBooks.data.books && libraryBooks.data.books.length > 0) {
        console.log(`   📝 Sample: "${libraryBooks.data.books[0].title_ar || libraryBooks.data.books[0].title}"`);
      }
    }
    
    // Test 4: Search functionality
    console.log('\n4️⃣ Testing search functionality...');
    const search = await makeRequest('/api/books/search?q=test&limit=2');
    console.log(`   Status: ${search.status} ${search.status === 200 ? '✅' : '❌'}`);
    if (search.status === 200 && search.data.success) {
      console.log(`   🔍 Search results: ${search.data.pagination.totalItems}`);
    }
    
    console.log('\n🎉 Integration verification completed!');
    
    // Summary
    const allGood = health.status === 200 && books.status === 200 && libraryBooks.status === 200;
    console.log(`\n📋 Summary: ${allGood ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allGood) {
      console.log('\n🚀 Your library books should now be visible on the frontend!');
      console.log('   👉 Go to /books page and check the results');
      console.log('   👉 Look for source breakdown in console logs');
      console.log('   👉 Toggle the library books filter to test');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.log('\n🔧 Make sure the server is running: npm start');
  }
}

verifyIntegration();
