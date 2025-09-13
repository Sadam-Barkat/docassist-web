// Simple test to check backend connectivity
const axios = require('axios');

async function testBackend() {
  try {
    console.log('Testing backend connection...');
    
    // Test root endpoint first
    const rootResponse = await axios.get('http://localhost:8000/');
    console.log('✅ Root endpoint:', rootResponse.data);
    
    // Test login endpoint with simple request
    const loginResponse = await axios.post('http://localhost:8000/auth/login', {
      email: 'test@example.com',
      password: 'testpassword'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.log('❌ Error details:');
    console.log('Status:', error.response?.status);
    console.log('Headers:', error.response?.headers);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
  }
}

testBackend();
