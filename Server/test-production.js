#!/usr/bin/env node

/**
 * Production Test Script
 * Run this to test if your production server is working correctly
 * 
 * Usage: node test-production.js
 */

require('dotenv').config({ path: './env.production' });

const axios = require('axios');

const BASE_URL = process.env.CLIENT_URL || 'https://your-app.vercel.app'; // FREE SUBDOMAIN (update after deployment)

console.log('🧪 Testing Production Server...\n');
console.log(`📍 Base URL: ${BASE_URL}\n`);

const tests = [
  {
    name: 'Server Health Check',
    endpoint: '/api/test',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Database Connection',
    endpoint: '/api/test-db',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Services List',
    endpoint: '/api/services',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Barbers List',
    endpoint: '/api/barbers',
    method: 'GET',
    expectedStatus: 200
  }
];

async function runTest(test) {
  try {
    console.log(`🔍 Testing: ${test.name}`);
    console.log(`   Endpoint: ${test.method} ${test.endpoint}`);
    
    const response = await axios({
      method: test.method,
      url: `${BASE_URL}${test.endpoint}`,
      timeout: 10000
    });
    
    if (response.status === test.expectedStatus) {
      console.log(`   ✅ PASS - Status: ${response.status}`);
      
      // Show response data for debugging
      if (test.endpoint === '/api/test-db') {
        console.log(`   📊 Database Counts:`, response.data.counts);
      }
    } else {
      console.log(`   ❌ FAIL - Expected: ${test.expectedStatus}, Got: ${response.status}`);
    }
    
  } catch (error) {
    console.log(`   ❌ FAIL - Error: ${error.message}`);
    
    if (error.response) {
      console.log(`   📡 Response Status: ${error.response.status}`);
      console.log(`   📄 Response Data:`, error.response.data);
    }
  }
  
  console.log('');
}

async function runAllTests() {
  console.log('🚀 Starting Production Tests...\n');
  
  for (const test of tests) {
    await runTest(test);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🏁 All tests completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. If all tests PASS → Your server is ready! 🎉');
  console.log('2. If any test FAILS → Check the error messages above');
  console.log('3. Verify your environment variables are correct');
  console.log('4. Check if your server is running and accessible');
}

// Run tests
runAllTests().catch(console.error);
