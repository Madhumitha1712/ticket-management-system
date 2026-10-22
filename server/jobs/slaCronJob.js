import cron from 'node-cron';
import { checkSLABreachesAndWarnings } from '../services/slaEngine.js';

let cronTask = null;

export const startSLACronJob = () => {
  // Run every minute: */1 * * * *
  cronTask = cron.schedule('*/1 * * * *', async () => {
    try {
      const result = await checkSLABreachesAndWarnings();
      if (result.warned > 0 || result.breached > 0) {
        console.log(`[SLA Cron] Processed: ${result.warned} warning(s), ${result.breached} breach/escalation(s)`);
      }
    } catch (err) {
      console.error('[SLA Cron] Error executing SLA check:', err.message);
    }
  });

  console.log('[SLA Cron] Background SLA monitor scheduled (runs every 60s)');
  return cronTask;
};

export const stopSLACronJob = () => {
  if (cronTask) {
    cronTask.stop();
    console.log('[SLA Cron] Background SLA monitor stopped');
  }
};
