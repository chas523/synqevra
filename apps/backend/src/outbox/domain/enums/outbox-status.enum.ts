export enum OutboxStatus {
  PENDING = 'pending',
  RETRY = 'retry',
  DELIVERED = 'delivered',
  DEAD = 'dead',
}
