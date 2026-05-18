export const ALARM_QUEUE_NAMES = {
  ABNORMAL_INGEST: 'alarm-abnormal-ingest',
} as const;

export const ALARM_QUEUE_SETTINGS = {
  JOB_ATTEMPTS: parseInt(process.env.ALARM_INGEST_JOB_ATTEMPTS || '5', 10),
  BACKOFF_DELAY_MS: parseInt(
    process.env.ALARM_INGEST_BACKOFF_DELAY_MS || '1000',
    10,
  ),
} as const;
