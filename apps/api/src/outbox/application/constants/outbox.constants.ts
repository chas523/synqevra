export const OUTBOX_SETTINGS = {
  DISPATCH_BATCH_SIZE: parseInt(
    process.env.OUTBOX_DISPATCH_BATCH_SIZE || '25',
    10,
  ),
  MAX_RETRY_ATTEMPTS: parseInt(
    process.env.OUTBOX_MAX_RETRY_ATTEMPTS || '5',
    10,
  ),
  RETRY_BASE_DELAY_MS: parseInt(
    process.env.OUTBOX_RETRY_BASE_DELAY_MS || '1000',
    10,
  ),
  TICK_MS: parseInt(process.env.OUTBOX_DISPATCHER_TICK_MS || '1000', 10),
} as const;
