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
import { closeDB } from '../config/db.js';
import { generateToken } from '../utils/jwt.js';
import { ROLES, TICKET_PRIORITY, TICKET_STATUS, HISTORY_ACTIONS, NOTIFICATION_TYPES } from '../config/constants.js';

async function runAssignmentTests() {
  console.log('--- Starting Phase 6 Ticket Assignment Verification ---');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  const timestamp = Date.now();
  const empEmail = `emp_${timestamp}@example.com`;
  const agent1Email = `agent1_${timestamp}@example.com`;
  const agent2Email = `agent2_${timestamp}@example.com`;
  const adminEmail = `admin_${timestamp}@example.com`;

  try {
    // 1. Create Users
    const [emp, agent1, agent2, admin] = await Promise.all([
      User.create({
        name: 'Jane Employee',
        email: empEmail,
        password: 'Password123!',
        role: ROLES.EMPLOYEE,
        department: 'Operations',
      }),
      User.create({
        name: 'Agent Smith',
        email: agent1Email,
        password: 'Password123!',
        role: ROLES.AGENT,
        department: 'Tier 1 Support',
      }),
      User.create({
        name: 'Agent Jones',
        email: agent2Email,
        password: 'Password123!',
        role: ROLES.AGENT,
        department: 'Tier 2 Support',
      }),
      User.create({
        name: 'System Admin',
        email: adminEmail,
        password: 'Password123!',
        role: ROLES.ADMIN,
        department: 'IT Ops',
      }),
    ]);

    const empToken = generateToken(emp._id, emp.role);
    const agent1Token = generateToken(agent1._id, agent1.role);
    const agent2Token = generateToken(agent2._id, agent2.role);
    const adminToken = generateToken(admin._id, admin.role);

    // 2. Create Category and Ticket
    const category = await Category.create({
      name: `Network Issue ${timestamp}`,
      description: 'VPN and WiFi connectivity',
    });

    const ticket = await Ticket.create({
      ticketId: `TKT-${timestamp.toString().slice(-4)}`,
      title: 'VPN Connection timed out',
      description: 'Unable to connect to internal staging cluster via WireGuard.',
      category: category._id,
      priority: TICKET_PRIORITY.CRITICAL,
      status: TICKET_STATUS.OPEN,
      createdBy: emp._id,
    });

    // 3. Employee attempts to assign ticket -> MUST BE 403
    console.log('1. Testing Employee attempting to assign ticket (Expecting 403 Forbidden)...');
    const empAssignRes = await fetch(`${baseUrl}/tickets/${ticket._id}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({ agentId: agent1._id }),
    });
    if (empAssignRes.status !== 403) {
      throw new Error(`Security breach: Employee was able to assign ticket! Status: ${empAssignRes.status}`);
    }
    console.log('[PASS] Employee blocked from ticket assignment with 403 Forbidden.');

    // 4. Agent attempts to assign ticket -> MUST BE 403
    console.log('2. Testing Agent attempting to assign ticket (Expecting 403 Forbidden)...');
    const agentAssignRes = await fetch(`${baseUrl}/tickets/${ticket._id}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agent1Token}`,
      },
      body: JSON.stringify({ agentId: agent1._id }),
    });
    if (agentAssignRes.status !== 403) {
      throw new Error(`Security breach: Agent was able to assign ticket! Status: ${agentAssignRes.status}`);
    }
    console.log('[PASS] Agent blocked from ticket assignment with 403 Forbidden.');

    // 5. Admin assigns ticket to Agent 1 -> MUST BE 200 OK
    console.log('3. Testing Admin assigning ticket to Agent 1 (Expecting 200 OK)...');
    const adminAssignRes = await fetch(`${baseUrl}/tickets/${ticket._id}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ agentId: agent1._id }),
    });
    const adminAssignData = await adminAssignRes.json();
    if (adminAssignRes.status !== 200 || adminAssignData.data.status !== TICKET_STATUS.ASSIGNED) {
      throw new Error(`Admin assignment failed: ${JSON.stringify(adminAssignData)}`);
    }
    console.log(`[PASS] Ticket assigned to Agent 1. Status updated to: ${adminAssignData.data.status}`);

    // 6. Verify Agent 1 can now access the ticket details
    console.log('4. Testing Agent 1 accessing assigned ticket details...');
    const agentViewRes = await fetch(`${baseUrl}/tickets/${ticket._id}`, {
      headers: { Authorization: `Bearer ${agent1Token}` },
    });
    const agentViewData = await agentViewRes.json();
    if (agentViewRes.status !== 200 || agentViewData.data.assignedTo._id !== agent1._id.toString()) {
      throw new Error(`Agent 1 could not access assigned ticket`);
    }
    console.log('[PASS] Agent 1 granted access to assigned ticket details.');

    // 7. Verify Notification and History in DB
    console.log('5. Verifying DB Notification & TicketHistory for Agent 1...');
    const agentNotification = await Notification.findOne({
      recipient: agent1._id,
      ticket: ticket._id,
      type: NOTIFICATION_TYPES.TICKET_ASSIGNED,
    });
    if (!agentNotification) throw new Error('Assignment notification was not generated for Agent 1');
    console.log(`[PASS] In-app notification generated for Agent 1: "${agentNotification.title}"`);

    const historyRecord = await TicketHistory.findOne({
      ticket: ticket._id,
      action: HISTORY_ACTIONS.ASSIGNED,
    });
    if (!historyRecord) throw new Error('TicketHistory ASSIGNED action was not found');
    console.log(`[PASS] TicketHistory audit recorded: ${historyRecord.details}`);

    // 8. Admin reassigns ticket to Agent 2
    console.log('6. Testing Admin reassigning ticket to Agent 2...');
    const reassignRes = await fetch(`${baseUrl}/tickets/${ticket._id}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ agentId: agent2._id }),
    });
    const reassignData = await reassignRes.json();
    if (reassignRes.status !== 200 || reassignData.data.assignedTo._id !== agent2._id.toString()) {
      throw new Error(`Reassignment failed: ${JSON.stringify(reassignData)}`);
    }

    const reassignHistory = await TicketHistory.findOne({
      ticket: ticket._id,
      action: HISTORY_ACTIONS.REASSIGNED,
    });
    if (!reassignHistory) throw new Error('TicketHistory REASSIGNED action was not recorded');
    console.log(`[PASS] Reassignment recorded in audit history: ${reassignHistory.details}`);

    // Clean up
    await Ticket.deleteMany({ _id: ticket._id });
    await Category.deleteMany({ _id: category._id });
    await TicketHistory.deleteMany({ ticket: ticket._id });
    await Notification.deleteMany({ ticket: ticket._id });
    await User.deleteMany({ email: { $in: [empEmail, agent1Email, agent2Email, adminEmail] } });
    console.log('[PASS] Test fixtures cleaned up.');

    console.log('--- All Phase 6 Ticket Assignment Tests Successfully Passed ---');
  } finally {
    server.close();
    await closeDB();
  }
}

runAssignmentTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Assignment Test Failed:', err);
    process.exit(1);
  });
