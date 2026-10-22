import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../server.js';
import { connectDB, closeDB } from '../config/db.js';
import {
  User,
  Category,
  SLARule,
  Ticket,
  Comment,
  TicketHistory,
  Notification,
  Feedback,
} from '../models/index.js';
import {
  ROLES,
  TICKET_STATUS,
  TICKET_PRIORITY,
  SLA_STATUS,
  DEFAULT_SLA_RULES,
} from '../config/constants.js';

let server;
let baseUrl;

let adminToken;
let agentToken;
let employeeToken;

let testCategory;
let testTicketId;
let testTicketDbId;
let agentUserId;
let employeeUserId;

before(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();

  // Clean test database
  await Promise.all([
    User.deleteMany(),
    Category.deleteMany(),
    SLARule.deleteMany(),
    Ticket.deleteMany(),
    Comment.deleteMany(),
    TicketHistory.deleteMany(),
    Notification.deleteMany(),
    Feedback.deleteMany(),
  ]);

  // Seed default SLA Rules
  await SLARule.insertMany(DEFAULT_SLA_RULES);

  // Start HTTP server on dynamic port
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}/api`;
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await closeDB();
});

describe('Enterprise Ticket System: E2E Integration Suite', () => {
  test('1. System Health Check', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.status, 'online');
  });

  test('2. User Registration & Authentication for All Roles', async () => {
    // 2.1 Register Admin
    const adminRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Chief Admin',
        email: 'admin_test@example.com',
        password: 'Password123!',
        role: ROLES.ADMIN,
        department: 'Operations',
      }),
    });
    assert.equal(adminRes.status, 201);
    const adminData = await adminRes.json();
    assert.equal(adminData.success, true);
    assert.equal(adminData.data.user.role, ROLES.ADMIN);
    adminToken = adminData.data.token;
    assert.ok(adminToken);

    // 2.2 Register Agent
    const agentRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Support Agent Bob',
        email: 'agent_test@example.com',
        password: 'Password123!',
        role: ROLES.AGENT,
        department: 'IT Desk',
      }),
    });
    assert.equal(agentRes.status, 201);
    const agentData = await agentRes.json();
    assert.equal(agentData.success, true);
    assert.equal(agentData.data.user.role, ROLES.AGENT);
    agentToken = agentData.data.token;
    agentUserId = agentData.data.user._id || agentData.data.user.id;
    assert.ok(agentToken);
    assert.ok(agentUserId);

    // 2.3 Register Employee
    const empRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Employee Alice',
        email: 'employee_test@example.com',
        password: 'Password123!',
        role: ROLES.EMPLOYEE,
        department: 'Engineering',
      }),
    });
    assert.equal(empRes.status, 201);
    const empData = await empRes.json();
    assert.equal(empData.success, true);
    assert.equal(empData.data.user.role, ROLES.EMPLOYEE);
    employeeToken = empData.data.token;
    employeeUserId = empData.data.user._id || empData.data.user.id;
    assert.ok(employeeToken);
    assert.ok(employeeUserId);
  });

  test('3. Role-Based Access Control (RBAC) Security Verification', async () => {
    // 3.1 Employee attempts to access Admin User Management -> MUST return 403
    const forbiddenRes1 = await fetch(`${baseUrl}/users`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    assert.equal(forbiddenRes1.status, 403);

    // 3.2 Agent attempts to create a Category -> MUST return 403
    const forbiddenRes2 = await fetch(`${baseUrl}/categories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${agentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Unauthorized Category' }),
    });
    assert.equal(forbiddenRes2.status, 403);

    // 3.3 Admin successfully creates a Category -> 201
    const createCatRes = await fetch(`${baseUrl}/categories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Cloud Infrastructure',
        description: 'AWS / GCP / Kubernetes server incidents',
      }),
    });
    assert.equal(createCatRes.status, 201);
    const catData = await createCatRes.json();
    testCategory = catData.data;
    assert.equal(testCategory.name, 'Cloud Infrastructure');
  });

  test('4. Ticket Creation with SLA Auto-Calculation', async () => {
    // Employee raises a HIGH priority ticket
    const createTicketRes = await fetch(`${baseUrl}/tickets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${employeeToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Production Database High CPU Usage & Latency',
        description: 'Database query execution time has exceeded 5000ms threshold.',
        category: testCategory._id,
        priority: TICKET_PRIORITY.HIGH,
      }),
    });
    assert.equal(createTicketRes.status, 201);
    const ticketData = await createTicketRes.json();
    assert.equal(ticketData.success, true);
    assert.equal(ticketData.data.status, TICKET_STATUS.OPEN);
    assert.ok(ticketData.data.ticketId.startsWith('TKT-'));
    assert.ok(ticketData.data.sla.resolutionDeadline);
    assert.ok(ticketData.data.sla.responseDeadline);
    assert.equal(ticketData.data.sla.isBreached, false);

    testTicketId = ticketData.data.ticketId;
    testTicketDbId = ticketData.data._id;
  });

  test('5. Ticket Assignment & Audit Log History', async () => {
    // Admin assigns ticket to Agent Bob
    const assignRes = await fetch(`${baseUrl}/tickets/${testTicketDbId}/assign`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assignedTo: agentUserId,
      }),
    });
    assert.equal(assignRes.status, 200);
    const assignedData = await assignRes.json();
    assert.equal(assignedData.data.status, TICKET_STATUS.ASSIGNED);
    assert.equal(assignedData.data.assignedTo._id.toString(), agentUserId.toString());

    // Verify Notification was dispatched to Agent Bob
    const notifRes = await fetch(`${baseUrl}/notifications`, {
      headers: { Authorization: `Bearer ${agentToken}` },
    });
    assert.equal(notifRes.status, 200);
    const notifData = await notifRes.json();
    assert.ok(notifData.data.length > 0);
    assert.equal(notifData.data[0].type, 'TICKET_ASSIGNED');
  });

  test('6. Ticket State Machine Transitions: ASSIGNED -> IN_PROGRESS', async () => {
    // Agent Bob acknowledges and transitions status to IN_PROGRESS
    const progressRes = await fetch(`${baseUrl}/tickets/${testTicketDbId}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${agentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: TICKET_STATUS.IN_PROGRESS,
      }),
    });
    assert.equal(progressRes.status, 200);
    const progressData = await progressRes.json();
    assert.equal(progressData.data.status, TICKET_STATUS.IN_PROGRESS);
  });

  test('7. Comments & Internal Staff Notes Privacy Isolation', async () => {
    // 7.1 Agent adds an INTERNAL staff note
    const staffNoteRes = await fetch(`${baseUrl}/tickets/${testTicketDbId}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${agentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Internal note: Suspect index scan regression on accounts table.',
        isInternal: true,
      }),
    });
    assert.equal(staffNoteRes.status, 201);

    // 7.2 Agent adds a PUBLIC comment for the customer
    const publicCommentRes = await fetch(`${baseUrl}/tickets/${testTicketDbId}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${agentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello Alice, we have identified the query lock and are deploying an index optimization patch.',
        isInternal: false,
      }),
    });
    assert.equal(publicCommentRes.status, 201);

    // 7.3 Employee reads comments -> Internal note MUST be excluded
    const empCommentsRes = await fetch(`${baseUrl}/tickets/${testTicketDbId}/comments`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    assert.equal(empCommentsRes.status, 200);
    const empCommentsData = await empCommentsRes.json();
    const commentsForEmp = empCommentsData.data;
    assert.equal(commentsForEmp.length, 1);
    assert.equal(commentsForEmp[0].isInternal, false);
    assert.ok(commentsForEmp[0].message.includes('Hello Alice'));

    // 7.4 Agent reads comments -> Internal note MUST be included
    const agentCommentsRes = await fetch(`${baseUrl}/tickets/${testTicketDbId}/comments`, {
      headers: { Authorization: `Bearer ${agentToken}` },
    });
    assert.equal(agentCommentsRes.status, 200);
    const agentCommentsData = await agentCommentsRes.json();
    assert.equal(agentCommentsData.data.length, 2);
  });

  test('8. Ticket Resolution & SLA Compliance Capture', async () => {
    // Agent marks ticket as RESOLVED with resolution notes
    const resolveRes = await fetch(`${baseUrl}/tickets/${testTicketDbId}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${agentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: TICKET_STATUS.RESOLVED,
        resolutionNotes: 'Added composite btree index to accounts(tenant_id, created_at). CPU returned to 8%.',
      }),
    });
    assert.equal(resolveRes.status, 200);
    const resolveData = await resolveRes.json();
    assert.equal(resolveData.data.status, TICKET_STATUS.RESOLVED);
    assert.ok(resolveData.data.resolvedAt);
    assert.equal(resolveData.data.sla.resolutionStatus, SLA_STATUS.MET);
  });

  test('9. Employee Feedback & Star Rating Collection', async () => {
    // Employee marks ticket as CLOSED and leaves 5-star rating with review
    const closeRes = await fetch(`${baseUrl}/tickets/${testTicketDbId}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${employeeToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: TICKET_STATUS.CLOSED,
      }),
    });
    assert.equal(closeRes.status, 200);

    const feedbackRes = await fetch(`${baseUrl}/feedback`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${employeeToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticketId: testTicketDbId,
        rating: 5,
        comment: 'Outstanding support and rapid resolution of the production incident!',
      }),
    });
    assert.equal(feedbackRes.status, 201);
    const feedbackData = await feedbackRes.json();
    assert.equal(feedbackData.success, true);
    assert.equal(feedbackData.data.rating, 5);

    // Duplicate feedback prevention test -> Must return 409
    const dupRes = await fetch(`${baseUrl}/feedback`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${employeeToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticketId: testTicketDbId,
        rating: 4,
      }),
    });
    assert.equal(dupRes.status, 409);
  });

  test('10. Admin Analytics & Agent Leaderboard Verification', async () => {
    // 10.1 Admin Dashboard Analytics
    const analyticsRes = await fetch(`${baseUrl}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(analyticsRes.status, 200);
    const analyticsData = await analyticsRes.json();
    assert.equal(analyticsData.success, true);
    const summary = analyticsData.data.summary;
    assert.equal(summary.totalTickets, 1);
    assert.equal(summary.closedTickets, 1);
    assert.equal(summary.avgRating, 5.0);
    assert.equal(summary.slaComplianceRate, 100);

    // 10.2 Agent Leaderboard
    const leaderboardRes = await fetch(`${baseUrl}/analytics/agent-leaderboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(leaderboardRes.status, 200);
    const leaderboardData = await leaderboardRes.json();
    assert.equal(leaderboardData.success, true);
    assert.ok(leaderboardData.data.length > 0);
    const bob = leaderboardData.data.find((a) => a._id.toString() === agentUserId.toString());
    assert.ok(bob);
    assert.equal(bob.resolved, 1);
    assert.equal(bob.avgRating, 5.0);
    assert.equal(bob.totalReviews, 1);
  });
});
