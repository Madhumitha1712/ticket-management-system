import dotenv from 'dotenv';
dotenv.config();

process.env.RUN_AS_MODULE = 'true';
process.env.NODE_ENV = 'test';

import app from '../server.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Ticket from '../models/Ticket.js';
import SLARule from '../models/SLARule.js';
import TicketHistory from '../models/TicketHistory.js';
import Notification from '../models/Notification.js';
import { closeDB } from '../config/db.js';
import { generateToken } from '../utils/jwt.js';
import { ROLES, TICKET_PRIORITY, TICKET_STATUS, HISTORY_ACTIONS, NOTIFICATION_TYPES } from '../config/constants.js';
import { checkSLABreachesAndWarnings } from '../services/slaEngine.js';

async function runSlaTests() {
  console.log('--- Starting Phase 9 & 10 SLA Engine & Escalation Verification ---');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  const timestamp = Date.now();
  const empEmail = `sla_emp_${timestamp}@example.com`;
  const agentEmail = `sla_agent_${timestamp}@example.com`;
  const adminEmail = `sla_admin_${timestamp}@example.com`;

  try {
    // 1. Create Users
    const [emp, agent, admin] = await Promise.all([
      User.create({
        name: 'SLA Employee',
        email: empEmail,
        password: 'Password123!',
        role: ROLES.EMPLOYEE,
        department: 'Operations',
      }),
      User.create({
        name: 'SLA Agent',
        email: agentEmail,
        password: 'Password123!',
        role: ROLES.AGENT,
        department: 'IT Desk',
      }),
      User.create({
        name: 'SLA Admin',
        email: adminEmail,
        password: 'Password123!',
        role: ROLES.ADMIN,
        department: 'IT Mgmt',
      }),
    ]);

    const empToken = generateToken(emp._id, emp.role);
    const agentToken = generateToken(agent._id, agent.role);
    const adminToken = generateToken(admin._id, admin.role);

    // 2. Fetch & update SLA rules via API
    console.log('1. Testing GET /api/sla/rules...');
    const rulesRes = await fetch(`${baseUrl}/sla/rules`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    const rulesData = await rulesRes.json();
    if (rulesRes.status !== 200 || !Array.isArray(rulesData.data) || rulesData.data.length === 0) {
      throw new Error(`Failed to fetch SLA rules: ${JSON.stringify(rulesData)}`);
    }
    console.log(`[PASS] SLA rules loaded (${rulesData.data.length} priority rules).`);

    const criticalRule = rulesData.data.find((r) => r.priority === TICKET_PRIORITY.CRITICAL);

    // 3. Category Creation
    const category = await Category.create({
      name: `SLA Test Category ${timestamp}`,
      description: 'SLA evaluation category',
    });

    // 4. Test SLA Warning Trigger (Ticket at 85% elapsed duration)
    console.log('2. Testing 80% SLA Warning Trigger...');
    const now = new Date();
    // Simulate ticket created 100 minutes ago with 120 min resolution deadline (83.3% elapsed)
    const createdAtWarning = new Date(now.getTime() - 100 * 60 * 1000);
    const resolutionDeadlineWarning = new Date(now.getTime() + 20 * 60 * 1000);

    const warningTicket = await Ticket.create({
      ticketId: `TKT-WARN-${timestamp.toString().slice(-4)}`,
      title: 'Server CPU high load warning test',
      description: 'CPU spike sustained for over 1 hour',
      category: category._id,
      priority: TICKET_PRIORITY.CRITICAL,
      status: TICKET_STATUS.IN_PROGRESS,
      createdBy: emp._id,
      assignedTo: agent._id,
      createdAt: createdAtWarning,
      sla: {
        rule: criticalRule._id,
        resolutionDeadline: resolutionDeadlineWarning,
        warningTriggered: false,
        isBreached: false,
      },
    });

    // Run SLA Engine evaluation
    const scanResult1 = await checkSLABreachesAndWarnings();
    console.log(`[PASS] SLA Engine executed. Warned: ${scanResult1.warned}, Breached: ${scanResult1.breached}`);

    // Verify warning was triggered on ticket
    const updatedWarnTicket = await Ticket.findById(warningTicket._id);
    if (!updatedWarnTicket.sla.warningTriggered) {
      throw new Error('SLA Warning was not triggered on 85% elapsed ticket!');
    }
    console.log('[PASS] Ticket sla.warningTriggered set to true.');

    // Verify Warning Notification and History log
    const warnNotification = await Notification.findOne({
      ticket: warningTicket._id,
      type: NOTIFICATION_TYPES.SLA_WARNING,
    });
    if (!warnNotification) throw new Error('SLA warning notification was not created');
    console.log(`[PASS] In-app SLA warning notification generated: "${warnNotification.title}"`);

    const warnHistory = await TicketHistory.findOne({
      ticket: warningTicket._id,
      action: HISTORY_ACTIONS.SLA_WARNING,
    });
    if (!warnHistory) throw new Error('SLA warning history log not recorded');
    console.log(`[PASS] SLA warning recorded in audit history: ${warnHistory.details}`);

    // 5. Test SLA Breach & Auto-Escalation (Ticket created 3 hours ago with 2 hour resolution deadline)
    console.log('3. Testing SLA Breach & Automated Escalation Trigger...');
    const createdAtBreach = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const resolutionDeadlineBreach = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour in the past!

    const breachTicket = await Ticket.create({
      ticketId: `TKT-BREACH-${timestamp.toString().slice(-4)}`,
      title: 'Payment gateway down breach test',
      description: 'Stripe webhook timeout',
      category: category._id,
      priority: TICKET_PRIORITY.CRITICAL,
      status: TICKET_STATUS.IN_PROGRESS,
      createdBy: emp._id,
      assignedTo: agent._id,
      createdAt: createdAtBreach,
      sla: {
        rule: criticalRule._id,
        resolutionDeadline: resolutionDeadlineBreach,
        warningTriggered: true,
        isBreached: false,
      },
    });

    // Run SLA Engine evaluation
    const scanResult2 = await checkSLABreachesAndWarnings();
    console.log(`[PASS] SLA Engine scan executed. Breached: ${scanResult2.breached}`);

    const updatedBreachTicket = await Ticket.findById(breachTicket._id);
    if (!updatedBreachTicket.sla.isBreached || !updatedBreachTicket.escalation.isEscalated) {
      throw new Error('SLA Breach & Escalation was not triggered on past-deadline ticket!');
    }
    console.log(`[PASS] Ticket isBreached=true, isEscalated=true. Reason: ${updatedBreachTicket.escalation.reason}`);

    // Verify Breach Notification and History log
    const breachNotification = await Notification.findOne({
      ticket: breachTicket._id,
      type: NOTIFICATION_TYPES.SLA_BREACHED,
    });
    if (!breachNotification) throw new Error('SLA breach notification was not created');
    console.log(`[PASS] In-app SLA breach notification generated: "${breachNotification.title}"`);

    // 6. Test Admin Escalation Queue Endpoint (GET /api/sla/escalations)
    console.log('4. Testing Admin accessing GET /api/sla/escalations...');
    const adminEscRes = await fetch(`${baseUrl}/sla/escalations`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminEscData = await adminEscRes.json();
    if (adminEscRes.status !== 200 || adminEscData.data.length === 0) {
      throw new Error(`Admin failed to retrieve escalations queue: ${JSON.stringify(adminEscData)}`);
    }
    console.log(`[PASS] Admin retrieved ${adminEscData.data.length} escalated/breached ticket(s).`);

    // 7. Test Employee blocked from Escalations Queue
    console.log('5. Testing Employee accessing GET /api/sla/escalations (Expecting 403 Forbidden)...');
    const empEscRes = await fetch(`${baseUrl}/sla/escalations`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    if (empEscRes.status !== 403) {
      throw new Error(`Security breach: Employee was able to access escalations queue (status: ${empEscRes.status})`);
    }
    console.log('[PASS] Employee blocked from escalation queue with 403 Forbidden.');

    // Clean up
    await Ticket.deleteMany({ _id: { $in: [warningTicket._id, breachTicket._id] } });
    await Category.deleteMany({ _id: category._id });
    await TicketHistory.deleteMany({ ticket: { $in: [warningTicket._id, breachTicket._id] } });
    await Notification.deleteMany({ ticket: { $in: [warningTicket._id, breachTicket._id] } });
    await User.deleteMany({ email: { $in: [empEmail, agentEmail, adminEmail] } });
    console.log('[PASS] Test fixtures cleaned up.');

    console.log('--- All Phase 9 & 10 SLA Engine Tests Successfully Passed ---');
  } finally {
    server.close();
    await closeDB();
  }
}

runSlaTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('SLA Test Failed:', err);
    process.exit(1);
  });
