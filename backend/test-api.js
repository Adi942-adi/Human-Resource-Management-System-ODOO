const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

let authToken = '';

async function testAPI() {
  try {
    console.log('=== Testing HRMS API ===\n');

    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthRes = await axios.get(`${API_BASE}/health`);
    console.log('✓ Health check passed:', healthRes.data);

    // Test 2: Login as admin
    console.log('\n2. Testing login (admin)...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    authToken = loginRes.data.token;
    console.log('✓ Login successful, token received');

    // Test 3: Get current user
    console.log('\n3. Testing get current user...');
    const meRes = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ Current user:', meRes.data.user.email);

    // Test 4: Get all users
    console.log('\n4. Testing get all users...');
    const usersRes = await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ Users retrieved:', usersRes.data.length, 'users');

    // Test 5: Get attendance
    console.log('\n5. Testing get attendance...');
    const attendanceRes = await axios.get(`${API_BASE}/attendance/my`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ Attendance retrieved');

    // Test 6: Get leaves
    console.log('\n6. Testing get leaves...');
    const leavesRes = await axios.get(`${API_BASE}/leave/my`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ Leaves retrieved');

    // Test 7: Get payroll
    console.log('\n7. Testing get payroll...');
    const payrollRes = await axios.get(`${API_BASE}/payroll/my`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ Payroll retrieved');

    console.log('\n=== All tests passed! ===');
  } catch (error) {
    console.error('\n✗ Test failed:', error.response?.data || error.message);
  }
}

testAPI();
