import { LogEntry } from './types';

export interface ContextOptions {
  before: number;
  after: number;
}

export interface ContextResult {
  entry: LogEntry;
  context: 'match' | 'before' | 'after';
}

/**
 * Given a list of matched indices and all entries, returns entries with
 * surrounding context lines (like grep -B / -A).
 */
export function addContext(
  entries: LogEntry[],
  matchedIndices: Set<number>,
  options: ContextOptions
): ContextResult[] {
  const { before, after } = options;
  const includedIndices = new Set<number>();

  for (const idx of matchedIndices) {
    for (let i = Math.max(0, idx - before); i <= Math.min(entries.length - 1, idx + after); i++) {
      includedIndices.add(i);
    }
  }

  const sorted = Array.from(includedIndices).sort((a, b) => a - b);

  return sorted.map((i) => ({
    entry: entries[i],
    context: matchedIndices.has(i)
      ? 'match'
      : i < Math.min(...Array.from(matchedIndices).filter((m) => m > i))
      ? 'before'
      : 'after',
  }));
}

export function parseContextOptions(
  beforeArg: string | undefined,
  afterArg: string | undefined,
  contextArg: string | undefined
): ContextOptions {
  if (contextArg !== undefined) {
    const n = parseInt(contextArg, 10);
    if (isNaN(n) || n < 0) throw new Error(`Invalid --context value: ${contextArg}`);
    return { before: n, after: n };
  }
  const before = beforeArg !== undefined ? parseInt(beforeArg, 10) : 0;
  const after = afterArg !== undefined ? parseInt(afterArg, 10) : 0;
  if (isNaN(before) || before < 0) throw new Error(`Invalid --before value: ${beforeArg}`);
  if (isNaN(after) || after < 0) throw new Error(`Invalid --after value: ${afterArg}`);
  return { before, after };
}
