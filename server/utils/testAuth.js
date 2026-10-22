import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import * as authService from '../services/authService.js';
import { verifyToken } from '../utils/jwt.js';

async function runAuthTests() {
  console.log('--- Starting Phase 3 Authentication Verification ---');

  await connectDB();

  const testEmail = `authtest_${Date.now()}@example.com`;
  const testPassword = 'SecurePassword123!';

  // 1. Clean up any existing test user with that email
  await User.deleteOne({ email: testEmail });

  // 2. Test Registration
  console.log('1. Testing Registration...');
  const regResult = await authService.register({
    name: 'Auth Test User',
    email: testEmail,
    password: testPassword,
    department: 'Quality Assurance',
    phone: '1234567890',
  });

  if (!regResult.token || !regResult.user) {
    throw new Error('Registration failed: Expected token and user in response');
  }

  if (regResult.user.password) {
    throw new Error('Security violation: Plaintext/Hashed password was exposed in user response object');
  }
  console.log('[PASS] Registration succeeded and password field is securely omitted.');

  // 3. Test Duplicate Registration (Must throw 409)
  console.log('2. Testing Duplicate Email Registration...');
  let dupCaught = false;
  try {
    await authService.register({
      name: 'Duplicate User',
      email: testEmail,
      password: testPassword,
      department: 'Engineering',
    });
  } catch (err) {
    dupCaught = true;
    console.log(`[PASS] Duplicate registration rejected with status ${err.statusCode} (${err.message})`);
  }
  if (!dupCaught) throw new Error('Duplicate email was not rejected');

  // 4. Test Login with Valid Credentials
  console.log('3. Testing Login with Valid Credentials...');
  const loginResult = await authService.login({
    email: testEmail,
    password: testPassword,
  });

  if (!loginResult.token) throw new Error('Login failed to return JWT token');
  const decoded = verifyToken(loginResult.token);
  if (decoded.id !== regResult.user._id.toString() || decoded.role !== 'EMPLOYEE') {
    throw new Error(`Token payload mismatch: decoded id=${decoded.id}, role=${decoded.role}`);
  }
  console.log('[PASS] Login successful, JWT token signed with correct userId and role.');

  // 5. Test Login with Invalid Password (Must throw 401)
  console.log('4. Testing Login with Invalid Password...');
  let invalidPassCaught = false;
  try {
    await authService.login({
      email: testEmail,
      password: 'WrongPassword999!',
    });
  } catch (err) {
    invalidPassCaught = true;
    console.log(`[PASS] Invalid password rejected with status ${err.statusCode} (${err.message})`);
  }
  if (!invalidPassCaught) throw new Error('Invalid password was accepted!');

  // 6. Test Profile Retrieval
  console.log('5. Testing Get Current User Profile (getMe)...');
  const profile = await authService.getMe(regResult.user._id);
  if (profile.email !== testEmail.toLowerCase() || profile.department !== 'Quality Assurance') {
    throw new Error('Profile retrieval returned unexpected data');
  }
  console.log('[PASS] Profile retrieved successfully.');

  // 7. Test Deactivated User Check
  console.log('6. Testing Deactivated User Access Block...');
  await User.findByIdAndUpdate(regResult.user._id, { isActive: false });
  let deactCaught = false;
  try {
    await authService.login({
      email: testEmail,
      password: testPassword,
    });
  } catch (err) {
    deactCaught = true;
    console.log(`[PASS] Deactivated user blocked with status ${err.statusCode} (${err.message})`);
  }
  if (!deactCaught) throw new Error('Deactivated user was allowed to log in!');

  // Clean up
  await User.deleteOne({ email: testEmail });
  console.log('[PASS] Test user cleaned up.');

  console.log('--- All Phase 3 Authentication Tests Successfully Passed ---');
}

runAuthTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Auth Test Failed:', err);
    process.exit(1);
  });
