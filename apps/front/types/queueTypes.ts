export interface SubmitStrategy {
    type: 'BURST' | 'BATCH' | 'SEQUENTIAL_BY_ORIGINATOR' | 'SEQUENTIAL_BY_TENANT' | 'SEQUENTIAL';
    batchSize?: number;
}

export interface ProcessingStrategy {
    type: 'RETRY_FAILED_AND_TIMED_OUT' | 'SKIP_ALL_FAILURES' | 'SKIP_ALL_FAILURES_AND_TIMEOUTS' | 'RETRY_ALL' | 'RETRY_FAILED' | 'RETRY_TIMED_OUT';
    retries: number;
    failurePercentage: number;
    pauseBetweenRetries: number;
    maxPauseBetweenRetries: number;
}

export interface Queue {
    id?: {
        entityType: string;
        id: string;
    };
    createdTime?: number;
    tenantId?: {
        entityType: string;
        id: string;
    };
    name: string;
    topic?: string;
    pollInterval: number;
    partitions: number;
    consumerPerPartition: boolean;
    packProcessingTimeout: number;
    submitStrategy: SubmitStrategy;
    processingStrategy: ProcessingStrategy;
    additionalInfo?: any;
}

export interface QueuesPageResponse {
    data: Queue[];
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
}

export interface StrategyOption {
    value: string;
    label: string;
    description?: string;
}

export const SUBMIT_STRATEGY_OPTIONS: StrategyOption[] = [
    { value: 'BURST', label: 'Burst', description: 'All messages are submitted to the rule chains in the order they arrive' },
    { value: 'BATCH', label: 'Batch', description: 'New batch is not submitted until previous batch is acknowledged' },
    { value: 'SEQUENTIAL_BY_ORIGINATOR', label: 'Sequential by originator', description: 'New message for e.g. device A is not submitted until previous message for device A is acknowledged' },
    { value: 'SEQUENTIAL_BY_TENANT', label: 'Sequential by tenant', description: 'New message for e.g tenant A is not submitted until previous message for tenant A is acknowledged' },
    { value: 'SEQUENTIAL', label: 'Sequential', description: 'New message is not submitted until previous message is acknowledged' },
];

export const PROCESSING_STRATEGY_OPTIONS: StrategyOption[] = [
    { value: 'RETRY_FAILED_AND_TIMED_OUT', label: 'Retry failed and timeout', description: 'Retry all failed and timed-out messages from processing pack' },
    { value: 'SKIP_ALL_FAILURES', label: 'Skip all failures', description: 'Ignore all failures' },
    { value: 'SKIP_ALL_FAILURES_AND_TIMEOUTS', label: 'Skip all failures and timeouts', description: 'Ignore all failures and timeouts' },
    { value: 'RETRY_ALL', label: 'Retry all', description: 'Retry all messages from processing pack' },
    { value: 'RETRY_FAILED', label: 'Retry failed', description: 'Retry all failed messages from processing pack' },
    { value: 'RETRY_TIMED_OUT', label: 'Retry timeout', description: 'Retry all timed-out messages from processing pack' },
];
