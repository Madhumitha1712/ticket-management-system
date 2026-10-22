import dotenv from 'dotenv';
dotenv.config();

process.env.RUN_AS_MODULE = 'true';
process.env.NODE_ENV = 'test';

import app from '../server.js';
import User from '../models/User.js';
import { closeDB } from '../config/db.js';
import { generateToken } from '../utils/jwt.js';
import { ROLES } from '../config/constants.js';

async function runRbacTests() {
  console.log('--- Starting Phase 4 Role-Based Authorization Verification ---');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/users`;

  const timestamp = Date.now();
  const empEmail = `emp_${timestamp}@example.com`;
  const agentEmail = `agent_${timestamp}@example.com`;
  const adminEmail = `admin_${timestamp}@example.com`;

  try {
    // Create 3 persona users in DB
    const [empUser, agentUser, adminUser] = await Promise.all([
      User.create({
        name: 'Test Employee',
        email: empEmail,
        password: 'Password123!',
        role: ROLES.EMPLOYEE,
        department: 'Finance',
      }),
      User.create({
        name: 'Test Support Agent',
        email: agentEmail,
        password: 'Password123!',
        role: ROLES.AGENT,
        department: 'IT Support',
      }),
      User.create({
        name: 'Test Administrator',
        email: adminEmail,
        password: 'Password123!',
        role: ROLES.ADMIN,
        department: 'IT Management',
      }),
    ]);

    const empToken = generateToken(empUser._id, empUser.role);
    const agentToken = generateToken(agentUser._id, agentUser.role);
    const adminToken = generateToken(adminUser._id, adminUser.role);

    // 1. Employee accessing admin users list -> MUST BE 403
    console.log('1. Testing Employee accessing GET /api/users (Expecting 403 Forbidden)...');
    const empUsersRes = await fetch(`${baseUrl}`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    const empUsersData = await empUsersRes.json();
    if (empUsersRes.status !== 403) {
      throw new Error(`Security breach: Employee received status ${empUsersRes.status} on admin route`);
    }
    console.log(`[PASS] Employee blocked: ${empUsersData.message}`);

    // 2. Agent accessing admin users list -> MUST BE 403
    console.log('2. Testing Agent accessing GET /api/users (Expecting 403 Forbidden)...');
    const agentUsersRes = await fetch(`${baseUrl}`, {
      headers: { Authorization: `Bearer ${agentToken}` },
    });
    const agentUsersData = await agentUsersRes.json();
    if (agentUsersRes.status !== 403) {
      throw new Error(`Security breach: Agent received status ${agentUsersRes.status} on admin route`);
    }
    console.log(`[PASS] Agent blocked: ${agentUsersData.message}`);

    // 3. Employee accessing POST /api/users -> MUST BE 403
    console.log('3. Testing Employee accessing POST /api/users (Expecting 403 Forbidden)...');
    const empCreateRes = await fetch(`${baseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({
        name: 'Hacked User',
        email: `hack_${timestamp}@example.com`,
        password: 'Password123!',
        role: 'ADMIN',
        department: 'Security',
      }),
    });
    if (empCreateRes.status !== 403) {
      throw new Error(`Security breach: Employee was able to invoke POST /api/users (status ${empCreateRes.status})`);
    }
    console.log('[PASS] Employee creation attempt blocked with 403 Forbidden.');

    // 4. Employee accessing GET /api/users/agents -> MUST BE 403
    console.log('4. Testing Employee accessing GET /api/users/agents (Expecting 403 Forbidden)...');
    const empAgentsRes = await fetch(`${baseUrl}/agents`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    if (empAgentsRes.status !== 403) {
      throw new Error(`Security breach: Employee accessed agents list (status ${empAgentsRes.status})`);
    }
    console.log('[PASS] Employee blocked from viewing support agents list.');

    // 5. Agent accessing GET /api/users/agents -> MUST BE 200 OK
    console.log('5. Testing Agent accessing GET /api/users/agents (Expecting 200 OK)...');
    const agentAgentsRes = await fetch(`${baseUrl}/agents`, {
      headers: { Authorization: `Bearer ${agentToken}` },
    });
    const agentAgentsData = await agentAgentsRes.json();
    if (agentAgentsRes.status !== 200 || !Array.isArray(agentAgentsData.data)) {
      throw new Error(`Agent failed to retrieve agents list: ${JSON.stringify(agentAgentsData)}`);
    }
    console.log(`[PASS] Agent successfully retrieved agents list (${agentAgentsData.data.length} active agent(s)).`);

    // 6. Admin accessing GET /api/users -> MUST BE 200 OK
    console.log('6. Testing Admin accessing GET /api/users (Expecting 200 OK)...');
    const adminUsersRes = await fetch(`${baseUrl}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminUsersData = await adminUsersRes.json();
    if (adminUsersRes.status !== 200 || !Array.isArray(adminUsersData.data)) {
      throw new Error(`Admin failed to get users list: ${JSON.stringify(adminUsersData)}`);
    }
    console.log(`[PASS] Admin successfully retrieved full user roster (${adminUsersData.data.length} users).`);

    // 7. Admin creating new AGENT user via POST /api/users -> MUST BE 201 Created
    console.log('7. Testing Admin creating new Agent via POST /api/users (Expecting 201 Created)...');
    const newAgentEmail = `newagent_${timestamp}@example.com`;
    const adminCreateRes = await fetch(`${baseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'New Assigned Agent',
        email: newAgentEmail,
        password: 'Password123!',
        role: ROLES.AGENT,
        department: 'Infrastructure',
      }),
    });
    const adminCreateData = await adminCreateRes.json();
    if (adminCreateRes.status !== 201 || adminCreateData.data.role !== ROLES.AGENT) {
      throw new Error(`Admin user creation failed: ${JSON.stringify(adminCreateData)}`);
    }
    console.log(`[PASS] Admin created Agent with ID: ${adminCreateData.data._id}`);

    // Clean up created users
    await User.deleteMany({
      email: { $in: [empEmail, agentEmail, adminEmail, newAgentEmail] },
    });
    console.log('[PASS] Test users cleaned up.');

    console.log('--- All Phase 4 Role-Based Authorization Tests Successfully Passed ---');
  } finally {
    server.close();
    await closeDB();
  }
}

runRbacTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('RBAC Test Failed:', err);
    process.exit(1);
  });
