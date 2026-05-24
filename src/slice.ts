import { LogEntry } from './types';

export interface SliceOptions {
  start?: number;
  end?: number;
  head?: number;
  tail?: number;
}

export function sliceByIndex(entries: LogEntry[], start: number, end?: number): LogEntry[] {
  const normalizedStart = start < 0 ? Math.max(0, entries.length + start) : start;
  const normalizedEnd =
    end === undefined
      ? entries.length
      : end < 0
      ? Math.max(0, entries.length + end)
      : Math.min(end, entries.length);
  return entries.slice(normalizedStart, normalizedEnd);
}

export function sliceHead(entries: LogEntry[], n: number): LogEntry[] {
  if (n <= 0) return [];
  return entries.slice(0, n);
}

export function sliceTail(entries: LogEntry[], n: number): LogEntry[] {
  if (n <= 0) return [];
  return entries.slice(Math.max(0, entries.length - n));
}

export function applySlice(entries: LogEntry[], options: SliceOptions): LogEntry[] {
  if (options.head !== undefined) {
    return sliceHead(entries, options.head);
  }
  if (options.tail !== undefined) {
    return sliceTail(entries, options.tail);
  }
  if (options.start !== undefined || options.end !== undefined) {
    return sliceByIndex(entries, options.start ?? 0, options.end);
  }
  return entries;
}

export function parseSliceOption(raw: string): SliceOptions {
  if (raw.startsWith('head:')) {
    const n = parseInt(raw.slice(5), 10);
    if (isNaN(n)) throw new Error(`Invalid head value: ${raw}`);
    return { head: n };
  }
  if (raw.startsWith('tail:')) {
    const n = parseInt(raw.slice(5), 10);
    if (isNaN(n)) throw new Error(`Invalid tail value: ${raw}`);
    return { tail: n };
  }
  const parts = raw.split(':');
  if (parts.length === 2) {
    const start = parts[0] === '' ? 0 : parseInt(parts[0], 10);
    const end = parts[1] === '' ? undefined : parseInt(parts[1], 10);
    if (isNaN(start) || (end !== undefined && isNaN(end))) {
      throw new Error(`Invalid slice range: ${raw}`);
    }
    return { start, end };
  }
  throw new Error(`Unrecognized slice option: ${raw}`);
}

export function formatSliceSummary(total: number, sliced: number): string {
  return `Sliced ${sliced} of ${total} entries`;
}
