import { highlightMatch, highlightEntry, highlightKey, highlightError } from './highlight';
import { LogEntry } from './types';

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RED = '\x1b[31m';

describe('highlightMatch', () => {
  it('wraps matched term with ANSI codes', () => {
    const result = highlightMatch('hello world', 'world');
    expect(result).toContain(`${BOLD}${YELLOW}world${RESET}`);
  });

  it('is case-insensitive', () => {
    const result = highlightMatch('Hello World', 'hello');
    expect(result).toContain(`${BOLD}${YELLOW}Hello${RESET}`);
  });

  it('returns original text when term is empty', () => {
    expect(highlightMatch('hello', '')).toBe('hello');
  });

  it('handles multiple matches', () => {
    const result = highlightMatch('foo foo foo', 'foo');
    const matches = result.split(`${BOLD}${YELLOW}foo${RESET}`);
    expect(matches.length).toBe(4);
  });

  it('escapes regex special characters in term', () => {
    expect(() => highlightMatch('price is $10.00', '$10.00')).not.toThrow();
    const result = highlightMatch('price is $10.00', '$10.00');
    expect(result).toContain(`${BOLD}${YELLOW}$10.00${RESET}`);
  });
});

describe('highlightEntry', () => {
  const entry: LogEntry = {
    timestamp: '2024-01-01T00:00:00Z',
    level: 'info',
    message: 'user login successful',
    service: 'auth',
  };

  it('highlights string fields containing the term', () => {
    const result = highlightEntry(entry, 'login');
    expect(result.message as string).toContain(`${BOLD}${YELLOW}login${RESET}`);
  });

  it('does not modify non-string fields', () => {
    const entryWithNum = { ...entry, code: 200 } as unknown as LogEntry;
    const result = highlightEntry(entryWithNum, 'info');
    expect(result.code).toBe(200);
  });

  it('returns entry unchanged when term is empty', () => {
    const result = highlightEntry(entry, '');
    expect(result.message).toBe(entry.message);
  });
});

describe('highlightKey', () => {
  it('wraps key with cyan ANSI codes', () => {
    expect(highlightKey('level')).toBe(`${CYAN}level${RESET}`);
  });
});

describe('highlightError', () => {
  it('wraps text with red bold ANSI codes', () => {
    expect(highlightError('ERROR')).toBe(`${RED}${BOLD}ERROR${RESET}`);
  });
});
