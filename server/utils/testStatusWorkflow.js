import dotenv from 'dotenv';
dotenv.config();

process.env.RUN_AS_MODULE = 'true';
process.env.NODE_ENV = 'test';

import app from '../server.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Ticket from '../models/Ticket.js';
import TicketHistory from '../models/TicketHistory.js';
import Notification from '../models/Notification.js';
import { connectDB, closeDB } from '../config/db.js';
import { generateToken } from '../utils/jwt.js';
import { ROLES, TICKET_PRIORITY, TICKET_STATUS, HISTORY_ACTIONS, NOTIFICATION_TYPES } from '../config/constants.js';

async function runStatusWorkflowTests() {
  console.log('--- Starting Phase 7 Ticket Status Workflow Verification ---');
  await connectDB();

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  const timestamp = Date.now();
  const empEmail = `workflow_emp_${timestamp}@example.com`;
  const agentEmail = `workflow_agent_${timestamp}@example.com`;
  const adminEmail = `workflow_admin_${timestamp}@example.com`;

  try {
    // 1. Create Users
    const [emp, agent, admin] = await Promise.all([
      User.create({
        name: 'Workflow Employee',
        email: empEmail,
        password: 'Password123!',
        role: ROLES.EMPLOYEE,
        department: 'Engineering',
      }),
      User.create({
        name: 'Workflow Agent',
        email: agentEmail,
        password: 'Password123!',
        role: ROLES.AGENT,
        department: 'IT Support',
      }),
      User.create({
        name: 'Workflow Admin',
        email: adminEmail,
        password: 'Password123!',
        role: ROLES.ADMIN,
        department: 'Operations',
      }),
    ]);

    const empToken = generateToken(emp._id, emp.role);
    const agentToken = generateToken(agent._id, agent.role);
    const adminToken = generateToken(admin._id, admin.role);

    // 2. Create Category and Initial Ticket
    const category = await Category.create({
      name: `Database Access ${timestamp}`,
      description: 'Permissions for staging & production DB',
    });

    const ticket = await Ticket.create({
      ticketId: `TKT-WF-${timestamp.toString().slice(-4)}`,
      title: 'Need Read Replica PostgreSQL Access',
      description: 'Require read-only connection string for data analysis.',
      category: category._id,
      priority: TICKET_PRIORITY.MEDIUM,
      status: TICKET_STATUS.OPEN,
      createdBy: emp._id,
      sla: {
        responseDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
        resolutionDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
      },
    });

    // 3. Employee attempts illegal transition: OPEN -> RESOLVED (Must fail with 400)
    console.log('1. Testing Employee illegal transition OPEN -> RESOLVED (Expecting 400 Bad Request)...');
    const illegalRes = await fetch(`${baseUrl}/tickets/${ticket._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({ status: TICKET_STATUS.RESOLVED }),
    });
    const illegalData = await illegalRes.json();
    if (illegalRes.status !== 400) {
      throw new Error(`State machine violation: Illegal transition allowed! Status: ${illegalRes.status}`);
    }
    console.log(`[PASS] Illegal transition blocked: ${illegalData.message}`);

    // 4. Admin assigns ticket to Agent -> Status becomes ASSIGNED
    console.log('2. Admin assigning ticket to Agent...');
    const assignRes = await fetch(`${baseUrl}/tickets/${ticket._id}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ agentId: agent._id }),
    });
    const assignData = await assignRes.json();
    if (assignRes.status !== 200 || assignData.data.status !== TICKET_STATUS.ASSIGNED) {
      throw new Error('Assignment failed');
    }
    console.log(`[PASS] Ticket status moved to ASSIGNED`);

    // 5. Agent accepts ticket -> ASSIGNED -> IN_PROGRESS
    console.log('3. Agent accepting ticket: ASSIGNED -> IN_PROGRESS...');
    const acceptRes = await fetch(`${baseUrl}/tickets/${ticket._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agentToken}`,
      },
      body: JSON.stringify({ status: TICKET_STATUS.IN_PROGRESS }),
    });
    const acceptData = await acceptRes.json();
    if (acceptRes.status !== 200 || acceptData.data.status !== TICKET_STATUS.IN_PROGRESS) {
      throw new Error(`Accept transition failed: ${JSON.stringify(acceptData)}`);
    }
    if (!acceptData.data.sla.firstRespondedAt) {
      throw new Error('firstRespondedAt was not populated upon agent acceptance!');
    }
    console.log(`[PASS] Ticket status is IN_PROGRESS. firstRespondedAt recorded: ${acceptData.data.sla.firstRespondedAt}`);

    // 6. Agent sets status to PENDING (Awaiting Employee Info)
    console.log('4. Agent setting status: IN_PROGRESS -> PENDING...');
    const pendingRes = await fetch(`${baseUrl}/tickets/${ticket._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agentToken}`,
      },
      body: JSON.stringify({
        status: TICKET_STATUS.PENDING,
        reason: 'Awaiting user public SSH key',
      }),
    });
    const pendingData = await pendingRes.json();
    if (pendingRes.status !== 200 || pendingData.data.status !== TICKET_STATUS.PENDING) {
      throw new Error(`Pending transition failed: ${JSON.stringify(pendingData)}`);
    }
    console.log(`[PASS] Ticket status is PENDING`);

    // 7. Employee responds: PENDING -> IN_PROGRESS
    console.log('5. Employee updating status: PENDING -> IN_PROGRESS...');
    const resumeRes = await fetch(`${baseUrl}/tickets/${ticket._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({
        status: TICKET_STATUS.IN_PROGRESS,
        reason: 'SSH key uploaded to internal vault',
      }),
    });
    const resumeData = await resumeRes.json();
    if (resumeRes.status !== 200 || resumeData.data.status !== TICKET_STATUS.IN_PROGRESS) {
      throw new Error(`Resume transition failed: ${JSON.stringify(resumeData)}`);
    }
    console.log(`[PASS] Ticket resumed to IN_PROGRESS`);

    // 8. Agent resolves ticket: IN_PROGRESS -> RESOLVED
    console.log('6. Agent resolving ticket: IN_PROGRESS -> RESOLVED...');
    const resolveRes = await fetch(`${baseUrl}/tickets/${ticket._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agentToken}`,
      },
      body: JSON.stringify({
        status: TICKET_STATUS.RESOLVED,
        reason: 'Read replica access granted with role readonly_analyst',
      }),
    });
    const resolveData = await resolveRes.json();
    if (resolveRes.status !== 200 || resolveData.data.status !== TICKET_STATUS.RESOLVED) {
      throw new Error(`Resolve transition failed: ${JSON.stringify(resolveData)}`);
    }
    if (!resolveData.data.resolvedAt) {
      throw new Error('resolvedAt timestamp was not recorded upon resolution!');
    }
    console.log(`[PASS] Ticket status is RESOLVED. resolvedAt timestamp: ${resolveData.data.resolvedAt}`);

    // Verify Notification sent to Employee
    const resolveNotification = await Notification.findOne({
      recipient: emp._id,
      ticket: ticket._id,
      type: NOTIFICATION_TYPES.TICKET_RESOLVED,
    });
    if (!resolveNotification) throw new Error('Resolution notification not sent to Employee');
    console.log(`[PASS] Resolution notification confirmed for Employee: "${resolveNotification.title}"`);

    // 9. Employee confirms resolution: RESOLVED -> CLOSED
    console.log('7. Employee confirming closure: RESOLVED -> CLOSED...');
    const closeRes = await fetch(`${baseUrl}/tickets/${ticket._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({ status: TICKET_STATUS.CLOSED }),
    });
    const closeData = await closeRes.json();
    if (closeRes.status !== 200 || closeData.data.status !== TICKET_STATUS.CLOSED) {
      throw new Error(`Close transition failed: ${JSON.stringify(closeData)}`);
    }
    if (!closeData.data.closedAt) {
      throw new Error('closedAt timestamp was not recorded upon closure!');
    }
    console.log(`[PASS] Ticket status is CLOSED. closedAt timestamp: ${closeData.data.closedAt}`);

    // 10. Test Reopen Workflow on a second ticket
    console.log('8. Testing Reopen Workflow on a resolved ticket: RESOLVED -> REOPENED...');
    const ticket2 = await Ticket.create({
      ticketId: `TKT-REOPEN-${timestamp.toString().slice(-4)}`,
      title: 'Monitor resolution issue',
      description: 'Second display flickering',
      category: category._id,
      priority: TICKET_PRIORITY.LOW,
      status: TICKET_STATUS.RESOLVED,
      createdBy: emp._id,
      assignedTo: agent._id,
      resolvedAt: new Date(),
    });

    const reopenRes = await fetch(`${baseUrl}/tickets/${ticket2._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({
        status: TICKET_STATUS.REOPENED,
        reason: 'Display still blinks when plugged into USB-C hub',
      }),
    });
    const reopenData = await reopenRes.json();
    if (reopenRes.status !== 200 || reopenData.data.status !== TICKET_STATUS.REOPENED) {
      throw new Error(`Reopen transition failed: ${JSON.stringify(reopenData)}`);
    }
    if (reopenData.data.reopenedCount !== 1) {
      throw new Error(`Expected reopenedCount to be 1, got ${reopenData.data.reopenedCount}`);
    }
    console.log(`[PASS] Ticket successfully reopened. reopenedCount = 1`);

    // 11. Admin updates Priority: LOW -> CRITICAL
    console.log('9. Admin changing ticket priority & recalculating SLA: LOW -> CRITICAL...');
    const priorityRes = await fetch(`${baseUrl}/tickets/${ticket2._id}/priority`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ priority: TICKET_PRIORITY.CRITICAL }),
    });
    const priorityData = await priorityRes.json();
    if (priorityRes.status !== 200 || priorityData.data.priority !== TICKET_PRIORITY.CRITICAL) {
      throw new Error(`Priority update failed: ${JSON.stringify(priorityData)}`);
    }
    console.log(`[PASS] Priority updated to CRITICAL. SLA recalculated: ${priorityData.data.sla.responseDeadline}`);

    // Clean up
    await Ticket.deleteMany({ _id: { $in: [ticket._id, ticket2._id] } });
    await Category.deleteMany({ _id: category._id });
    await TicketHistory.deleteMany({ ticket: { $in: [ticket._id, ticket2._id] } });
    await Notification.deleteMany({ ticket: { $in: [ticket._id, ticket2._id] } });
    await User.deleteMany({ email: { $in: [empEmail, agentEmail, adminEmail] } });
    console.log('[PASS] Test fixtures cleaned up.');

    console.log('--- All Phase 7 Ticket Status Workflow Tests Successfully Passed ---');
  } finally {
    server.close();
    await closeDB();
  }
}

runStatusWorkflowTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Status Workflow Test Failed:', err);
    process.exit(1);
  });
