import { aggregateLogs, groupLogs, formatAggregateResults } from './aggregate';
import { LogEntry } from './types';

const entries: LogEntry[] = [
  { timestamp: '2024-01-01T00:00:00Z', level: 'error', message: 'a' },
  { timestamp: '2024-01-01T00:01:00Z', level: 'info',  message: 'b' },
  { timestamp: '2024-01-01T00:02:00Z', level: 'error', message: 'c' },
  { timestamp: '2024-01-01T00:03:00Z', level: 'warn',  message: 'd' },
  { timestamp: '2024-01-01T00:04:00Z', level: 'info',  message: 'e' },
  { timestamp: '2024-01-01T00:05:00Z', level: 'info',  message: 'f' },
];

describe('groupLogs', () => {
  it('groups entries by field value', () => {
    const groups = groupLogs(entries, 'level');
    expect(groups.get('error')).toHaveLength(2);
    expect(groups.get('info')).toHaveLength(3);
    expect(groups.get('warn')).toHaveLength(1);
  });

  it('uses (none) for missing field', () => {
    const sparse: LogEntry[] = [
      { timestamp: 't', level: 'info', message: 'x' },
      { timestamp: 't', message: 'y' } as LogEntry,
    ];
    const groups = groupLogs(sparse, 'level');
    expect(groups.get('(none)')).toHaveLength(1);
  });

  it('returns empty map for empty entries', () => {
    expect(groupLogs([], 'level').size).toBe(0);
  });
});

describe('aggregateLogs', () => {
  it('returns results sorted by count descending', () => {
    const results = aggregateLogs(entries, { groupBy: 'level' });
    expect(results[0].group).toBe('info');
    expect(results[0].count).toBe(3);
    expect(results[1].count).toBe(2);
    expect(results[2].count).toBe(1);
  });

  it('includes entries in each group', () => {
    const results = aggregateLogs(entries, { groupBy: 'level' });
    const errorGroup = results.find((r) => r.group === 'error');
    expect(errorGroup?.entries).toHaveLength(2);
  });

  it('handles single entry', () => {
    const results = aggregateLogs([entries[0]], { groupBy: 'level' });
    expect(results).toHaveLength(1);
    expect(results[0].count).toBe(1);
  });
});

describe('formatAggregateResults', () => {
  it('formats results correctly', () => {
    const results = aggregateLogs(entries, { groupBy: 'level' });
    const lines = formatAggregateResults(results, 'level');
    expect(lines[0]).toBe('level=info  count=3');
    expect(lines[1]).toBe('level=error  count=2');
    expect(lines[2]).toBe('level=warn  count=1');
  });

  it('returns empty array for no results', () => {
    expect(formatAggregateResults([], 'level')).toEqual([]);
  });
});
