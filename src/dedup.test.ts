import { dedupKey, deduplicateLogs } from './dedup';
import { LogEntry } from './types';

const makeEntry = (overrides: Partial<LogEntry> = {}): LogEntry => ({
  timestamp: '2024-01-01T00:00:00Z',
  level: 'info',
  message: 'hello',
  raw: '{}',
  ...overrides,
});

describe('dedupKey', () => {
  it('returns concatenated field values', () => {
    const entry = makeEntry({ level: 'error', message: 'oops' });
    expect(dedupKey(entry, ['level', 'message'])).toBe('error\x00oops');
  });

  it('uses empty string for missing fields', () => {
    const entry = makeEntry();
    expect(dedupKey(entry, ['level', 'nonexistent'])).toBe('info\x00');
  });

  it('handles single field', () => {
    const entry = makeEntry({ level: 'warn' });
    expect(dedupKey(entry, ['level'])).toBe('warn');
  });
});

describe('deduplicateLogs', () => {
  it('returns empty array for empty input', () => {
    expect(deduplicateLogs([])).toEqual([]);
  });

  it('returns single entry unchanged when no duplicates', () => {
    const entries = [makeEntry()];
    expect(deduplicateLogs(entries)).toEqual(entries);
  });

  it('collapses consecutive duplicates and adds _count', () => {
    const entries = [
      makeEntry({ message: 'repeat' }),
      makeEntry({ message: 'repeat' }),
      makeEntry({ message: 'repeat' }),
    ];
    const result = deduplicateLogs(entries);
    expect(result).toHaveLength(1);
    expect(result[0]._count).toBe(3);
  });

  it('does not collapse non-consecutive duplicates', () => {
    const entries = [
      makeEntry({ message: 'a' }),
      makeEntry({ message: 'b' }),
      makeEntry({ message: 'a' }),
    ];
    const result = deduplicateLogs(entries);
    expect(result).toHaveLength(3);
    expect(result.every((e) => e._count === undefined)).toBe(true);
  });

  it('respects custom fields option', () => {
    const entries = [
      makeEntry({ level: 'error', message: 'x' }),
      makeEntry({ level: 'error', message: 'y' }),
    ];
    const result = deduplicateLogs(entries, { fields: ['level'] });
    expect(result).toHaveLength(1);
    expect(result[0]._count).toBe(2);
  });

  it('respects custom countField option', () => {
    const entries = [makeEntry(), makeEntry()];
    const result = deduplicateLogs(entries, { countField: 'occurrences' });
    expect(result[0].occurrences).toBe(2);
    expect(result[0]._count).toBeUndefined();
  });

  it('does not add count field for unique entries', () => {
    const entries = [makeEntry({ message: 'a' }), makeEntry({ message: 'b' })];
    const result = deduplicateLogs(entries);
    expect(result[0]._count).toBeUndefined();
    expect(result[1]._count).toBeUndefined();
  });
});
