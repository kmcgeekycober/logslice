/**
 * types.ts
 * Shared type definitions for logslice.
 */

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  [key: string]: unknown;
  level?: LogLevel | string;
  time?: string | number;
  msg?: string;
  message?: string;
}

export interface TimeRange {
  from?: Date;
  to?: Date;
}

export interface FieldQuery {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | '~';
  value: string;
}

export interface Query {
  timeRange?: TimeRange;
  fieldQueries?: FieldQuery[];
  searchTerm?: string;
}

export interface FilterOptions {
  query?: Query;
  fields?: string[];
  maxLength?: number;
  dedup?: boolean;
  noColor?: boolean;
  summary?: boolean;
  pageSize?: number;
}

export interface SummaryStats {
  total: number;
  byLevel: Record<string, number>;
  earliest?: string;
  latest?: string;
}
