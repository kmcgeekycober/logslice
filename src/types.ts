export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  [key: string]: unknown;
}

export interface FilterOptions {
  from?: Date;
  to?: Date;
}

export interface FormatOptions {
  fields?: string[];
  colorize?: boolean;
}

export interface PipelineOptions {
  from?: Date;
  to?: Date;
  fieldQuery?: string;
  fields?: string[];
  colorize?: boolean;
}

export interface PipelineResult {
  entries: LogEntry[];
  output: string;
  totalParsed: number;
  totalMatched: number;
}

export type FieldQuery =
  | { type: 'eq'; field: string; value: string }
  | { type: 'neq'; field: string; value: string }
  | { type: 'contains'; field: string; value: string }
  | { type: 'and'; left: FieldQuery; right: FieldQuery }
  | { type: 'or'; left: FieldQuery; right: FieldQuery };
