// test-chatbot.js
const axios = require('axios');

async function testChatbot() {
  try {
    console.log('Testing chatbot API...');

    // Test chatbot endpoint
    const chatbotResponse = await axios.post('https://docassist-api.onrender.com/chatbot/', {
      message: 'show me the dashboard'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Chatbot response:', chatbotResponse.data);

  } catch (error) {
    console.log('❌ Chatbot Error details:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
  }
}

testChatbot();
