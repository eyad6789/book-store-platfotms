const axios = require('axios');

async function testAPI() {
  try {
    console.log('🧪 Testing /api/bookstores/my-bookstore endpoint...');
    
    // This is the token from the error log
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc1OTEzOTQzNiwiZXhwIjoxNzU5NzQ0MjM2fQ.WJVA2MtCNO_4H7v2Di3Lz3tUuj2ND5nGIhJPcOsYqfM';
    
    const response = await axios.get('http://localhost:3000/api/bookstores/my-bookstore', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API call successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ API call failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Full error:', error.message);
  }
}

testAPI();
