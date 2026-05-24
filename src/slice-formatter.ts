import { LogEntry } from './types';
import { SliceOptions } from './slice';

export function describeSliceOptions(options: SliceOptions): string {
  if (options.head !== undefined) {
    return `first ${options.head} entries`;
  }
  if (options.tail !== undefined) {
    return `last ${options.tail} entries`;
  }
  if (options.start !== undefined || options.end !== undefined) {
    const start = options.start ?? 0;
    const end = options.end !== undefined ? String(options.end) : 'end';
    return `entries [${start}:${end}]`;
  }
  return 'all entries';
}

export function formatSliceHeader(options: SliceOptions, total: number): string {
  const desc = describeSliceOptions(options);
  return `Showing ${desc} (${total} total)`;
}

export function formatSliceTable(entries: LogEntry[], fields: string[] = ['timestamp', 'level', 'message']): string {
  if (entries.length === 0) return '(no entries)';
  const header = fields.join('\t');
  const rows = entries.map((e) =>
    fields
      .map((f) => {
        const val = (e as Record<string, unknown>)[f];
        return val === undefined ? '' : String(val);
      })
      .join('\t')
  );
  return [header, ...rows].join('\n');
}

export function formatSliceReport(
  entries: LogEntry[],
  options: SliceOptions,
  totalBeforeSlice: number
): string {
  const header = formatSliceHeader(options, totalBeforeSlice);
  const table = formatSliceTable(entries);
  return `${header}\n${table}`;
}
