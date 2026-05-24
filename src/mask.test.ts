import { maskValue, maskField, parseMaskOption, applyMaskRules } from './mask';
import { LogEntry } from './types';

const entry: LogEntry = {
  timestamp: '2024-01-01T00:00:00Z',
  level: 'info',
  message: 'token=abc123 user logged in',
  email: 'user@example.com',
};

describe('maskValue', () => {
  it('replaces matches with default mask', () => {
    const result = maskValue('hello world', /world/);
    expect(result).toBe('hello ***');
  });

  it('uses custom mask string', () => {
    const result = maskValue('secret=abc', /abc/, '[REDACTED]');
    expect(result).toBe('secret=[REDACTED]');
  });

  it('replaces all occurrences with global flag', () => {
    const result = maskValue('a a a', /a/g);
    expect(result).toBe('*** *** ***');
  });
});

describe('maskField', () => {
  it('masks a string field', () => {
    const result = maskField(entry, 'email', /@.*$/);
    expect(result.email).toBe('user***');
  });

  it('skips non-string fields', () => {
    const withNum = { ...entry, count: 42 };
    const result = maskField(withNum as LogEntry, 'count', /42/);
    expect(result.count).toBe(42);
  });

  it('returns unchanged entry for missing field', () => {
    const result = maskField(entry, 'missing', /x/);
    expect(result).toEqual(entry);
  });
});

describe('parseMaskOption', () => {
  it('parses basic field=/pattern/', () => {
    const rule = parseMaskOption('email=/[a-z]+@[a-z.]+/');
    expect(rule.field).toBe('email');
    expect(rule.pattern).toBeInstanceOf(RegExp);
    expect(rule.mask).toBe('***');
  });

  it('parses with custom mask', () => {
    const rule = parseMaskOption('message=/token=\\w+/,mask=[TOKEN]');
    expect(rule.mask).toBe('[TOKEN]');
  });

  it('throws on invalid format', () => {
    expect(() => parseMaskOption('badformat')).toThrow('Invalid mask option');
  });
});

describe('applyMaskRules', () => {
  it('applies multiple rules to all entries', () => {
    const rules = [
      { field: 'email', pattern: /@.*$/, mask: '@...' },
      { field: 'message', pattern: /token=\w+/, mask: 'token=***' },
    ];
    const results = applyMaskRules([entry], rules);
    expect(results[0].email).toBe('user@...');
    expect(results[0].message).toContain('token=***');
  });
});
