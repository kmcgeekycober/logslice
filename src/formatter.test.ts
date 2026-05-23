import { formatEntry, formatEntries, FormatOptions } from './formatter';
import { LogEntry } from './parser';

const sampleEntry: LogEntry = {
  timestamp: '2024-01-15T10:00:00Z',
  level: 'info',
  message: 'Server started',
  port: 3000,
};

describe('formatEntry', () => {
  it('formats as JSON', () => {
    const opts: FormatOptions = { format: 'json' };
    const result = formatEntry(sampleEntry, opts);
    expect(JSON.parse(result)).toEqual(sampleEntry);
  });

  it('formats as pretty', () => {
    const opts: FormatOptions = { format: 'pretty' };
    const result = formatEntry(sampleEntry, opts);
    expect(result).toContain('2024-01-15T10:00:00Z');
    expect(result).toContain('info');
    expect(result).toContain('Server started');
    expect(result).toContain('port=3000');
  });

  it('formats as compact', () => {
    const opts: FormatOptions = { format: 'compact' };
    const result = formatEntry(sampleEntry, opts);
    expect(result).toContain('|');
    expect(result).toContain('Server started');
  });

  it('picks only specified fields', () => {
    const opts: FormatOptions = { format: 'json', fields: ['level', 'message'] };
    const result = JSON.parse(formatEntry(sampleEntry, opts));
    expect(result).toEqual({ level: 'info', message: 'Server started' });
    expect(result.timestamp).toBeUndefined();
  });

  it('includes ANSI codes when colorize is true', () => {
    const opts: FormatOptions = { format: 'pretty', colorize: true };
    const result = formatEntry(sampleEntry, opts);
    expect(result).toContain('\x1b[');
  });

  it('does not include ANSI codes when colorize is false', () => {
    const opts: FormatOptions = { format: 'pretty', colorize: false };
    const result = formatEntry(sampleEntry, opts);
    expect(result).not.toContain('\x1b[');
  });
});

describe('formatEntries', () => {
  it('formats multiple entries', () => {
    const entries: LogEntry[] = [
      { ...sampleEntry, message: 'First' },
      { ...sampleEntry, message: 'Second', level: 'error' },
    ];
    const opts: FormatOptions = { format: 'json' };
    const results = formatEntries(entries, opts);
    expect(results).toHaveLength(2);
    expect(JSON.parse(results[0]).message).toBe('First');
    expect(JSON.parse(results[1]).level).toBe('error');
  });

  it('returns empty array for empty input', () => {
    expect(formatEntries([], { format: 'pretty' })).toEqual([]);
  });
});
