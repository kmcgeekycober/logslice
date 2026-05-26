import { parseRenamePipelineOptions, runRenamePipeline, formatRenameSummary } from './rename-pipeline';
import { LogEntry } from './types';

function makeEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    timestamp: '2024-01-01T00:00:00.000Z',
    level: 'info',
    message: 'test',
    ...overrides,
  } as LogEntry;
}

describe('parseRenamePipelineOptions', () => {
  it('parses rename args', () => {
    const opts = parseRenamePipelineOptions(['--rename', 'msg:message', '--rename', 'lvl:level']);
    expect(opts.renames).toEqual([
      { from: 'msg', to: 'message' },
      { from: 'lvl', to: 'level' },
    ]);
    expect(opts.strict).toBe(false);
  });

  it('parses strict flag', () => {
    const opts = parseRenamePipelineOptions(['--rename', 'a:b', '--strict']);
    expect(opts.strict).toBe(true);
  });

  it('ignores malformed rename args', () => {
    const opts = parseRenamePipelineOptions(['--rename', 'nodash']);
    expect(opts.renames).toHaveLength(0);
  });
});

describe('runRenamePipeline', () => {
  it('renames fields in entries', () => {
    const entries = [makeEntry({ msg: 'hello' } as any)];
    const { entries: result } = runRenamePipeline(entries, {
      renames: [{ from: 'msg', to: 'message' }],
      strict: false,
    });
    expect((result[0] as any).message).toBe('hello');
    expect((result[0] as any).msg).toBeUndefined();
  });

  it('returns no warnings in non-strict mode for missing fields', () => {
    const entries = [makeEntry()];
    const { warnings } = runRenamePipeline(entries, {
      renames: [{ from: 'nonexistent', to: 'x' }],
      strict: false,
    });
    expect(warnings).toHaveLength(0);
  });

  it('returns warnings in strict mode for missing fields', () => {
    const entries = [makeEntry()];
    const { warnings } = runRenamePipeline(entries, {
      renames: [{ from: 'nonexistent', to: 'x' }],
      strict: true,
    });
    expect(warnings.length).toBeGreaterThan(0);
  });
});

describe('formatRenameSummary', () => {
  it('formats summary with no warnings', () => {
    const out = formatRenameSummary({ renames: [{ from: 'a', to: 'b' }], strict: false }, 10, []);
    expect(out).toContain('1 field(s)');
    expect(out).toContain('10 entries');
    expect(out).toContain('a -> b');
  });

  it('includes warnings when present', () => {
    const out = formatRenameSummary(
      { renames: [{ from: 'x', to: 'y' }], strict: true },
      5,
      ['Field "x" not found in entry at 2024-01-01T00:00:00.000Z']
    );
    expect(out).toContain('Warnings');
  });
});
