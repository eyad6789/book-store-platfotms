const axios = require('axios');

async function testSimpleRoute() {
  try {
    console.log('🧪 Testing simple bookstore route...');
    
    const response = await axios.get('http://localhost:3000/api/bookstores/test-simple');
    console.log('✅ Simple route successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Simple route failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Full error:', error.message);
  }
}

testSimpleRoute();
