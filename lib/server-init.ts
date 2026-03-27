import { UptimeSchedulerService } from './services/uptime-scheduler.service';

let initialized = false;

export async function initializeServer() {
  if (initialized) {
    return;
  }

  console.log('[Server] Initializing server services...');

  try {
    await UptimeSchedulerService.initialize();
    initialized = true;
    console.log('[Server] Server initialization completed');
  } catch (error) {
    console.error('[Server] Failed to initialize server:', error);
  }
}

if (typeof window === 'undefined') {
  initializeServer().catch(console.error);
}
