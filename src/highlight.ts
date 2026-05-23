import { LogEntry } from './types';

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RED = '\x1b[31m';

/**
 * Wraps a matched substring with ANSI highlight codes.
 */
export function highlightMatch(text: string, term: string): string {
  if (!term) return text;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, `${BOLD}${YELLOW}$1${RESET}`);
}

/**
 * Highlights all occurrences of `term` within the string values of a log entry.
 * Returns a new entry with highlighted string fields.
 */
export function highlightEntry(
  entry: LogEntry,
  term: string
): Record<string, unknown> {
  if (!term) return entry as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(entry)) {
    if (typeof value === 'string') {
      result[key] = highlightMatch(value, term);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Highlights a field name for display purposes.
 */
export function highlightKey(key: string): string {
  return `${CYAN}${key}${RESET}`;
}

/**
 * Highlights an error-level indicator.
 */
export function highlightError(text: string): string {
  return `${RED}${BOLD}${text}${RESET}`;
}
