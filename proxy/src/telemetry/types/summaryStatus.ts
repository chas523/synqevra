export const SUMMARY_STATUS = {
  SUCCESS: 'SUCCESS',
  PARTIAL: 'PARTIAL',
  FAIL: 'FAIL',
} as const;

export type SummaryStatus =
  (typeof SUMMARY_STATUS)[keyof typeof SUMMARY_STATUS];
