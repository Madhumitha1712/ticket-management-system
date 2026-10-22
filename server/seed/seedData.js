import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
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
  HISTORY_ACTIONS,
  NOTIFICATION_TYPES,
  DEFAULT_SLA_RULES,
} from '../config/constants.js';

export const seedDatabase = async () => {
  console.log('--- Starting Enterprise Database Seeding ---');
  await connectDB();

  // Clear existing collections
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
  console.log('[Seed] Cleared existing data.');

  // 1. Seed SLA Rules
  const slaRules = await SLARule.insertMany(DEFAULT_SLA_RULES);
  const slaMap = {};
  slaRules.forEach((r) => {
    slaMap[r.priority] = r;
  });
  console.log(`[Seed] Seeded ${slaRules.length} SLA rules.`);

  // 2. Seed Simple, Real-World Categories
  const categories = await Category.insertMany([
    { name: 'Hardware', description: 'Laptops, monitors, mouse, keyboard, and printer issues' },
    { name: 'Software', description: 'Workplace apps, licenses, installation, and app errors' },
    { name: 'Internet & Wi-Fi', description: 'Office Wi-Fi, VPN connectivity, and network problems' },
    { name: 'Accounts & Passwords', description: 'Password resets, account lockouts, and access permissions' },
    { name: 'Email & Communication', description: 'Outlook, Slack, Teams, and email delivery issues' },
  ]);
  console.log(`[Seed] Seeded ${categories.length} categories.`);

  // 3. Seed Primary Demo Users
  const adminUser = await User.create({
    name: 'Admin Supervisor',
    email: 'admin@example.com',
    password: 'Admin123!',
    role: ROLES.ADMIN,
    department: 'IT Operations Management',
    phone: '+1 (555) 010-0001',
    isActive: true,
  });

  const agent1 = await User.create({
    name: 'Alex Rivera (IT Support)',
    email: 'agent@example.com',
    password: 'Agent123!',
    role: ROLES.AGENT,
    department: 'IT Service Desk',
    phone: '+1 (555) 010-0002',
    isActive: true,
  });

  const agent2 = await User.create({
    name: 'Sarah Connor (IT Support)',
    email: 'agent2@example.com',
    password: 'Agent123!',
    role: ROLES.AGENT,
    department: 'Technical Support',
    phone: '+1 (555) 010-0003',
    isActive: true,
  });

  const employee1 = await User.create({
    name: 'Emily Davis',
    email: 'employee@example.com',
    password: 'Employee123!',
    role: ROLES.EMPLOYEE,
    department: 'Marketing & Sales',
    phone: '+1 (555) 010-0004',
    isActive: true,
  });

  const employee2 = await User.create({
    name: 'Marcus Johnson',
    email: 'employee2@example.com',
    password: 'Employee123!',
    role: ROLES.EMPLOYEE,
    department: 'Finance & Accounts',
    phone: '+1 (555) 010-0005',
    isActive: true,
  });

  console.log('[Seed] Seeded 5 primary demo accounts across all 3 roles.');

  const now = new Date();

  // 4. Seed Simple, Intuitive Everyday Tickets
  
  // Ticket 1: OPEN High Priority (Wi-Fi issue)
  const tkt1 = await Ticket.create({
    ticketId: 'TKT-1001',
    title: 'Cannot connect to office Wi-Fi network',
    description: 'My laptop says "No Internet Access" when connecting to the office Wi-Fi in Conference Room B.',
    category: categories[2]._id, // Internet & Wi-Fi
    priority: TICKET_PRIORITY.HIGH,
    status: TICKET_STATUS.OPEN,
    createdBy: employee1._id,
    assignedTo: null,
    sla: {
      rule: slaMap[TICKET_PRIORITY.HIGH]._id,
      responseDeadline: new Date(now.getTime() + 30 * 60 * 1000),
      resolutionDeadline: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      responseStatus: SLA_STATUS.PENDING,
      resolutionStatus: SLA_STATUS.PENDING,
    },
  });

  // Ticket 2: IN_PROGRESS Critical (Billing software crash)
  const tkt2 = await Ticket.create({
    ticketId: 'TKT-1002',
    title: 'Billing software is crashing on startup',
    description: 'The invoice billing application closes immediately when trying to generate monthly client receipts.',
    category: categories[1]._id, // Software
    priority: TICKET_PRIORITY.CRITICAL,
    status: TICKET_STATUS.IN_PROGRESS,
    createdBy: employee1._id,
    assignedTo: agent1._id,
    createdAt: new Date(now.getTime() - 40 * 60 * 1000),
    sla: {
      rule: slaMap[TICKET_PRIORITY.CRITICAL]._id,
      responseDeadline: new Date(now.getTime() - 25 * 60 * 1000),
      resolutionDeadline: new Date(now.getTime() + 80 * 60 * 1000),
      firstRespondedAt: new Date(now.getTime() - 30 * 60 * 1000),
      responseStatus: SLA_STATUS.MET,
      resolutionStatus: SLA_STATUS.PENDING,
      warningTriggered: false,
    },
  });

  // Ticket 3: PENDING Medium (Hardware request - waiting for info)
  const tkt3 = await Ticket.create({
    ticketId: 'TKT-1003',
    title: 'Request for a second computer monitor',
    description: 'I need a second monitor for my desk to view financial spreadsheets side-by-side.',
    category: categories[0]._id, // Hardware
    priority: TICKET_PRIORITY.MEDIUM,
    status: TICKET_STATUS.PENDING,
    createdBy: employee2._id,
    assignedTo: agent2._id,
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    sla: {
      rule: slaMap[TICKET_PRIORITY.MEDIUM]._id,
      responseDeadline: new Date(now.getTime()),
      resolutionDeadline: new Date(now.getTime() + 10 * 60 * 60 * 1000),
      firstRespondedAt: new Date(now.getTime() - 90 * 60 * 1000),
      responseStatus: SLA_STATUS.MET,
      resolutionStatus: SLA_STATUS.PENDING,
    },
  });

  // Ticket 4: RESOLVED & CLOSED (Mouse replacement - with 5-star rating)
  const tkt4 = await Ticket.create({
    ticketId: 'TKT-1004',
    title: 'Replacement needed for broken wireless mouse',
    description: 'The scroll wheel on my wireless mouse broke down and is no longer responding.',
    category: categories[0]._id, // Hardware
    priority: TICKET_PRIORITY.LOW,
    status: TICKET_STATUS.CLOSED,
    createdBy: employee1._id,
    assignedTo: agent1._id,
    createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    resolvedAt: new Date(now.getTime() - 20 * 60 * 60 * 1000),
    closedAt: new Date(now.getTime() - 18 * 60 * 60 * 1000),
    sla: {
      rule: slaMap[TICKET_PRIORITY.LOW]._id,
      responseDeadline: new Date(now.getTime() - 20 * 60 * 60 * 1000),
      resolutionDeadline: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      firstRespondedAt: new Date(now.getTime() - 23 * 60 * 60 * 1000),
      responseStatus: SLA_STATUS.MET,
      resolutionStatus: SLA_STATUS.MET,
    },
  });

  // Ticket 5: SLA BREACHED & ESCALATED (Company email outage past deadline)
  const tkt5 = await Ticket.create({
    ticketId: 'TKT-1005',
    title: 'Company email server is not receiving external emails',
    description: 'External clients are getting bounced email messages. No incoming emails have arrived since this morning.',
    category: categories[4]._id, // Email & Communication
    priority: TICKET_PRIORITY.CRITICAL,
    status: TICKET_STATUS.IN_PROGRESS,
    createdBy: employee2._id,
    assignedTo: agent2._id,
    createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
    sla: {
      rule: slaMap[TICKET_PRIORITY.CRITICAL]._id,
      responseDeadline: new Date(now.getTime() - 3.75 * 60 * 60 * 1000),
      resolutionDeadline: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Breached 2 hours ago
      firstRespondedAt: new Date(now.getTime() - 3.5 * 60 * 60 * 1000),
      responseStatus: SLA_STATUS.MET,
      resolutionStatus: SLA_STATUS.BREACHED,
      warningTriggered: true,
      isBreached: true,
    },
    escalation: {
      isEscalated: true,
      escalatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      reason: 'SLA Resolution Deadline Exceeded',
    },
  });

  console.log('[Seed] Seeded 5 simple, understandable tickets.');

  // 5. Seed Clear Discussion Comments & Staff Notes
  await Comment.create({
    ticket: tkt2._id,
    user: agent1._id,
    message: 'We have identified a corrupted update file and are rolling out a fix right now.',
    isInternal: false,
    createdAt: new Date(now.getTime() - 30 * 60 * 1000),
  });

  await Comment.create({
    ticket: tkt2._id,
    user: agent1._id,
    message: 'Staff Note: The issue was caused by the v2.4 patch. Re-indexing the cache solved it.',
    isInternal: true,
    createdAt: new Date(now.getTime() - 25 * 60 * 1000),
  });

  await Comment.create({
    ticket: tkt3._id,
    user: agent2._id,
    message: 'Your request has been approved. Does your desk have an HDMI or DisplayPort connection?',
    isInternal: false,
    createdAt: new Date(now.getTime() - 90 * 60 * 1000),
  });

  // 6. Seed Feedback on Closed Ticket
  await Feedback.create({
    ticket: tkt4._id,
    employee: employee1._id,
    agent: agent1._id,
    rating: 5,
    comment: 'Super fast support! The new wireless mouse was delivered to my desk within an hour.',
    createdAt: new Date(now.getTime() - 18 * 60 * 60 * 1000),
  });

  // 7. Seed Clear Notifications
  await Notification.insertMany([
    {
      recipient: adminUser._id,
      type: NOTIFICATION_TYPES.ESCALATION,
      title: 'CRITICAL SLA Breach: TKT-1005',
      message: 'Ticket "Company email server is not receiving external emails" has breached resolution deadline.',
      ticket: tkt5._id,
      isRead: false,
    },
    {
      recipient: agent1._id,
      type: NOTIFICATION_TYPES.TICKET_ASSIGNED,
      title: 'Ticket Assigned: TKT-1002',
      message: 'You have been assigned ticket "Billing software is crashing on startup"',
      ticket: tkt2._id,
      isRead: true,
    },
    {
      recipient: employee1._id,
      type: NOTIFICATION_TYPES.TICKET_RESOLVED,
      title: 'Ticket Resolved: TKT-1004',
      message: 'Your ticket "Replacement needed for broken wireless mouse" has been resolved.',
      ticket: tkt4._id,
      isRead: true,
    },
  ]);

  // 8. Seed Audit Histories
  await TicketHistory.insertMany([
    {
      ticket: tkt1._id,
      performedBy: employee1._id,
      action: HISTORY_ACTIONS.CREATED,
      details: 'Ticket created with HIGH priority',
      timestamp: tkt1.createdAt,
    },
    {
      ticket: tkt2._id,
      performedBy: employee1._id,
      action: HISTORY_ACTIONS.CREATED,
      details: 'Ticket created with CRITICAL priority',
      timestamp: tkt2.createdAt,
    },
    {
      ticket: tkt2._id,
      performedBy: adminUser._id,
      action: HISTORY_ACTIONS.ASSIGNED,
      details: 'Ticket assigned to Agent Alex Rivera',
      timestamp: new Date(now.getTime() - 35 * 60 * 1000),
    },
    {
      ticket: tkt2._id,
      performedBy: agent1._id,
      action: HISTORY_ACTIONS.STATUS_CHANGED,
      details: 'Status changed from ASSIGNED to IN_PROGRESS by Alex Rivera',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000),
    },
  ]);

  console.log('[Seed] Database seeded with clear, simple, human-friendly mock data!');
};

// If run directly via node seed/seedData.js
if (process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase()
    .then(async () => {
      await closeDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Seed Failed:', err);
      await closeDB();
      process.exit(1);
    });
}
