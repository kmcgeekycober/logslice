import { runPipeline } from './pipeline';

const sampleLogs = [
  JSON.stringify({ timestamp: '2024-01-10T10:00:00Z', level: 'info', message: 'Server started', service: 'api' }),
  JSON.stringify({ timestamp: '2024-01-10T10:05:00Z', level: 'warn', message: 'High memory', service: 'worker' }),
  JSON.stringify({ timestamp: '2024-01-10T10:10:00Z', level: 'error', message: 'DB connection failed', service: 'api' }),
  JSON.stringify({ timestamp: '2024-01-10T10:15:00Z', level: 'info', message: 'Request handled', service: 'api' }),
  'not-json-line',
].join('\n');

describe('runPipeline', () => {
  it('returns all valid entries with no filters', () => {
    const result = runPipeline(sampleLogs, {});
    expect(result.totalParsed).toBe(4);
    expect(result.totalMatched).toBe(4);
  });

  it('filters by time range', () => {
    const result = runPipeline(sampleLogs, {
      from: new Date('2024-01-10T10:04:00Z'),
      to: new Date('2024-01-10T10:11:00Z'),
    });
    expect(result.totalMatched).toBe(2);
  });

  it('filters by field query', () => {
    const result = runPipeline(sampleLogs, { fieldQuery: 'service=api' });
    expect(result.totalMatched).toBe(3);
  });

  it('combines time range and field query', () => {
    const result = runPipeline(sampleLogs, {
      from: new Date('2024-01-10T10:04:00Z'),
      fieldQuery: 'service=api',
    });
    expect(result.totalMatched).toBe(2);
  });

  it('returns formatted output string', () => {
    const result = runPipeline(sampleLogs, {});
    expect(typeof result.output).toBe('string');
    expect(result.output.length).toBeGreaterThan(0);
  });

  it('handles empty input gracefully', () => {
    const result = runPipeline('', {});
    expect(result.totalParsed).toBe(0);
    expect(result.totalMatched).toBe(0);
    expect(result.output).toBe('');
  });

  it('handles input with only invalid JSON lines', () => {
    const result = runPipeline('not-json\nalso-not-json', {});
    expect(result.totalParsed).toBe(0);
    expect(result.totalMatched).toBe(0);
    expect(result.output).toBe('');
  });

  it('filters by level field query', () => {
    const result = runPipeline(sampleLogs, { fieldQuery: 'level=error' });
    expect(result.totalMatched).toBe(1);
  });
});
