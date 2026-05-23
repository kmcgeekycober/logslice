import { filterLogs, FilterOptions } from './filter';
import { LogEntry } from './parser';

const sampleEntries: LogEntry[] = [
  { timestamp: '2024-01-15T08:00:00Z', level: 'info', message: 'Server started', service: 'api' },
  { timestamp: '2024-01-15T09:30:00Z', level: 'warn', message: 'High memory usage', service: 'api' },
  { timestamp: '2024-01-15T10:00:00Z', level: 'error', message: 'Connection failed', service: 'db' },
  { timestamp: '2024-01-15T11:00:00Z', level: 'info', message: 'Request handled', service: 'api' },
  { timestamp: 'invalid-date', level: 'info', message: 'Bad timestamp entry', service: 'api' },
];

describe('filterLogs', () => {
  it('returns all entries when no options are provided', () => {
    const result = filterLogs(sampleEntries, {});
    expect(result).toHaveLength(sampleEntries.length);
  });

  it('filters entries by from date', () => {
    const options: FilterOptions = { from: new Date('2024-01-15T09:00:00Z') };
    const result = filterLogs(sampleEntries, options);
    expect(result).toHaveLength(2);
    expect(result[0].message).toBe('High memory usage');
  });

  it('filters entries by to date', () => {
    const options: FilterOptions = { to: new Date('2024-01-15T09:00:00Z') };
    const result = filterLogs(sampleEntries, options);
    expect(result).toHaveLength(1);
    expect(result[0].message).toBe('Server started');
  });

  it('filters entries within a time range', () => {
    const options: FilterOptions = {
      from: new Date('2024-01-15T09:00:00Z'),
      to: new Date('2024-01-15T10:30:00Z'),
    };
    const result = filterLogs(sampleEntries, options);
    expect(result).toHaveLength(2);
  });

  it('filters entries by level (case-insensitive)', () => {
    const result = filterLogs(sampleEntries, { level: 'INFO' });
    expect(result).toHaveLength(2);
    result.forEach((e) => expect(e.level?.toLowerCase()).toBe('info'));
  });

  it('filters entries by custom field', () => {
    const result = filterLogs(sampleEntries, { fields: { service: 'db' } });
    expect(result).toHaveLength(1);
    expect(result[0].message).toBe('Connection failed');
  });

  it('excludes entries with invalid timestamps when time filter is active', () => {
    const result = filterLogs(sampleEntries, { from: new Date('2024-01-01T00:00:00Z') });
    const messages = result.map((e) => e.message);
    expect(messages).not.toContain('Bad timestamp entry');
  });

  it('returns empty array when no entries match', () => {
    const result = filterLogs(sampleEntries, { level: 'debug' });
    expect(result).toHaveLength(0);
  });
});
