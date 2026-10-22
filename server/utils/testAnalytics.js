import dotenv from 'dotenv';
dotenv.config();

process.env.RUN_AS_MODULE = 'true';
process.env.NODE_ENV = 'test';

import app from '../server.js';
import User from '../models/User.js';
import { seedDatabase } from '../seed/seedData.js';
import { closeDB } from '../config/db.js';
import { generateToken } from '../utils/jwt.js';

async function runAnalyticsTests() {
  console.log('--- Starting Phase 13 Admin APIs & Analytics Verification ---');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/analytics`;

  try {
    // 1. Seed Database with full demo dataset
    await seedDatabase();

    const [admin, agent1, emp1] = await Promise.all([
      User.findOne({ email: 'admin@example.com' }),
      User.findOne({ email: 'agent@example.com' }),
      User.findOne({ email: 'employee@example.com' }),
    ]);

    const adminToken = generateToken(admin._id, admin.role);
    const agentToken = generateToken(agent1._id, agent1.role);
    const empToken = generateToken(emp1._id, emp1.role);

    // 2. Admin Dashboard Analytics (GET /api/analytics/dashboard)
    console.log('1. Testing Admin Dashboard Analytics...');
    const adminDashRes = await fetch(`${baseUrl}/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminDashData = await adminDashRes.json();
    if (adminDashRes.status !== 200 || !adminDashData.data.summary) {
      throw new Error(`Admin analytics failed: ${JSON.stringify(adminDashData)}`);
    }
    const summary = adminDashData.data.summary;
    const charts = adminDashData.data.charts;
    console.log(`[PASS] Admin Metrics: Total Tickets=${summary.totalTickets}, Open=${summary.openTickets}, In-Progress=${summary.inProgressTickets}, Breached=${summary.breachedTickets}, SLA Compliance=${summary.slaComplianceRate}%, Avg Rating=${summary.avgRating}`);
    console.log(`[PASS] Admin Charts: Priority Breakdown (${charts.ticketsByPriority.length}), Status Breakdown (${charts.ticketsByStatus.length}), Category Breakdown (${charts.ticketsByCategory.length})`);

    // 3. Agent Dashboard Analytics (GET /api/analytics/dashboard)
    console.log('2. Testing Agent Dashboard Analytics (Scoped)...');
    const agentDashRes = await fetch(`${baseUrl}/dashboard`, {
      headers: { Authorization: `Bearer ${agentToken}` },
    });
    const agentDashData = await agentDashRes.json();
    if (agentDashRes.status !== 200 || !agentDashData.data.summary) {
      throw new Error(`Agent analytics failed: ${JSON.stringify(agentDashData)}`);
    }
    const agentSummary = agentDashData.data.summary;
    console.log(`[PASS] Agent Metrics: Assigned Total=${agentSummary.assignedTotal}, Active Queue=${agentSummary.activeQueue}, Avg Rating=${agentSummary.avgRating}`);

    // 4. Employee Dashboard Analytics (GET /api/analytics/dashboard)
    console.log('3. Testing Employee Dashboard Analytics (Scoped)...');
    const empDashRes = await fetch(`${baseUrl}/dashboard`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    const empDashData = await empDashRes.json();
    if (empDashRes.status !== 200 || !empDashData.data.summary) {
      throw new Error(`Employee analytics failed: ${JSON.stringify(empDashData)}`);
    }
    const empSummary = empDashData.data.summary;
    console.log(`[PASS] Employee Metrics: Total Raised=${empSummary.totalRaised}, Active Total=${empSummary.activeTotal}, Resolved=${empSummary.resolvedCount}`);

    // 5. Admin Agent Leaderboard (GET /api/analytics/agent-leaderboard)
    console.log('4. Testing Admin Agent Leaderboard...');
    const leaderboardRes = await fetch(`${baseUrl}/agent-leaderboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const leaderboardData = await leaderboardRes.json();
    if (leaderboardRes.status !== 200 || !Array.isArray(leaderboardData.data)) {
      throw new Error(`Leaderboard failed: ${JSON.stringify(leaderboardData)}`);
    }
    console.log(`[PASS] Leaderboard retrieved for ${leaderboardData.data.length} agents. Top Agent: ${leaderboardData.data[0].name} (Resolved: ${leaderboardData.data[0].resolved})`);

    // 6. Employee accessing Leaderboard -> MUST BE 403
    console.log('5. Testing Employee accessing Leaderboard (Expecting 403 Forbidden)...');
    const empLeadRes = await fetch(`${baseUrl}/agent-leaderboard`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    if (empLeadRes.status !== 403) {
      throw new Error(`Security breach: Employee was able to access leaderboard! (status: ${empLeadRes.status})`);
    }
    console.log('[PASS] Employee correctly blocked from Leaderboard with 403 Forbidden.');

    console.log('--- All Phase 13 Admin APIs & Analytics Tests Successfully Passed ---');
  } finally {
    server.close();
    await closeDB();
  }
}

runAnalyticsTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Analytics Test Failed:', err);
    process.exit(1);
  });
