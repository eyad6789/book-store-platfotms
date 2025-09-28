const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test results storage
const testResults = {
  passed: [],
  failed: [],
  total: 0
};

// Helper function to test an endpoint
async function testEndpoint(name, method, url, expectedStatus = 200, data = null, headers = {}) {
  testResults.total++;
  try {
    console.log(`\n🧪 Testing ${name}...`);
    console.log(`   ${method.toUpperCase()} ${url}`);
    
    const config = {
      method: method.toLowerCase(),
      url: `${BASE_URL}${url}`,
      headers,
      timeout: 5000
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    if (response.status === expectedStatus) {
      console.log(`   ✅ PASSED - Status: ${response.status}`);
      testResults.passed.push(name);
      return { success: true, data: response.data, status: response.status };
    } else {
      console.log(`   ❌ FAILED - Expected: ${expectedStatus}, Got: ${response.status}`);
      testResults.failed.push({ name, expected: expectedStatus, actual: response.status });
      return { success: false, status: response.status };
    }
  } catch (error) {
    const status = error.response?.status || 'Network Error';
    const message = error.response?.data?.message || error.message;
    
    if (status === expectedStatus) {
      console.log(`   ✅ PASSED - Status: ${status} (Expected error)`);
      testResults.passed.push(name);
      return { success: true, status, message };
    } else {
      console.log(`   ❌ FAILED - Status: ${status}, Message: ${message}`);
      testResults.failed.push({ name, expected: expectedStatus, actual: status, message });
      return { success: false, status, message };
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive API testing for المتنبي (Al-Mutanabbi)...\n');
  console.log('=' .repeat(60));
  
  // Test 1: API Root
  await testEndpoint('API Root', 'GET', '');
  
  // Test 2: Health Check
  await testEndpoint('Health Check', 'GET', '/health');
  
  // Test 3: Books Endpoints
  console.log('\n📚 TESTING BOOKS ENDPOINTS');
  console.log('-'.repeat(30));
  await testEndpoint('Books List', 'GET', '/books');
  await testEndpoint('Books Search', 'GET', '/books/search?q=الأدب');
  await testEndpoint('Books Categories', 'GET', '/books/categories');
  await testEndpoint('Featured Books', 'GET', '/books/featured');
  await testEndpoint('Book Details', 'GET', '/books/1');
  await testEndpoint('Book Not Found', 'GET', '/books/99999', 404);
  
  // Test 4: Bookstores Endpoints
  console.log('\n🏪 TESTING BOOKSTORES ENDPOINTS');
  console.log('-'.repeat(30));
  await testEndpoint('Bookstores List', 'GET', '/bookstores');
  await testEndpoint('My Bookstore (No Auth)', 'GET', '/bookstores/my-bookstore', 401);
  await testEndpoint('Bookstore Details', 'GET', '/bookstores/1');
  
  // Test 5: Auth Endpoints (Expected to fail without proper data)
  console.log('\n🔐 TESTING AUTH ENDPOINTS');
  console.log('-'.repeat(30));
  await testEndpoint('Register (No Data)', 'POST', '/auth/register', 400);
  await testEndpoint('Login (No Data)', 'POST', '/auth/login', 400);
  await testEndpoint('Profile (No Auth)', 'GET', '/auth/profile', 401);
  
  // Test 6: Wishlist Endpoints (Expected to fail without auth)
  console.log('\n❤️ TESTING WISHLIST ENDPOINTS');
  console.log('-'.repeat(30));
  await testEndpoint('Wishlist (No Auth)', 'GET', '/wishlist', 401);
  await testEndpoint('Add to Wishlist (No Auth)', 'POST', '/wishlist/1', 401);
  await testEndpoint('Check Wishlist (No Auth)', 'GET', '/wishlist/check/1', 401);
  
  // Test 7: Analytics Endpoints (Expected to fail without auth)
  console.log('\n📊 TESTING ANALYTICS ENDPOINTS');
  console.log('-'.repeat(30));
  await testEndpoint('Bookstore Analytics (No Auth)', 'GET', '/analytics/bookstore', 401);
  await testEndpoint('Search Trends', 'GET', '/analytics/search-trends');
  
  // Test 8: Orders Endpoints (Expected to fail without auth)
  console.log('\n🛒 TESTING ORDERS ENDPOINTS');
  console.log('-'.repeat(30));
  await testEndpoint('Orders List (No Auth)', 'GET', '/orders', 401);
  
  // Test 9: Invalid Endpoints
  console.log('\n❌ TESTING INVALID ENDPOINTS');
  console.log('-'.repeat(30));
  await testEndpoint('Invalid Endpoint', 'GET', '/invalid-endpoint', 404);
  
  // Print Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed.length}/${testResults.total}`);
  console.log(`❌ Failed: ${testResults.failed.length}/${testResults.total}`);
  console.log(`📊 Success Rate: ${Math.round((testResults.passed.length / testResults.total) * 100)}%`);
  
  if (testResults.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.failed.forEach(test => {
      console.log(`   • ${test.name}: Expected ${test.expected}, Got ${test.actual}`);
      if (test.message) {
        console.log(`     Message: ${test.message}`);
      }
    });
  }
  
  console.log('\n✅ PASSED TESTS:');
  testResults.passed.forEach(test => {
    console.log(`   • ${test}`);
  });
  
  console.log('\n🎉 API Testing Complete!');
  
  if (testResults.failed.length === 0) {
    console.log('🎊 All tests passed! Your API is working perfectly!');
  } else {
    console.log(`⚠️  ${testResults.failed.length} tests failed. Please check the issues above.`);
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllTests()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Test runner failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runAllTests, testEndpoint };
