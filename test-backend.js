// test-backend.js
const axios = require('axios');

async function testBackend() {
  try {
    console.log('Testing backend connection...');

    // Test root endpoint first
    const rootResponse = await axios.get('https://docassist-api.onrender.com/');
    console.log('✅ Root endpoint:', rootResponse.data);

    // Test login endpoint with simple request
    const loginResponse = await axios.post('https://docassist-api.onrender.com/auth/login', {
      email: 'test@example.com',
      password: 'testpassword'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Login response:', loginResponse.data);

  } catch (error) {
    console.log('❌ Error details:');
    console.log('Status:', error.response?.status);
    console.log('Headers:', error.response?.headers);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
  }
}

testBackend();
