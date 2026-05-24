import { parseRateOption, computeRates, formatRateResults } from './rate';
import { LogEntry } from './types';

function makeEntry(timestamp: string, level = 'info'): LogEntry {
  return { timestamp, level, message: 'test' };
}

describe('parseRateOption', () => {
  it('parses milliseconds', () => expect(parseRateOption('500ms')).toBe(500));
  it('parses seconds', () => expect(parseRateOption('10s')).toBe(10000));
  it('parses minutes', () => expect(parseRateOption('2m')).toBe(120000));
  it('parses hours', () => expect(parseRateOption('1h')).toBe(3600000));
  it('throws on invalid format', () => {
    expect(() => parseRateOption('10x')).toThrow('Invalid rate window');
    expect(() => parseRateOption('abc')).toThrow('Invalid rate window');
  });
});

describe('computeRates', () => {
  it('returns empty array for no entries', () => {
    expect(computeRates([], 5000)).toEqual([]);
  });

  it('counts entries in a single window', () => {
    const entries = [
      makeEntry('2024-01-01T00:00:00.000Z'),
      makeEntry('2024-01-01T00:00:01.000Z'),
      makeEntry('2024-01-01T00:00:02.000Z'),
    ];
    const results = computeRates(entries, 5000);
    expect(results).toHaveLength(1);
    expect(results[0].count).toBe(3);
    expect(results[0].rate).toBeCloseTo(0.6);
  });

  it('splits entries across multiple windows', () => {
    const entries = [
      makeEntry('2024-01-01T00:00:00.000Z'),
      makeEntry('2024-01-01T00:00:06.000Z'),
    ];
    const results = computeRates(entries, 5000);
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0].count).toBe(1);
  });

  it('groups by level when requested', () => {
    const entries = [
      makeEntry('2024-01-01T00:00:00.000Z', 'info'),
      makeEntry('2024-01-01T00:00:01.000Z', 'error'),
      makeEntry('2024-01-01T00:00:02.000Z', 'info'),
    ];
    const results = computeRates(entries, 5000, true);
    const levels = results.map(r => r.level);
    expect(levels).toContain('info');
    expect(levels).toContain('error');
    const infoResult = results.find(r => r.level === 'info');
    expect(infoResult?.count).toBe(2);
  });

  it('computes rate correctly', () => {
    const entries = [makeEntry('2024-01-01T00:00:00.000Z')];
    const results = computeRates(entries, 10000);
    expect(results[0].rate).toBeCloseTo(0.1);
  });
});

describe('formatRateResults', () => {
  it('returns fallback message for empty results', () => {
    expect(formatRateResults([])).toBe('No rate data.');
  });

  it('formats results with rate per second', () => {
    const results = [{
      windowStart: '2024-01-01T00:00:00.000Z',
      windowEnd: '2024-01-01T00:00:05.000Z',
      count: 10,
      rate: 2.0,
    }];
    const output = formatRateResults(results);
    expect(output).toContain('10 events');
    expect(output).toContain('2.00/s');
  });

  it('includes level tag when present', () => {
    const results = [{
      windowStart: '2024-01-01T00:00:00.000Z',
      windowEnd: '2024-01-01T00:00:05.000Z',
      count: 3,
      rate: 0.6,
      level: 'error',
    }];
    const output = formatRateResults(results);
    expect(output).toContain('[error]');
  });
});
