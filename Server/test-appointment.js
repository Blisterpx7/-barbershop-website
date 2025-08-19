const axios = require('axios');

// Test appointment creation
async function testAppointmentCreation() {
  try {
    console.log('Testing appointment creation...');
    
    // First test the basic endpoints
    console.log('\n1. Testing basic server endpoint...');
    const testResponse = await axios.get('http://localhost:3000/api/test');
    console.log('✅ Server test:', testResponse.data);
    
    console.log('\n2. Testing database connection...');
    const dbResponse = await axios.get('http://localhost:3000/api/test-db');
    console.log('✅ Database test:', dbResponse.data);
    
    console.log('\n3. Testing authentication...');
    // You'll need to get a valid token first by logging in
    console.log('⚠️  Authentication test requires valid token');
    console.log('   Please log in through the web app first to get a token');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test with a sample token (you'll need to replace this with a real token)
async function testWithToken(token) {
  try {
    console.log('\n4. Testing appointment creation with token...');
    
    const appointmentData = {
      serviceId: '507f1f77bcf86cd799439011', // Replace with real service ID
      barberId: '507f1f77bcf86cd799439012',  // Replace with real barber ID
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      notes: 'Test appointment'
    };
    
    const response = await axios.post('http://localhost:3000/api/appointments', appointmentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Appointment created:', response.data);
    
  } catch (error) {
    console.error('❌ Appointment creation failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('💡 This suggests an authentication issue');
    } else if (error.response?.status === 400) {
      console.log('💡 This suggests a validation issue');
    }
  }
}

// Run tests
if (require.main === module) {
  testAppointmentCreation();
  
  // If you have a token, uncomment and use this:
  // const token = 'your-token-here';
  // testWithToken(token);
}

module.exports = { testAppointmentCreation, testWithToken };
