const axios = require('axios');

async function testSimple() {
  try {
    console.log('🧪 Testing simple endpoint...');
    
    // Test the root API endpoint
    const response = await axios.get('http://localhost:3000/api');
    console.log('✅ Simple API call successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Simple API call failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Full error:', error.message);
  }
}

testSimple();
