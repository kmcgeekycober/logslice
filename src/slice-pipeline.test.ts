import { parseSlicePipelineOptions, runSlicePipeline } from './slice-pipeline';

const makeLines = (n: number): string[] =>
  Array.from({ length: n }, (_, i) =>
    JSON.stringify({
      timestamp: `2024-01-01T00:00:${String(i).padStart(2, '0')}Z`,
      level: 'info',
      message: `entry ${i}`,
    })
  );

describe('parseSlicePipelineOptions', () => {
  it('parses required slice option', () => {
    const opts = parseSlicePipelineOptions({ slice: 'head:5' });
    expect(opts.slice).toBe('head:5');
  });

  it('throws when slice is missing', () => {
    expect(() => parseSlicePipelineOptions({})).toThrow('--slice option is required');
  });

  it('parses optional fields as array', () => {
    const opts = parseSlicePipelineOptions({ slice: 'head:1', fields: ['level', 'message'] });
    expect(opts.fields).toEqual(['level', 'message']);
  });

  it('parses optional fields as string', () => {
    const opts = parseSlicePipelineOptions({ slice: 'head:1', fields: 'level' });
    expect(opts.fields).toEqual(['level']);
  });
});

describe('runSlicePipeline', () => {
  it('slices head entries', () => {
    const lines = makeLines(10);
    const { entries, summary } = runSlicePipeline(lines, { input: '', slice: 'head:3' });
    expect(entries).toHaveLength(3);
    expect(entries[0].message).toBe('entry 0');
    expect(summary).toContain('3 of 10');
  });

  it('slices tail entries', () => {
    const lines = makeLines(10);
    const { entries } = runSlicePipeline(lines, { input: '', slice: 'tail:2' });
    expect(entries).toHaveLength(2);
    expect(entries[0].message).toBe('entry 8');
  });

  it('slices by range', () => {
    const lines = makeLines(10);
    const { entries } = runSlicePipeline(lines, { input: '', slice: '2:5' });
    expect(entries).toHaveLength(3);
    expect(entries[0].message).toBe('entry 2');
  });

  it('applies query before slicing', () => {
    const lines = [
      JSON.stringify({ timestamp: '2024-01-01T00:00:00Z', level: 'error', message: 'err' }),
      ...makeLines(8),
    ];
    const { entries } = runSlicePipeline(lines, {
      input: '',
      slice: 'head:1',
      query: 'level:error',
    });
    expect(entries).toHaveLength(1);
    expect(entries[0].level).toBe('error');
  });

  it('returns output string', () => {
    const lines = makeLines(3);
    const { output } = runSlicePipeline(lines, { input: '', slice: 'head:2' });
    expect(typeof output).toBe('string');
    expect(output.length).toBeGreaterThan(0);
  });
});
