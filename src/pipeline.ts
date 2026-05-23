import { parseLogLines } from './parser';
import { filterLogs } from './filter';
import { parseQuery } from './query';
import { search } from './search';
import { formatEntries } from './formatter';
import type { LogEntry } from './types';
import type { PipelineOptions, PipelineResult } from './types';

/**
 * Runs the full log processing pipeline:
 * parse → filter (time range) → search (field query) → format
 */
export function runPipeline(raw: string, options: PipelineOptions): PipelineResult {
  const { from, to, fieldQuery, fields, colorize = false } = options;

  const entries: LogEntry[] = parseLogLines(raw);

  const timeFiltered = filterLogs(entries, { from, to });

  let queried: LogEntry[] = timeFiltered;
  if (fieldQuery && fieldQuery.trim().length > 0) {
    const parsedQuery = parseQuery(fieldQuery);
    queried = search(timeFiltered, parsedQuery);
  }

  const formatted = formatEntries(queried, { fields, colorize });

  return {
    entries: queried,
    output: formatted,
    totalParsed: entries.length,
    totalMatched: queried.length,
  };
}
