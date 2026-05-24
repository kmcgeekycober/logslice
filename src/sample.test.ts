import { parseSampleOption, sampleLogs, SampleOptions } from './sample';
import { LogEntry } from './types';

function makeEntry(i: number): LogEntry {
  return { timestamp: `2024-01-01T00:00:0${i % 10}Z`, level: 'info', message: `msg ${i}` };
}

const entries: LogEntry[] = Array.from({ length: 20 }, (_, i) => makeEntry(i));

describe('parseSampleOption', () => {
  it('parses first mode with count', () => {
    expect(parseSampleOption('first:5')).toEqual({ mode: 'first', n: 5, seed: undefined });
  });

  it('parses last mode with count', () => {
    expect(parseSampleOption('last:3')).toEqual({ mode: 'last', n: 3, seed: undefined });
  });

  it('parses nth mode with count', () => {
    expect(parseSampleOption('nth:4')).toEqual({ mode: 'nth', n: 4, seed: undefined });
  });

  it('parses random mode with seed', () => {
    expect(parseSampleOption('random:5:42')).toEqual({ mode: 'random', n: 5, seed: 42 });
  });

  it('defaults n to 10 when not provided', () => {
    expect(parseSampleOption('first').n).toBe(10);
  });

  it('throws on invalid mode', () => {
    expect(() => parseSampleOption('unknown:5')).toThrow('Invalid sample mode');
  });

  it('throws on invalid count', () => {
    expect(() => parseSampleOption('first:0')).toThrow('Invalid sample count');
  });
});

describe('sampleLogs', () => {
  it('returns empty array for empty input', () => {
    expect(sampleLogs([], { mode: 'first', n: 5 })).toEqual([]);
  });

  it('samples first n entries', () => {
    const result = sampleLogs(entries, { mode: 'first', n: 3 });
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(entries[0]);
    expect(result[2]).toEqual(entries[2]);
  });

  it('samples last n entries', () => {
    const result = sampleLogs(entries, { mode: 'last', n: 3 });
    expect(result).toHaveLength(3);
    expect(result[result.length - 1]).toEqual(entries[entries.length - 1]);
  });

  it('samples every nth entry', () => {
    const result = sampleLogs(entries, { mode: 'nth', n: 5 });
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual(entries[0]);
    expect(result[1]).toEqual(entries[5]);
  });

  it('samples random entries with seed', () => {
    const opts: SampleOptions = { mode: 'random', n: 5, seed: 99 };
    const r1 = sampleLogs(entries, opts);
    const r2 = sampleLogs(entries, opts);
    expect(r1).toHaveLength(5);
    expect(r1).toEqual(r2);
  });

  it('returns all entries when random n >= length', () => {
    const result = sampleLogs(entries, { mode: 'random', n: 100, seed: 1 });
    expect(result).toHaveLength(entries.length);
  });
});
