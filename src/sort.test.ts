import { parseSortOption, sortLogs, SortOptions } from './sort';
import { LogEntry } from './types';

const makeEntry = (overrides: Partial<LogEntry>): LogEntry => ({
  timestamp: '2024-01-01T00:00:00Z',
  level: 'info',
  message: 'test',
  ...overrides,
} as LogEntry);

describe('parseSortOption', () => {
  it('parses field with asc direction', () => {
    expect(parseSortOption('timestamp:asc')).toEqual({ field: 'timestamp', direction: 'asc' });
  });

  it('parses field with desc direction', () => {
    expect(parseSortOption('level:desc')).toEqual({ field: 'level', direction: 'desc' });
  });

  it('defaults to asc when direction is omitted', () => {
    expect(parseSortOption('message')).toEqual({ field: 'message', direction: 'asc' });
  });

  it('throws on empty field', () => {
    expect(() => parseSortOption('')).toThrow('Invalid sort expression');
  });

  it('is case-insensitive for direction', () => {
    expect(parseSortOption('level:DESC')).toEqual({ field: 'level', direction: 'desc' });
  });
});

describe('sortLogs', () => {
  const entries: LogEntry[] = [
    makeEntry({ timestamp: '2024-01-03T00:00:00Z', level: 'error' }),
    makeEntry({ timestamp: '2024-01-01T00:00:00Z', level: 'info' }),
    makeEntry({ timestamp: '2024-01-02T00:00:00Z', level: 'warn' }),
  ];

  it('sorts by timestamp ascending', () => {
    const sorted = sortLogs(entries, { field: 'timestamp', direction: 'asc' });
    expect(sorted[0].timestamp).toBe('2024-01-01T00:00:00Z');
    expect(sorted[2].timestamp).toBe('2024-01-03T00:00:00Z');
  });

  it('sorts by timestamp descending', () => {
    const sorted = sortLogs(entries, { field: 'timestamp', direction: 'desc' });
    expect(sorted[0].timestamp).toBe('2024-01-03T00:00:00Z');
    expect(sorted[2].timestamp).toBe('2024-01-01T00:00:00Z');
  });

  it('sorts by level alphabetically asc', () => {
    const sorted = sortLogs(entries, { field: 'level', direction: 'asc' });
    expect(sorted[0].level).toBe('error');
    expect(sorted[1].level).toBe('info');
    expect(sorted[2].level).toBe('warn');
  });

  it('places entries with missing field at the end', () => {
    const withMissing = [
      makeEntry({ timestamp: '2024-01-02T00:00:00Z' }),
      { level: 'info', message: 'no-ts' } as LogEntry,
      makeEntry({ timestamp: '2024-01-01T00:00:00Z' }),
    ];
    const sorted = sortLogs(withMissing, { field: 'timestamp', direction: 'asc' });
    expect(sorted[2].message).toBe('no-ts');
  });

  it('does not mutate the original array', () => {
    const original = [...entries];
    sortLogs(entries, { field: 'timestamp', direction: 'asc' });
    expect(entries).toEqual(original);
  });
});
