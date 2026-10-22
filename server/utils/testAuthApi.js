import dotenv from 'dotenv';
dotenv.config();

process.env.RUN_AS_MODULE = 'true';
process.env.NODE_ENV = 'test';

import app, { startServer } from '../server.js';
import User from '../models/User.js';
import { closeDB } from '../config/db.js';

async function runHttpAuthTest() {
  console.log('--- Starting Phase 3 HTTP Auth Endpoints Verification ---');
  
  // Start server on an ephemeral port
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/auth`;

  const testEmail = `httpuser_${Date.now()}@example.com`;
  const testPassword = 'StrongPassword123!';

  try {
    // 1. POST /api/auth/register
    console.log('1. Testing HTTP POST /api/auth/register...');
    const regRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'HTTP Test Employee',
        email: testEmail,
        password: testPassword,
        department: 'Information Technology',
        phone: '9876543210',
      }),
    });
    const regData = await regRes.json();
    if (!regRes.ok || !regData.data.token) {
      throw new Error(`Register API failed: ${JSON.stringify(regData)}`);
    }
    console.log(`[PASS] HTTP 201 Register passed. User ID: ${regData.data.user._id}`);
    const token = regData.data.token;

    // 2. GET /api/auth/me with Bearer token
    console.log('2. Testing HTTP GET /api/auth/me with Bearer Token...');
    const meRes = await fetch(`${baseUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    if (!meRes.ok || meData.data.email !== testEmail.toLowerCase()) {
      throw new Error(`GetMe API failed: ${JSON.stringify(meData)}`);
    }
    console.log(`[PASS] HTTP 200 GET /me passed. Role: ${meData.data.role}`);

    // 3. GET /api/auth/me without token -> must return 401
    console.log('3. Testing HTTP GET /api/auth/me without Token (Security Gate)...');
    const noTokenRes = await fetch(`${baseUrl}/me`);
    const noTokenData = await noTokenRes.json();
    if (noTokenRes.status !== 401) {
      throw new Error(`Expected 401 for missing token, got ${noTokenRes.status}`);
    }
    console.log(`[PASS] HTTP 401 Unauthorized correctly enforced: ${noTokenData.message}`);

    // 4. PUT /api/auth/profile
    console.log('4. Testing HTTP PUT /api/auth/profile...');
    const updateRes = await fetch(`${baseUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Updated HTTP Employee',
        department: 'DevOps',
      }),
    });
    const updateData = await updateRes.json();
    if (!updateRes.ok || updateData.data.name !== 'Updated HTTP Employee') {
      throw new Error(`Update profile failed: ${JSON.stringify(updateData)}`);
    }
    console.log(`[PASS] HTTP 200 PUT /profile passed. New Dept: ${updateData.data.department}`);

    // 5. Cleanup
    await User.deleteOne({ email: testEmail });
    console.log('--- All Phase 3 HTTP Auth Endpoints Verified Successfully ---');
  } finally {
    server.close();
    await closeDB();
  }
}

runHttpAuthTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('HTTP Auth Test Failed:', err);
    process.exit(1);
  });
