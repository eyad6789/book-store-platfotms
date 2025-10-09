// Debug script to check the complete book workflow
const http = require('http');

function makeRequest(path, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
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
          resolve({ status: res.statusCode, data: data, raw: true });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function debugBookWorkflow() {
  console.log('🔍 Debugging Book Upload and Approval Workflow...\n');
  
  try {
    // 1. Check server health
    console.log('1️⃣ Checking server health...');
    const health = await makeRequest('/api/health');
    console.log(`   Status: ${health.status} ${health.status === 200 ? '✅' : '❌'}`);
    
    // 2. Check library books API (public)
    console.log('\n2️⃣ Checking library books API...');
    const libraryBooks = await makeRequest('/api/books/library');
    console.log(`   Status: ${libraryBooks.status} ${libraryBooks.status === 200 ? '✅' : '❌'}`);
    if (libraryBooks.status === 200 && libraryBooks.data.success) {
      console.log(`   📖 Total library books: ${libraryBooks.data.pagination.totalItems}`);
      if (libraryBooks.data.books && libraryBooks.data.books.length > 0) {
        console.log(`   📝 Sample titles:`);
        libraryBooks.data.books.slice(0, 3).forEach((book, i) => {
          console.log(`      ${i+1}. "${book.title_ar || book.title}" (Status: ${book.status || 'N/A'})`);
        });
      }
    }
    
    // 3. Check main books API
    console.log('\n3️⃣ Checking main books API...');
    const mainBooks = await makeRequest('/api/books?include_library=true');
    console.log(`   Status: ${mainBooks.status} ${mainBooks.status === 200 ? '✅' : '❌'}`);
    if (mainBooks.status === 200 && mainBooks.data.success) {
      console.log(`   📚 Total books: ${mainBooks.data.pagination.totalItems}`);
      console.log(`   📊 Sources: Regular=${mainBooks.data.sources?.regular_books || 0}, Library=${mainBooks.data.sources?.library_books || 0}`);
    }
    
    // 4. Try to check admin pending books (without auth - will fail but shows endpoint)
    console.log('\n4️⃣ Checking admin pending books endpoint...');
    const pendingBooks = await makeRequest('/api/admin/books/pending');
    console.log(`   Status: ${pendingBooks.status} (Expected 401 without auth)`);
    if (pendingBooks.status === 401) {
      console.log(`   ✅ Admin endpoint exists (requires authentication)`);
    }
    
    // 5. Check categories (needed for book upload)
    console.log('\n5️⃣ Checking categories...');
    const categories = await makeRequest('/api/books/categories');
    console.log(`   Status: ${categories.status} ${categories.status === 200 ? '✅' : '❌'}`);
    if (categories.status === 200 && categories.data.success) {
      console.log(`   📂 Categories available: ${categories.data.categories?.length || 0}`);
    }
    
    console.log('\n📋 DIAGNOSIS:');
    console.log('================');
    
    if (libraryBooks.status === 200 && libraryBooks.data.pagination.totalItems > 0) {
      console.log('✅ Library books system is working');
      console.log('✅ Books are being saved to database');
      
      if (mainBooks.data.sources?.library_books > 0) {
        console.log('✅ Library books are appearing in main books API');
        console.log('\n🎉 SYSTEM IS WORKING! Your books should be visible.');
        console.log('   👉 Check the books page in your browser');
        console.log('   👉 Look for the source breakdown in console logs');
      } else {
        console.log('⚠️  Library books not appearing in main books API');
        console.log('   🔧 Need to fix the main books integration');
      }
    } else {
      console.log('❌ No library books found');
      console.log('\n🤔 POSSIBLE ISSUES:');
      console.log('   1. Books are not being uploaded successfully');
      console.log('   2. Books are pending admin approval');
      console.log('   3. Database connection issues');
      console.log('   4. API endpoint problems');
      
      console.log('\n🔧 NEXT STEPS:');
      console.log('   1. Try uploading a book through the library dashboard');
      console.log('   2. Check browser console for errors during upload');
      console.log('   3. Login as admin and check for pending books');
      console.log('   4. Verify your bookstore is approved and active');
    }
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

debugBookWorkflow();
