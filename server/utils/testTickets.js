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
import { ROLES, TICKET_PRIORITY } from '../config/constants.js';

async function runTicketTests() {
  console.log('--- Starting Phase 5 Ticket Creation & Retrieval Verification ---');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  const timestamp = Date.now();
  const emp1Email = `emp1_${timestamp}@example.com`;
  const emp2Email = `emp2_${timestamp}@example.com`;
  const agentEmail = `agent_${timestamp}@example.com`;
  const adminEmail = `admin_${timestamp}@example.com`;

  try {
    // 1. Create Users
    const [emp1, emp2, agent, admin] = await Promise.all([
      User.create({
        name: 'Alice Employee',
        email: emp1Email,
        password: 'Password123!',
        role: ROLES.EMPLOYEE,
        department: 'Engineering',
      }),
      User.create({
        name: 'Bob Employee',
        email: emp2Email,
        password: 'Password123!',
        role: ROLES.EMPLOYEE,
        department: 'Sales',
      }),
      User.create({
        name: 'Charlie Agent',
        email: agentEmail,
        password: 'Password123!',
        role: ROLES.AGENT,
        department: 'IT Support',
      }),
      User.create({
        name: 'Dave Admin',
        email: adminEmail,
        password: 'Password123!',
        role: ROLES.ADMIN,
        department: 'Management',
      }),
    ]);

    const emp1Token = generateToken(emp1._id, emp1.role);
    const emp2Token = generateToken(emp2._id, emp2.role);
    const agentToken = generateToken(agent._id, agent.role);
    const adminToken = generateToken(admin._id, admin.role);

    // 2. Admin creates Category
    console.log('1. Testing Category Creation via Admin...');
    const catRes = await fetch(`${baseUrl}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Hardware_${timestamp}`,
        description: 'Laptop, monitors, peripheral failures',
      }),
    });
    const catData = await catRes.json();
    if (catRes.status !== 201) throw new Error(`Category creation failed: ${JSON.stringify(catData)}`);
    const categoryId = catData.data._id;
    console.log(`[PASS] Category created successfully: ${catData.data.name}`);

    // 3. Employee 1 creates a HIGH Priority Ticket
    console.log('2. Testing Employee 1 creating HIGH priority ticket...');
    const ticketCreateRes = await fetch(`${baseUrl}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${emp1Token}`,
      },
      body: JSON.stringify({
        title: 'MacBook Pro screen flickering constantly',
        description: 'Screen turns black every 10 seconds after OS update.',
        category: categoryId,
        priority: TICKET_PRIORITY.HIGH,
      }),
    });
    const ticketCreateData = await ticketCreateRes.json();
    if (ticketCreateRes.status !== 201 || !ticketCreateData.data.ticketId) {
      throw new Error(`Ticket creation failed: ${JSON.stringify(ticketCreateData)}`);
    }
    const createdTicket = ticketCreateData.data;
    console.log(`[PASS] Ticket created with ID: ${createdTicket.ticketId}, Priority: ${createdTicket.priority}`);

    // Verify SLA deadline computation
    if (!createdTicket.sla.responseDeadline || !createdTicket.sla.resolutionDeadline) {
      throw new Error('SLA deadlines were not automatically computed at ticket creation!');
    }
    console.log(`[PASS] SLA response deadline computed: ${createdTicket.sla.responseDeadline}`);

    // Verify TicketHistory entry was generated
    const historyEntry = await TicketHistory.findOne({ ticket: createdTicket._id });
    if (!historyEntry || historyEntry.action !== 'CREATED') {
      throw new Error('TicketHistory CREATED audit log was not found!');
    }
    console.log('[PASS] Immutable TicketHistory CREATED audit entry confirmed.');

    // 4. Employee 1 retrieves their tickets -> should see 1 ticket
    console.log('3. Testing Employee 1 querying their own tickets...');
    const emp1ListRes = await fetch(`${baseUrl}/tickets`, {
      headers: { Authorization: `Bearer ${emp1Token}` },
    });
    const emp1ListData = await emp1ListRes.json();
    if (emp1ListRes.status !== 200 || emp1ListData.data.length !== 1) {
      throw new Error(`Expected 1 ticket for Employee 1, got ${emp1ListData.data.length}`);
    }
    console.log(`[PASS] Employee 1 successfully listed own ticket (${emp1ListData.data[0].ticketId}).`);

    // 5. Employee 2 retrieves tickets -> should see 0 tickets (Role Isolation)
    console.log('4. Testing Employee 2 querying tickets (Expecting isolation: 0 tickets)...');
    const emp2ListRes = await fetch(`${baseUrl}/tickets`, {
      headers: { Authorization: `Bearer ${emp2Token}` },
    });
    const emp2ListData = await emp2ListRes.json();
    if (emp2ListRes.status !== 200 || emp2ListData.data.length !== 0) {
      throw new Error(`Role breach: Employee 2 saw ${emp2ListData.data.length} tickets belonging to Employee 1!`);
    }
    console.log('[PASS] Employee 2 correctly restricted from seeing Employee 1 tickets in list.');

    // 6. Employee 2 attempts direct GET on Employee 1's ticket -> MUST BE 403
    console.log('5. Testing Employee 2 directly accessing Employee 1 ticket details (Expecting 403 Forbidden)...');
    const emp2DirectRes = await fetch(`${baseUrl}/tickets/${createdTicket._id}`, {
      headers: { Authorization: `Bearer ${emp2Token}` },
    });
    const emp2DirectData = await emp2DirectRes.json();
    if (emp2DirectRes.status !== 403) {
      throw new Error(`Security breach: Employee 2 accessed unauthorized ticket! Status: ${emp2DirectRes.status}`);
    }
    console.log(`[PASS] Unauthorized ticket access blocked with 403 Forbidden: ${emp2DirectData.message}`);

    // 7. Unassigned Agent attempts direct GET on unassigned ticket -> MUST BE 403
    console.log('6. Testing Agent accessing unassigned ticket (Expecting 403 Forbidden)...');
    const agentDirectRes = await fetch(`${baseUrl}/tickets/${createdTicket._id}`, {
      headers: { Authorization: `Bearer ${agentToken}` },
    });
    if (agentDirectRes.status !== 403) {
      throw new Error(`Security breach: Unassigned Agent accessed ticket! Status: ${agentDirectRes.status}`);
    }
    console.log('[PASS] Unassigned Agent correctly blocked with 403 Forbidden.');

    // 8. Admin views all tickets -> MUST BE 200 OK
    console.log('7. Testing Admin listing all tickets...');
    const adminListRes = await fetch(`${baseUrl}/tickets`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminListData = await adminListRes.json();
    if (adminListRes.status !== 200 || adminListData.data.length < 1) {
      throw new Error(`Admin failed to list system tickets`);
    }
    console.log(`[PASS] Admin retrieved all tickets (${adminListData.data.length} total).`);

    // 9. Admin views ticket details -> MUST BE 200 OK
    console.log('8. Testing Admin accessing specific ticket details...');
    const adminDirectRes = await fetch(`${baseUrl}/tickets/${createdTicket.ticketId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminDirectData = await adminDirectRes.json();
    if (adminDirectRes.status !== 200 || adminDirectData.data.ticketId !== createdTicket.ticketId) {
      throw new Error(`Admin failed to fetch ticket details`);
    }
    console.log(`[PASS] Admin fetched ticket details: ${adminDirectData.data.title}`);

    // Cleanup
    await Ticket.deleteMany({ _id: createdTicket._id });
    await Category.deleteMany({ _id: categoryId });
    await TicketHistory.deleteMany({ ticket: createdTicket._id });
    await Notification.deleteMany({ ticket: createdTicket._id });
    await User.deleteMany({ email: { $in: [emp1Email, emp2Email, agentEmail, adminEmail] } });
    console.log('[PASS] Test fixtures cleaned up.');

    console.log('--- All Phase 5 Ticket Creation & Retrieval Tests Successfully Passed ---');
  } finally {
    server.close();
    await closeDB();
  }
}

runTicketTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Ticket Test Failed:', err);
    process.exit(1);
  });
