// Test script to verify avatar upload API is working
const http = require('http');

// Test 1: Check if auth test endpoint exists
console.log('Testing auth routes...\n');

const testEndpoint = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/test-upload',
  method: 'GET'
};

const req = http.request(testEndpoint, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', data);
    
    if (res.statusCode === 200) {
      console.log('\n✅ SUCCESS! Auth routes are loaded correctly.');
      console.log('✅ The /api/auth/upload-avatar endpoint should be available now.');
    } else {
      console.log('\n❌ FAILED! Auth routes may not be loaded.');
      console.log('Please restart the server with: npm run dev');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error connecting to server:', error.message);
  console.log('\nMake sure the server is running on port 5000');
  console.log('Start it with: npm run dev');
});

req.end();
