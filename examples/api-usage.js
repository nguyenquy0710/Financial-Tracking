const axios = require('axios');
const API_BASE_URL = 'http://localhost:3000/api';
let authToken = '';

const apiCall = async (method, endpoint, data = null) => {
  const config = {
    method, url: `${API_BASE_URL}${endpoint}`,
    headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
    data
  };
  const response = await axios(config);
  return response.data;
};

async function runDemo() {
  console.log('FinTrack API Demo');
  const result = await apiCall('POST', '/auth/register', {
    email: 'demo@fintrack.com', password: 'demo123456', name: 'Demo User'
  });
  authToken = result.data.token;
  console.log('User registered successfully');
}

if (require.main === module) { runDemo(); }
module.exports = { runDemo };
