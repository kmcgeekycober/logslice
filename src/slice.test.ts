import {
  sliceByIndex,
  sliceHead,
  sliceTail,
  applySlice,
  parseSliceOption,
  formatSliceSummary,
} from './slice';
import { LogEntry } from './types';

function makeEntry(i: number): LogEntry {
  return { timestamp: `2024-01-01T00:00:0${i}Z`, level: 'info', message: `msg ${i}` };
}

const entries: LogEntry[] = [0, 1, 2, 3, 4].map(makeEntry);

describe('sliceByIndex', () => {
  it('returns a range of entries', () => {
    expect(sliceByIndex(entries, 1, 3)).toHaveLength(2);
    expect(sliceByIndex(entries, 1, 3)[0].message).toBe('msg 1');
  });

  it('handles negative start', () => {
    expect(sliceByIndex(entries, -2)).toHaveLength(2);
  });

  it('clamps end beyond length', () => {
    expect(sliceByIndex(entries, 0, 100)).toHaveLength(5);
  });
});

describe('sliceHead', () => {
  it('returns first n entries', () => {
    expect(sliceHead(entries, 2)).toHaveLength(2);
    expect(sliceHead(entries, 2)[0].message).toBe('msg 0');
  });

  it('returns empty for n=0', () => {
    expect(sliceHead(entries, 0)).toHaveLength(0);
  });
});

describe('sliceTail', () => {
  it('returns last n entries', () => {
    const result = sliceTail(entries, 2);
    expect(result).toHaveLength(2);
    expect(result[0].message).toBe('msg 3');
  });

  it('returns empty for n=0', () => {
    expect(sliceTail(entries, 0)).toHaveLength(0);
  });
});

describe('applySlice', () => {
  it('applies head option', () => {
    expect(applySlice(entries, { head: 3 })).toHaveLength(3);
  });

  it('applies tail option', () => {
    expect(applySlice(entries, { tail: 2 })).toHaveLength(2);
  });

  it('applies start/end option', () => {
    expect(applySlice(entries, { start: 1, end: 4 })).toHaveLength(3);
  });

  it('returns all entries with empty options', () => {
    expect(applySlice(entries, {})).toHaveLength(5);
  });
});

describe('parseSliceOption', () => {
  it('parses head:', () => {
    expect(parseSliceOption('head:3')).toEqual({ head: 3 });
  });

  it('parses tail:', () => {
    expect(parseSliceOption('tail:2')).toEqual({ tail: 2 });
  });

  it('parses range 1:4', () => {
    expect(parseSliceOption('1:4')).toEqual({ start: 1, end: 4 });
  });

  it('parses open-ended range :3', () => {
    expect(parseSliceOption(':3')).toEqual({ start: 0, end: 3 });
  });

  it('throws on invalid input', () => {
    expect(() => parseSliceOption('invalid')).toThrow();
  });
});

describe('formatSliceSummary', () => {
  it('formats summary string', () => {
    expect(formatSliceSummary(100, 10)).toBe('Sliced 10 of 100 entries');
  });
});
