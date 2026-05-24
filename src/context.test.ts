import { addContext, parseContextOptions } from './context';
import { LogEntry } from './types';

const makeEntry = (msg: string): LogEntry => ({
  timestamp: '2024-01-01T00:00:00Z',
  level: 'info',
  message: msg,
});

const entries: LogEntry[] = [
  makeEntry('a'),
  makeEntry('b'),
  makeEntry('c'),
  makeEntry('d'),
  makeEntry('e'),
];

describe('addContext', () => {
  it('returns only matched entries when before=0 after=0', () => {
    const result = addContext(entries, new Set([2]), { before: 0, after: 0 });
    expect(result).toHaveLength(1);
    expect(result[0].entry.message).toBe('c');
    expect(result[0].context).toBe('match');
  });

  it('includes before lines', () => {
    const result = addContext(entries, new Set([2]), { before: 1, after: 0 });
    expect(result).toHaveLength(2);
    expect(result[0].context).toBe('before');
    expect(result[1].context).toBe('match');
  });

  it('includes after lines', () => {
    const result = addContext(entries, new Set([2]), { before: 0, after: 2 });
    expect(result).toHaveLength(3);
    expect(result[0].context).toBe('match');
    expect(result[1].context).toBe('after');
    expect(result[2].context).toBe('after');
  });

  it('clamps to array boundaries', () => {
    const result = addContext(entries, new Set([0]), { before: 5, after: 0 });
    expect(result).toHaveLength(1);
    expect(result[0].entry.message).toBe('a');
  });

  it('merges overlapping context from multiple matches', () => {
    const result = addContext(entries, new Set([1, 3]), { before: 1, after: 1 });
    const messages = result.map((r) => r.entry.message);
    expect(messages).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});

describe('parseContextOptions', () => {
  it('parses --context into symmetric before/after', () => {
    expect(parseContextOptions(undefined, undefined, '3')).toEqual({ before: 3, after: 3 });
  });

  it('parses --before and --after independently', () => {
    expect(parseContextOptions('2', '4', undefined)).toEqual({ before: 2, after: 4 });
  });

  it('defaults to 0 when no args given', () => {
    expect(parseContextOptions(undefined, undefined, undefined)).toEqual({ before: 0, after: 0 });
  });

  it('throws on invalid context value', () => {
    expect(() => parseContextOptions(undefined, undefined, 'abc')).toThrow();
  });

  it('throws on negative before value', () => {
    expect(() => parseContextOptions('-1', '0', undefined)).toThrow();
  });
});
