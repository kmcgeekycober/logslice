import { runContextPipeline } from './context-pipeline';
import { LogEntry } from './types';

const makeEntry = (msg: string, level = 'info'): LogEntry => ({
  timestamp: '2024-01-01T00:00:00Z',
  level,
  message: msg,
});

const entries: LogEntry[] = [
  makeEntry('startup'),
  makeEntry('connecting'),
  makeEntry('fatal error', 'error'),
  makeEntry('retrying'),
  makeEntry('recovered'),
];

describe('runContextPipeline', () => {
  it('returns all entries as matches when no query given', () => {
    const result = runContextPipeline(entries, { before: 0, after: 0 });
    expect(result).toHaveLength(5);
    expect(result.every((r) => r.context === 'match')).toBe(true);
  });

  it('matches by substring and returns surrounding context', () => {
    const result = runContextPipeline(entries, {
      before: 1,
      after: 1,
      matchSubstring: 'fatal',
    });
    expect(result).toHaveLength(3);
    expect(result[0].entry.message).toBe('connecting');
    expect(result[1].context).toBe('match');
    expect(result[2].entry.message).toBe('retrying');
  });

  it('matches by field query', () => {
    const result = runContextPipeline(entries, {
      before: 0,
      after: 1,
      query: 'level=error',
    });
    expect(result[0].entry.message).toBe('fatal error');
    expect(result[1].entry.message).toBe('retrying');
  });

  it('returns empty array when no entries match', () => {
    const result = runContextPipeline(entries, {
      before: 2,
      after: 2,
      matchSubstring: 'nonexistent',
    });
    expect(result).toHaveLength(0);
  });

  it('respects after=0 with field query match', () => {
    const result = runContextPipeline(entries, {
      before: 0,
      after: 0,
      query: 'level=error',
    });
    expect(result).toHaveLength(1);
    expect(result[0].context).toBe('match');
  });
});
