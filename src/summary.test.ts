import { buildSummary, formatSummary } from './summary';
import type { PipelineResult } from './types';

const makeResult = (entries: object[], total = entries.length): PipelineResult => ({
  entries: entries as any,
  output: '',
  totalParsed: total,
  totalMatched: entries.length,
});

describe('buildSummary', () => {
  it('counts levels correctly', () => {
    const result = makeResult([
      { timestamp: '2024-01-10T10:00:00Z', level: 'info', message: 'a' },
      { timestamp: '2024-01-10T10:01:00Z', level: 'error', message: 'b' },
      { timestamp: '2024-01-10T10:02:00Z', level: 'info', message: 'c' },
    ]);
    const stats = buildSummary(result);
    expect(stats.levelCounts['info']).toBe(2);
    expect(stats.levelCounts['error']).toBe(1);
  });

  it('calculates match rate', () => {
    const result = makeResult(
      [{ timestamp: '2024-01-10T10:00:00Z', level: 'info', message: 'a' }],
      4
    );
    const stats = buildSummary(result);
    expect(stats.matchRate).toBe('25.0%');
  });

  it('handles zero totalParsed', () => {
    const stats = buildSummary(makeResult([]));
    expect(stats.matchRate).toBe('0.0%');
  });

  it('identifies earliest and latest timestamps', () => {
    const result = makeResult([
      { timestamp: '2024-01-10T10:05:00Z', level: 'info', message: 'b' },
      { timestamp: '2024-01-10T09:00:00Z', level: 'info', message: 'a' },
    ]);
    const stats = buildSummary(result);
    expect(stats.earliestTimestamp).toBe('2024-01-10T09:00:00.000Z');
    expect(stats.latestTimestamp).toBe('2024-01-10T10:05:00.000Z');
  });

  it('returns null timestamps when no entries', () => {
    const stats = buildSummary(makeResult([]));
    expect(stats.earliestTimestamp).toBeNull();
    expect(stats.latestTimestamp).toBeNull();
  });
});

describe('formatSummary', () => {
  it('returns a non-empty string', () => {
    const result = makeResult([
      { timestamp: '2024-01-10T10:00:00Z', level: 'info', message: 'x' },
    ], 5);
    const text = formatSummary(buildSummary(result));
    expect(text).toContain('Matched: 1');
    expect(text).toContain('Parsed: 5');
    expect(text).toContain('info=1');
  });
});
