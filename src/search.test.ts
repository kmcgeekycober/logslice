import { search } from './search';

const sampleLines = [
  JSON.stringify({ ts: '2024-01-01T10:00:00Z', level: 'info',  service: 'api',  message: 'started' }),
  JSON.stringify({ ts: '2024-01-01T11:00:00Z', level: 'warn',  service: 'api',  message: 'slow response' }),
  JSON.stringify({ ts: '2024-01-01T12:00:00Z', level: 'error', service: 'auth', message: 'login failed' }),
  JSON.stringify({ ts: '2024-01-02T09:00:00Z', level: 'info',  service: 'auth', message: 'user created' }),
  'not valid json',
];

describe('search', () => {
  it('returns all valid entries when no query is given', () => {
    const result = search({ rawLines: sampleLines });
    expect(result.total).toBe(4);
    expect(result.matched).toBe(4);
  });

  it('filters by field equality', () => {
    const result = search({ rawLines: sampleLines, query: 'level=error' });
    expect(result.matched).toBe(1);
    expect(result.entries[0].fields['message']).toBe('login failed');
  });

  it('filters by field inequality', () => {
    const result = search({ rawLines: sampleLines, query: 'service!=auth' });
    expect(result.matched).toBe(2);
    result.entries.forEach(e => expect(e.fields['service']).toBe('api'));
  });

  it('filters by time range', () => {
    const result = search({
      rawLines: sampleLines,
      query: 'ts>=2024-01-01T11:00:00Z ts<=2024-01-01T12:00:00Z',
    });
    expect(result.matched).toBe(2);
  });

  it('combines time range and field filter', () => {
    const result = search({
      rawLines: sampleLines,
      query: 'ts>=2024-01-01T00:00:00Z ts<=2024-01-01T23:59:59Z level=warn',
    });
    expect(result.matched).toBe(1);
    expect(result.entries[0].fields['message']).toBe('slow response');
  });

  it('returns zero matches when nothing fits', () => {
    const result = search({ rawLines: sampleLines, query: 'level=debug' });
    expect(result.matched).toBe(0);
    expect(result.entries).toHaveLength(0);
  });

  it('reports correct total even when some lines are invalid', () => {
    const result = search({ rawLines: sampleLines, query: 'level=info' });
    expect(result.total).toBe(4); // only valid JSON lines
    expect(result.matched).toBe(2);
  });
});
