// Debug script to test ManageBooksPage access
const http = require('http');

function makeRequest(path, method = 'GET', headers = {}) {
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

    req.end();
  });
}

async function debugManageBooksAccess() {
  console.log('🔍 Debugging ManageBooksPage Access Issues...\n');
  
  try {
    // Test 1: Check if the API endpoint exists
    console.log('1️⃣ Testing API endpoint availability...');
    const booksTest = await makeRequest('/api/bookstores/my-bookstore/books');
    console.log(`   📚 /api/bookstores/my-bookstore/books: ${booksTest.status}`);
    
    if (booksTest.status === 401) {
      console.log('   ✅ Endpoint exists but requires authentication');
    } else if (booksTest.status === 404) {
      console.log('   ❌ Endpoint not found');
    } else {
      console.log(`   ℹ️ Unexpected status: ${booksTest.status}`);
    }
    
    // Test 2: Check bookstore dashboard endpoint
    console.log('\n2️⃣ Testing bookstore dashboard endpoint...');
    const dashboardTest = await makeRequest('/api/bookstores/my-bookstore');
    console.log(`   🏪 /api/bookstores/my-bookstore: ${dashboardTest.status}`);
    
    console.log('\n🎯 TROUBLESHOOTING GUIDE:');
    console.log('========================');
    
    console.log('\n📋 POSSIBLE ISSUES & SOLUTIONS:');
    console.log('1. **User Role Issue**:');
    console.log('   - User might not have "bookstore_owner" role');
    console.log('   - Solution: Check user role in database');
    console.log('   - SQL: SELECT role FROM users WHERE id = [user_id];');
    
    console.log('\n2. **Authentication Issue**:');
    console.log('   - Token might be expired or invalid');
    console.log('   - Solution: Try logging out and logging back in');
    
    console.log('\n3. **No Bookstore Registered**:');
    console.log('   - User might not have a bookstore yet');
    console.log('   - Solution: Register a bookstore first');
    
    console.log('\n4. **Route Protection Issue**:');
    console.log('   - ProtectedRoute might be blocking access');
    console.log('   - Check browser console for errors');
    
    console.log('\n🚀 DEBUGGING STEPS:');
    console.log('1. Open browser developer tools (F12)');
    console.log('2. Go to Network tab');
    console.log('3. Try to access "إدارة الكتب" page');
    console.log('4. Check for failed API requests');
    console.log('5. Look at Console tab for JavaScript errors');
    
    console.log('\n📱 EXPECTED BEHAVIOR:');
    console.log('1. Login as bookstore owner');
    console.log('2. Go to bookstore dashboard');
    console.log('3. Click "إدارة الكتب" card');
    console.log('4. Should navigate to /bookstore/books');
    console.log('5. Should show books management table');
    
    console.log('\n🔧 QUICK FIXES TO TRY:');
    console.log('1. Clear browser cache and cookies');
    console.log('2. Try in incognito/private browsing mode');
    console.log('3. Check if user has bookstore_owner role');
    console.log('4. Verify bookstore is registered and approved');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugManageBooksAccess();
