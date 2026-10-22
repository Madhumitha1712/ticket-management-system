import dotenv from 'dotenv';
dotenv.config();

import { User, Category, SLARule, Ticket, Comment, TicketHistory, Notification, Feedback } from '../models/index.js';
import { ROLES, TICKET_PRIORITY, TICKET_STATUS } from '../config/constants.js';

async function runModelTests() {
  console.log('--- Starting Phase 2 Model Verification ---');

  // Verify all models are loaded and are Mongoose models
  const models = { User, Category, SLARule, Ticket, Comment, TicketHistory, Notification, Feedback };
  for (const [name, model] of Object.entries(models)) {
    if (!model || !model.modelName) {
      throw new Error(`Model ${name} failed to load properly.`);
    }
    console.log(`[PASS] Model loaded: ${name} (Collection: ${model.collection.name})`);
  }

  // Test User validation
  const testUser = new User({
    name: 'Test Engineer',
    email: 'test@example.com',
    password: 'Password123!',
    role: ROLES.EMPLOYEE,
    department: 'Engineering',
  });

  await testUser.validate();
  console.log('[PASS] User schema validation passed.');

  // Test SLARule validation
  const testSLA = new SLARule({
    priority: TICKET_PRIORITY.CRITICAL,
    responseDeadlineMinutes: 15,
    resolutionDeadlineMinutes: 120,
    warningThresholdPercent: 80,
  });
  await testSLA.validate();
  console.log('[PASS] SLARule validation passed.');

  // Test Ticket schema validation with subdocuments
  const testTicket = new Ticket({
    ticketId: 'TKT-1001',
    title: 'Network connectivity lost on 4th floor',
    description: 'Switch unresponsive since 9 AM',
    category: new User()._id,
    priority: TICKET_PRIORITY.HIGH,
    status: TICKET_STATUS.OPEN,
    createdBy: new User()._id,
    sla: {
      responseDeadline: new Date(),
      resolutionDeadline: new Date(),
    }
  });
  await testTicket.validate();
  console.log('[PASS] Ticket schema validation passed.');

  // Test Feedback rating boundary (e.g. rating > 5 should fail validation)
  const invalidFeedback = new Feedback({
    ticket: testTicket._id,
    employee: testUser._id,
    rating: 6, // Invalid
  });

  let errorCaught = false;
  try {
    await invalidFeedback.validate();
  } catch (err) {
    errorCaught = true;
    console.log(`[PASS] Feedback rating constraint correctly blocked rating > 5 (${err.errors.rating.message})`);
  }

  if (!errorCaught) {
    throw new Error('Feedback rating > 5 was unexpectedly allowed!');
  }

  console.log('--- All Phase 2 Model Validations Successfully Verified ---');
}

runModelTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test Failed:', err);
    process.exit(1);
  });
