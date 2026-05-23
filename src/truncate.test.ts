import { truncateValue, truncateEntry, truncateEntries, DEFAULT_MAX_LENGTH } from './truncate';

describe('truncateValue', () => {
  it('returns the string unchanged when within limit', () => {
    expect(truncateValue('hello', 10)).toBe('hello');
  });

  it('truncates and appends ellipsis when over limit', () => {
    const long = 'a'.repeat(200);
    const result = truncateValue(long, 100);
    expect(result).toHaveLength(101); // 100 chars + ellipsis char
    expect(result.endsWith('…')).toBe(true);
  });

  it('uses DEFAULT_MAX_LENGTH when no maxLength provided', () => {
    const long = 'x'.repeat(DEFAULT_MAX_LENGTH + 10);
    const result = truncateValue(long);
    expect(result).toHaveLength(DEFAULT_MAX_LENGTH + 1);
    expect(result.endsWith('…')).toBe(true);
  });

  it('returns string exactly at limit unchanged', () => {
    const exact = 'b'.repeat(DEFAULT_MAX_LENGTH);
    expect(truncateValue(exact)).toBe(exact);
  });
});

describe('truncateEntry', () => {
  it('truncates string fields that exceed maxLength', () => {
    const entry = { msg: 'a'.repeat(200), level: 'info' };
    const result = truncateEntry(entry, 50);
    expect((result.msg as string).length).toBe(51);
    expect((result.msg as string).endsWith('…')).toBe(true);
  });

  it('leaves short string fields unchanged', () => {
    const entry = { msg: 'short', level: 'warn' };
    const result = truncateEntry(entry, 50);
    expect(result.msg).toBe('short');
  });

  it('leaves non-string fields unchanged', () => {
    const entry = { count: 42, active: true, tags: ['a', 'b'] };
    const result = truncateEntry(entry, 5);
    expect(result.count).toBe(42);
    expect(result.active).toBe(true);
    expect(result.tags).toEqual(['a', 'b']);
  });

  it('handles empty entry', () => {
    expect(truncateEntry({})).toEqual({});
  });
});

describe('truncateEntries', () => {
  it('applies truncation to all entries', () => {
    const entries = [
      { msg: 'a'.repeat(200) },
      { msg: 'short' },
    ];
    const results = truncateEntries(entries, 50);
    expect((results[0].msg as string).endsWith('…')).toBe(true);
    expect(results[1].msg).toBe('short');
  });

  it('returns empty array for empty input', () => {
    expect(truncateEntries([])).toEqual([]);
  });
});
