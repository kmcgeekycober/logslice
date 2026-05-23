import { LogEntry } from './parser';

export type OutputFormat = 'json' | 'pretty' | 'compact';

export interface FormatOptions {
  format: OutputFormat;
  fields?: string[];
  colorize?: boolean;
}

const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';

function colorLevel(level: string, colorize: boolean): string {
  if (!colorize) return level;
  switch (level?.toLowerCase()) {
    case 'error': return `${RED}${level}${RESET}`;
    case 'warn':  return `${YELLOW}${level}${RESET}`;
    case 'info':  return `${GREEN}${level}${RESET}`;
    case 'debug': return `${CYAN}${level}${RESET}`;
    default:      return level;
  }
}

function pickFields(entry: LogEntry, fields?: string[]): LogEntry {
  if (!fields || fields.length === 0) return entry;
  return fields.reduce((acc, key) => {
    if (key in entry) acc[key] = entry[key];
    return acc;
  }, {} as LogEntry);
}

export function formatEntry(entry: LogEntry, options: FormatOptions): string {
  const { format, fields, colorize = false } = options;
  const picked = pickFields(entry, fields);

  switch (format) {
    case 'json':
      return JSON.stringify(picked);

    case 'pretty': {
      const ts = picked.timestamp ?? '';
      const level = colorLevel(String(picked.level ?? ''), colorize);
      const msg = picked.message ?? picked.msg ?? '';
      const rest = Object.entries(picked)
        .filter(([k]) => !['timestamp', 'level', 'message', 'msg'].includes(k))
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(' ');
      return `[${ts}] ${level} ${msg}${rest ? '  ' + rest : ''}`;
    }

    case 'compact':
      return Object.values(picked).join(' | ');

    default:
      return JSON.stringify(picked);
  }
}

export function formatEntries(entries: LogEntry[], options: FormatOptions): string[] {
  return entries.map(entry => formatEntry(entry, options));
}
