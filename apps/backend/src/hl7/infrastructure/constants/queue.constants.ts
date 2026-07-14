export const QUEUE_NAMES = {
  HL7_PROCESSING: 'hl7-processing',
} as const;

export const QUEUE_CONFIG = {
  JOB_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000, // 5 seconds
} as const;
