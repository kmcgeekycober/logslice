import { parseLogLines } from './parser';
import { filterLogs } from './filter';
import { search } from './search';
import { sortLogs, parseSortOption } from './sort';
import { deduplicateLogs } from './dedup';
import { truncateEntries } from './truncate';
import { formatEntries } from './formatter';
import { parseQuery } from './query';
import { PipelineOptions } from './types';

export function runPipeline(raw: string, options: PipelineOptions): string {
  let entries = parseLogLines(raw);

  if (options.filter) {
    entries = filterLogs(entries, options.filter);
  }

  if (options.fieldQuery) {
    const query = parseQuery(options.fieldQuery);
    entries = search(entries, query);
  }

  if (options.sort) {
    const sortOptions = parseSortOption(options.sort);
    entries = sortLogs(entries, sortOptions);
  }

  if (options.dedup) {
    entries = deduplicateLogs(entries);
  }

  if (options.truncate !== undefined) {
    entries = truncateEntries(entries, options.truncate);
  }

  return formatEntries(entries, options);
}
