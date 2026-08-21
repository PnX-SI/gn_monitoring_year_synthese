export interface MonitoringPaginatedResult<T> {
  items: T[];
  count: number;
  limit: number;
  page: number;
}
