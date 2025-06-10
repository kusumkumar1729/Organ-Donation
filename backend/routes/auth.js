// auth.js
// Helper function to handle API requests
async function apiRequest(url, method, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  return await res.json();
}

// Register a user (admin or user)
async function register(email, password, isAdmin = false) {
  const endpoint = isAdmin ? '/api/auth/admin/register' : '/api/auth/register';
  const res = await apiRequest(`http://localhost:5000${endpoint}`, 'POST', { email, password });
  console.log('Register response:', res);
  return res;
}

// Verify OTP
async function verifyOtp(email, otp) {
  const res = await apiRequest('http://localhost:5000/api/auth/verify-register-otp', 'POST', { email, otp });
  console.log('OTP verification response:', res);
  return res;
}

// Login (admin or user)
async function login(email, password, isAdmin = false) {
  const endpoint = isAdmin ? '/api/auth/admin/login' : '/api/auth/login';
  const res = await apiRequest(`http://localhost:5000${endpoint}`, 'POST', { email, password });
  console.log('Login response:', res);
  return res;
}

// Logout
async function logout() {
  const res = await apiRequest('http://localhost:5000/api/auth/logout', 'POST');
  console.log('Logout response:', res);
  return res;
}

// Verify token
async function verifyToken() {
  const res = await apiRequest('http://localhost:5000/api/auth/verify', 'GET');
  console.log('Verify token response:', res);
  return res;
}