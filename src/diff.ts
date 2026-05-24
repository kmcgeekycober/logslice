import { LogEntry } from "./types";

export interface FieldDiff {
  field: string;
  before: unknown;
  after: unknown;
}

export interface EntryDiff {
  index: number;
  added: string[];
  removed: string[];
  changed: FieldDiff[];
}

export function diffEntries(a: LogEntry, b: LogEntry): EntryDiff {
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const added: string[] = [];
  const removed: string[] = [];
  const changed: FieldDiff[] = [];

  for (const key of allKeys) {
    const inA = Object.prototype.hasOwnProperty.call(a, key);
    const inB = Object.prototype.hasOwnProperty.call(b, key);

    if (inA && !inB) {
      removed.push(key);
    } else if (!inA && inB) {
      added.push(key);
    } else if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) {
      changed.push({ field: key, before: a[key], after: b[key] });
    }
  }

  return { index: 0, added, removed, changed };
}

export function diffLog(entries: LogEntry[]): EntryDiff[] {
  if (entries.length < 2) return [];

  const diffs: EntryDiff[] = [];
  for (let i = 1; i < entries.length; i++) {
    const diff = diffEntries(entries[i - 1], entries[i]);
    diff.index = i;
    if (diff.added.length || diff.removed.length || diff.changed.length) {
      diffs.push(diff);
    }
  }
  return diffs;
}

export function formatDiff(diff: EntryDiff): string {
  const lines: string[] = [`Entry #${diff.index}:`];

  for (const key of diff.added) {
    lines.push(`  + ${key} (added)`);
  }
  for (const key of diff.removed) {
    lines.push(`  - ${key} (removed)`);
  }
  for (const { field, before, after } of diff.changed) {
    lines.push(`  ~ ${field}: ${JSON.stringify(before)} → ${JSON.stringify(after)}`);
  }

  return lines.join("\n");
}

export function formatDiffs(diffs: EntryDiff[]): string {
  if (diffs.length === 0) return "No differences found.";
  return diffs.map(formatDiff).join("\n\n");
}
