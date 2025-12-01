export const CACHE_CONFIG = {
  //have to be specified in milliseconds
  TTL: {
    PRACTITIONER_CACHE: 30 * 60 * 1000, //30 minutes
    MESSAGE_CACHE: 10 * 60 * 1000, //10 minutes
    DEFAULT: 5 * 60 * 1000, //5 minutes
  },

  KEYS: {
    PRACTITIONER_PREFIX: 'practitioner:',
    PROCESSED_MESSAGE_PREFIX: 'processed_msg:',
  },

  SETTINGS: {
    MAX_ITEMS: 1000,
    IS_GLOBAL: true,
  },
} as const;
