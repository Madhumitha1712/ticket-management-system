import dotenv from 'dotenv';
dotenv.config();

process.env.RUN_AS_MODULE = 'true';
process.env.NODE_ENV = 'test';

import app from '../server.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Ticket from '../models/Ticket.js';
import Feedback from '../models/Feedback.js';
import Notification from '../models/Notification.js';
import { closeDB } from '../config/db.js';
import { generateToken } from '../utils/jwt.js';
import { ROLES, TICKET_PRIORITY, TICKET_STATUS, NOTIFICATION_TYPES } from '../config/constants.js';

async function runNotificationFeedbackTests() {
  console.log('--- Starting Phase 11 & 12 Notifications & Feedback Verification ---');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  const timestamp = Date.now();
  const empEmail = `fb_emp_${timestamp}@example.com`;
  const agentEmail = `fb_agent_${timestamp}@example.com`;
  const adminEmail = `fb_admin_${timestamp}@example.com`;

  try {
    // 1. Create Users
    const [emp, agent, admin] = await Promise.all([
      User.create({
        name: 'Feedback Employee',
        email: empEmail,
        password: 'Password123!',
        role: ROLES.EMPLOYEE,
        department: 'Customer Service',
      }),
      User.create({
        name: 'Feedback Agent',
        email: agentEmail,
        password: 'Password123!',
        role: ROLES.AGENT,
        department: 'Tier 2 Support',
      }),
      User.create({
        name: 'Feedback Admin',
        email: adminEmail,
        password: 'Password123!',
        role: ROLES.ADMIN,
        department: 'Management',
      }),
    ]);

    const empToken = generateToken(emp._id, emp.role);
    const agentToken = generateToken(agent._id, agent.role);
    const adminToken = generateToken(admin._id, admin.role);

    // 2. Create Category and Resolved Ticket
    const category = await Category.create({
      name: `Software Installation ${timestamp}`,
      description: 'Software licensing & installation',
    });

    const ticket = await Ticket.create({
      ticketId: `TKT-FB-${timestamp.toString().slice(-4)}`,
      title: 'Request Figma Enterprise License',
      description: 'Need Figma account license for UI designer team.',
      category: category._id,
      priority: TICKET_PRIORITY.MEDIUM,
      status: TICKET_STATUS.RESOLVED,
      createdBy: emp._id,
      assignedTo: agent._id,
      resolvedAt: new Date(),
    });

    // 3. Test Notifications
    console.log('1. Testing Notifications API...');
    const notif1 = await Notification.create({
      recipient: emp._id,
      type: NOTIFICATION_TYPES.TICKET_RESOLVED,
      title: 'Ticket Resolved',
      message: 'Your ticket has been marked as resolved',
      ticket: ticket._id,
      isRead: false,
    });

    const notif2 = await Notification.create({
      recipient: emp._id,
      type: NOTIFICATION_TYPES.NEW_COMMENT,
      title: 'New Comment',
      message: 'Agent added comment',
      ticket: ticket._id,
      isRead: false,
    });

    // Fetch user notifications
    const notifRes = await fetch(`${baseUrl}/notifications`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    const notifData = await notifRes.json();
    if (notifRes.status !== 200 || notifData.unreadCount < 2) {
      throw new Error(`Notification fetch failed: ${JSON.stringify(notifData)}`);
    }
    console.log(`[PASS] Fetched notifications. Unread count: ${notifData.unreadCount}`);

    // Mark single notification as read
    const readSingleRes = await fetch(`${baseUrl}/notifications/${notif1._id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${empToken}` },
    });
    if (readSingleRes.status !== 200) throw new Error('Mark single read failed');
    console.log('[PASS] Single notification marked as read.');

    // Mark all as read
    const readAllRes = await fetch(`${baseUrl}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${empToken}` },
    });
    if (readAllRes.status !== 200) throw new Error('Mark all read failed');
    console.log('[PASS] All notifications marked as read.');

    // 4. Test Feedback Submission (Employee submits 5-star rating)
    console.log('2. Testing Employee submitting 5-star feedback on resolved ticket...');
    const fbRes = await fetch(`${baseUrl}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({
        ticketId: ticket._id.toString(),
        rating: 5,
        comment: 'Outstanding support! Figma license was provisioned in under 30 minutes.',
      }),
    });
    const fbData = await fbRes.json();
    if (fbRes.status !== 201 || fbData.data.rating !== 5) {
      throw new Error(`Feedback submission failed: ${JSON.stringify(fbData)}`);
    }
    console.log(`[PASS] Feedback submitted successfully. Rating: ${fbData.data.rating}/5`);

    // 5. Test Duplicate Feedback Submission (Must return 409 Conflict)
    console.log('3. Testing Duplicate Feedback Submission (Expecting 409 Conflict)...');
    const dupFbRes = await fetch(`${baseUrl}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({
        ticketId: ticket._id.toString(),
        rating: 4,
        comment: 'Second feedback attempt',
      }),
    });
    const dupFbData = await dupFbRes.json();
    if (dupFbRes.status !== 409) {
      throw new Error(`Duplicate feedback was allowed! Expected 409, got ${dupFbRes.status}`);
    }
    console.log(`[PASS] Duplicate feedback blocked with 409 Conflict: ${dupFbData.message}`);

    // 6. Test Invalid Rating Boundary (Rating = 7 must return 400)
    console.log('4. Testing Invalid Rating Boundary (Rating = 7, Expecting 400 Bad Request)...');
    const invalidRatingRes = await fetch(`${baseUrl}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({
        ticketId: ticket._id.toString(),
        rating: 7,
      }),
    });
    if (invalidRatingRes.status !== 400) {
      throw new Error(`Invalid rating was accepted! Status: ${invalidRatingRes.status}`);
    }
    console.log('[PASS] Rating > 5 correctly rejected with 400 Bad Request.');

    // 7. Test Agent submitting feedback (Expecting 403 Forbidden)
    console.log('5. Testing Agent submitting feedback (Expecting 403 Forbidden)...');
    const agentFbRes = await fetch(`${baseUrl}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agentToken}`,
      },
      body: JSON.stringify({
        ticketId: ticket._id.toString(),
        rating: 5,
      }),
    });
    if (agentFbRes.status !== 403) {
      throw new Error(`Agent was able to submit feedback! Status: ${agentFbRes.status}`);
    }
    console.log('[PASS] Agent blocked from submitting feedback with 403 Forbidden.');

    // 8. Test Agent / Admin querying Agent Performance Reviews
    console.log('6. Testing GET /api/feedback/agent/:agentId...');
    const agentPerfRes = await fetch(`${baseUrl}/feedback/agent/${agent._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const agentPerfData = await agentPerfRes.json();
    if (agentPerfRes.status !== 200 || agentPerfData.data.averageRating !== 5) {
      throw new Error(`Agent performance calculation failed: ${JSON.stringify(agentPerfData)}`);
    }
    console.log(`[PASS] Agent reviews aggregated: Avg Rating: ${agentPerfData.data.averageRating}, Total Reviews: ${agentPerfData.data.totalReviews}`);

    // Clean up
    await Ticket.deleteMany({ _id: ticket._id });
    await Category.deleteMany({ _id: category._id });
    await Feedback.deleteMany({ ticket: ticket._id });
    await Notification.deleteMany({ recipient: emp._id });
    await User.deleteMany({ email: { $in: [empEmail, agentEmail, adminEmail] } });
    console.log('[PASS] Test fixtures cleaned up.');

    console.log('--- All Phase 11 & 12 Notifications & Feedback Tests Successfully Passed ---');
  } finally {
    server.close();
    await closeDB();
  }
}

runNotificationFeedbackTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Notification & Feedback Test Failed:', err);
    process.exit(1);
  });
