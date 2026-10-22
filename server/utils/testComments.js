import dotenv from 'dotenv';
dotenv.config();

process.env.RUN_AS_MODULE = 'true';
process.env.NODE_ENV = 'test';

import app from '../server.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Ticket from '../models/Ticket.js';
import Comment from '../models/Comment.js';
import TicketHistory from '../models/TicketHistory.js';
import Notification from '../models/Notification.js';
import { closeDB } from '../config/db.js';
import { generateToken } from '../utils/jwt.js';
import { ROLES, TICKET_PRIORITY, TICKET_STATUS, NOTIFICATION_TYPES } from '../config/constants.js';

async function runCommentTests() {
  console.log('--- Starting Phase 8 Comments & Ticket History Verification ---');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  const timestamp = Date.now();
  const empEmail = `comment_emp_${timestamp}@example.com`;
  const otherEmpEmail = `other_emp_${timestamp}@example.com`;
  const agentEmail = `comment_agent_${timestamp}@example.com`;
  const adminEmail = `comment_admin_${timestamp}@example.com`;

  try {
    // 1. Create Users
    const [emp, otherEmp, agent, admin] = await Promise.all([
      User.create({
        name: 'Ticket Creator',
        email: empEmail,
        password: 'Password123!',
        role: ROLES.EMPLOYEE,
        department: 'Finance',
      }),
      User.create({
        name: 'Unrelated Employee',
        email: otherEmpEmail,
        password: 'Password123!',
        role: ROLES.EMPLOYEE,
        department: 'Marketing',
      }),
      User.create({
        name: 'Support Agent',
        email: agentEmail,
        password: 'Password123!',
        role: ROLES.AGENT,
        department: 'IT Desk',
      }),
      User.create({
        name: 'Admin Supervisor',
        email: adminEmail,
        password: 'Password123!',
        role: ROLES.ADMIN,
        department: 'IT Admin',
      }),
    ]);

    const empToken = generateToken(emp._id, emp.role);
    const otherEmpToken = generateToken(otherEmp._id, otherEmp.role);
    const agentToken = generateToken(agent._id, agent.role);
    const adminToken = generateToken(admin._id, admin.role);

    // 2. Create Category and Ticket
    const category = await Category.create({
      name: `Email Server ${timestamp}`,
      description: 'Exchange & Outlook mailboxes',
    });

    const ticket = await Ticket.create({
      ticketId: `TKT-CMT-${timestamp.toString().slice(-4)}`,
      title: 'Cannot receive external emails from clients',
      description: 'Incoming emails bounce back with error 550 Relay Access Denied',
      category: category._id,
      priority: TICKET_PRIORITY.HIGH,
      status: TICKET_STATUS.ASSIGNED,
      createdBy: emp._id,
      assignedTo: agent._id,
      sla: {
        responseDeadline: new Date(Date.now() + 30 * 60 * 1000),
        resolutionDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
      },
    });

    // 3. Employee posts a comment
    console.log('1. Testing Employee posting a comment...');
    const empCmtRes = await fetch(`${baseUrl}/tickets/${ticket._id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({
        message: 'Here is the bounce error code from our customer: 550 5.7.1',
      }),
    });
    const empCmtData = await empCmtRes.json();
    if (empCmtRes.status !== 201 || !empCmtData.data._id) {
      throw new Error(`Employee comment failed: ${JSON.stringify(empCmtData)}`);
    }
    console.log('[PASS] Employee posted comment successfully.');

    // Verify Agent received notification
    const agentNotif = await Notification.findOne({
      recipient: agent._id,
      ticket: ticket._id,
      type: NOTIFICATION_TYPES.NEW_COMMENT,
    });
    if (!agentNotif) throw new Error('Agent did not receive notification on employee comment');
    console.log(`[PASS] Agent notification generated: "${agentNotif.title}"`);

    // 4. Agent posts public response
    console.log('2. Testing Agent posting public reply...');
    const agentCmtRes = await fetch(`${baseUrl}/tickets/${ticket._id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agentToken}`,
      },
      body: JSON.stringify({
        message: 'We have updated the MX record whitelist. Please test receiving an email now.',
      }),
    });
    const agentCmtData = await agentCmtRes.json();
    if (agentCmtRes.status !== 201) throw new Error(`Agent comment failed: ${JSON.stringify(agentCmtData)}`);
    console.log('[PASS] Agent posted public response.');

    // 5. Agent posts an Internal Note (isInternal = true)
    console.log('3. Testing Agent posting an Internal Staff Note...');
    const internalCmtRes = await fetch(`${baseUrl}/tickets/${ticket._id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agentToken}`,
      },
      body: JSON.stringify({
        message: 'Internal note: Spamhaus DUL DNSBL was blocking customer IP range.',
        isInternal: true,
      }),
    });
    const internalCmtData = await internalCmtRes.json();
    if (internalCmtRes.status !== 201 || internalCmtData.data.isInternal !== true) {
      throw new Error('Internal note flag failed');
    }
    console.log('[PASS] Agent internal note posted successfully.');

    // 6. Employee queries comments (Should ONLY see the 2 public comments)
    console.log('4. Testing Employee comment visibility filter (Must NOT see internal note)...');
    const empViewCmtRes = await fetch(`${baseUrl}/tickets/${ticket._id}/comments`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    const empViewCmtData = await empViewCmtRes.json();
    if (empViewCmtRes.status !== 200 || empViewCmtData.data.length !== 2) {
      throw new Error(`Employee visibility leak! Expected 2 public comments, got ${empViewCmtData.data.length}`);
    }
    const hasInternalLeak = empViewCmtData.data.some((c) => c.isInternal === true);
    if (hasInternalLeak) throw new Error('Security Breach: Employee received internal staff note!');
    console.log('[PASS] Employee receives exactly 2 public comments; internal notes properly hidden.');

    // 7. Admin queries comments (Should see all 3 comments)
    console.log('5. Testing Admin comment visibility (Should see all 3 comments)...');
    const adminViewCmtRes = await fetch(`${baseUrl}/tickets/${ticket._id}/comments`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminViewCmtData = await adminViewCmtRes.json();
    if (adminViewCmtRes.status !== 200 || adminViewCmtData.data.length !== 3) {
      throw new Error(`Admin expected 3 comments, got ${adminViewCmtData.data.length}`);
    }
    console.log('[PASS] Admin successfully retrieved all 3 comments.');

    // 8. Unauthorized OtherEmployee attempts to comment -> MUST BE 403
    console.log('6. Testing Unauthorized Employee comment attempt (Expecting 403 Forbidden)...');
    const unauthorizedCmtRes = await fetch(`${baseUrl}/tickets/${ticket._id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${otherEmpToken}`,
      },
      body: JSON.stringify({ message: 'Can I access this?' }),
    });
    if (unauthorizedCmtRes.status !== 403) {
      throw new Error(`Security breach: Unauthorized user could post comments (status: ${unauthorizedCmtRes.status})`);
    }
    console.log('[PASS] Unauthorized comment attempt blocked with 403 Forbidden.');

    // 9. Unauthorized OtherEmployee attempts to view history -> MUST BE 403
    console.log('7. Testing Unauthorized Employee viewing history (Expecting 403 Forbidden)...');
    const unauthorizedHistRes = await fetch(`${baseUrl}/tickets/${ticket._id}/history`, {
      headers: { Authorization: `Bearer ${otherEmpToken}` },
    });
    if (unauthorizedHistRes.status !== 403) {
      throw new Error(`Security breach: Unauthorized user could view history (status: ${unauthorizedHistRes.status})`);
    }
    console.log('[PASS] Unauthorized history access blocked with 403 Forbidden.');

    // 10. Admin retrieves history log
    console.log('8. Testing Admin retrieving immutable ticket history log...');
    const histRes = await fetch(`${baseUrl}/tickets/${ticket._id}/history`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const histData = await histRes.json();
    if (histRes.status !== 200 || !Array.isArray(histData.data) || histData.data.length < 3) {
      throw new Error(`History retrieval failed: ${JSON.stringify(histData)}`);
    }
    console.log(`[PASS] Ticket history audit trail verified with ${histData.data.length} recorded events.`);

    // Clean up
    await Ticket.deleteMany({ _id: ticket._id });
    await Category.deleteMany({ _id: category._id });
    await Comment.deleteMany({ ticket: ticket._id });
    await TicketHistory.deleteMany({ ticket: ticket._id });
    await Notification.deleteMany({ ticket: ticket._id });
    await User.deleteMany({ email: { $in: [empEmail, otherEmpEmail, agentEmail, adminEmail] } });
    console.log('[PASS] Test fixtures cleaned up.');

    console.log('--- All Phase 8 Comments & Ticket History Tests Successfully Passed ---');
  } finally {
    server.close();
    await closeDB();
  }
}

runCommentTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Comment Test Failed:', err);
    process.exit(1);
  });
