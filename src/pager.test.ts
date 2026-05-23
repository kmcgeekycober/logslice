import { paginate, runPager } from './pager';

describe('paginate', () => {
  it('splits lines into chunks of the given page size', () => {
    const lines = ['a', 'b', 'c', 'd', 'e'];
    const pages = paginate(lines, 2);
    expect(pages).toEqual([['a', 'b'], ['c', 'd'], ['e']]);
  });

  it('returns a single page when lines fit within page size', () => {
    const lines = ['x', 'y'];
    const pages = paginate(lines, 10);
    expect(pages).toHaveLength(1);
    expect(pages[0]).toEqual(['x', 'y']);
  });

  it('returns empty array for empty input', () => {
    expect(paginate([], 5)).toEqual([]);
  });

  it('handles page size equal to line count', () => {
    const lines = ['1', '2', '3'];
    const pages = paginate(lines, 3);
    expect(pages).toHaveLength(1);
  });

  it('handles page size of 1', () => {
    const lines = ['a', 'b', 'c'];
    const pages = paginate(lines, 1);
    expect(pages).toEqual([['a'], ['b'], ['c']]);
  });
});

describe('runPager', () => {
  let output: string[];
  let originalWrite: typeof process.stdout.write;

  beforeEach(() => {
    output = [];
    originalWrite = process.stdout.write.bind(process.stdout);
    jest.spyOn(process.stdout, 'write').mockImplementation((chunk: unknown) => {
      output.push(String(chunk));
      return true;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('prints all lines in non-interactive mode', async () => {
    const lines = ['line1', 'line2', 'line3'];
    await runPager(lines, { interactive: false });
    expect(output.join('')).toContain('line1');
    expect(output.join('')).toContain('line2');
    expect(output.join('')).toContain('line3');
  });

  it('prints all lines when count is within page size', async () => {
    const lines = ['a', 'b'];
    await runPager(lines, { pageSize: 10, interactive: false });
    expect(output).toHaveLength(2);
  });

  it('handles empty lines array', async () => {
    await runPager([], { interactive: false });
    expect(output).toHaveLength(0);
  });
});
