import { LogEntry } from './types';
import { parseLogLines } from './parser';
import { parseQuery } from './query';
import { filterLogs } from './filter';
import { applySlice, parseSliceOption, formatSliceSummary, SliceOptions } from './slice';
import { formatEntries } from './formatter';

export interface SlicePipelineOptions {
  input: string;
  slice: string;
  query?: string;
  fields?: string[];
  color?: boolean;
}

export function parseSlicePipelineOptions(argv: Record<string, unknown>): SlicePipelineOptions {
  if (!argv.slice || typeof argv.slice !== 'string') {
    throw new Error('--slice option is required');
  }
  return {
    input: typeof argv.input === 'string' ? argv.input : '',
    slice: argv.slice,
    query: typeof argv.query === 'string' ? argv.query : undefined,
    fields: Array.isArray(argv.fields)
      ? (argv.fields as string[])
      : typeof argv.fields === 'string'
      ? [argv.fields]
      : undefined,
    color: argv.color === true,
  };
}

export function runSlicePipeline(
  lines: string[],
  options: SlicePipelineOptions
): { entries: LogEntry[]; summary: string; output: string } {
  const parsed = parseLogLines(lines);
  const sliceOpts: SliceOptions = parseSliceOption(options.slice);

  let filtered = parsed;
  if (options.query) {
    const query = parseQuery(options.query);
    filtered = filterLogs(parsed, query);
  }

  const sliced = applySlice(filtered, sliceOpts);
  const summary = formatSliceSummary(filtered.length, sliced.length);
  const output = formatEntries(sliced, { fields: options.fields, color: options.color });

  return { entries: sliced, summary, output };
}
