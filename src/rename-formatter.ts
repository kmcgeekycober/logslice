import { LogEntry } from './types';
import { RenamePipelineOptions } from './rename-pipeline';

export function formatRenameHeader(options: RenamePipelineOptions): string {
  if (options.renames.length === 0) return 'No renames configured.';
  const pairs = options.renames.map(({ from, to }) => `${from} -> ${to}`).join(', ');
  return `Rename: [${pairs}]${options.strict ? ' (strict)' : ''}`;
}

export function formatRenameTable(entries: LogEntry[], fields: string[]): string {
  if (entries.length === 0) return '(no entries)';

  const rows = entries.slice(0, 20).map((entry) =>
    fields.map((f) => String((entry as any)[f] ?? '')).join(' | ')
  );

  const header = fields.join(' | ');
  const divider = fields.map((f) => '-'.repeat(Math.max(f.length, 6))).join('-+-');
  return [header, divider, ...rows].join('\n');
}

export function describeRenameEffect(
  before: LogEntry,
  after: LogEntry,
  renames: Array<{ from: string; to: string }>
): string {
  const changes: string[] = [];
  for (const { from, to } of renames) {
    const hadBefore = from in before;
    const hasAfter = to in after;
    if (hadBefore && hasAfter) {
      changes.push(`  ${from} -> ${to}: "${(after as any)[to]}"`);
    } else if (!hadBefore) {
      changes.push(`  ${from}: (not present)`);
    }
  }
  return changes.length > 0 ? changes.join('\n') : '  (no changes)';
}

export function formatRenameReport(
  options: RenamePipelineOptions,
  before: LogEntry[],
  after: LogEntry[]
): string {
  const lines: string[] = [formatRenameHeader(options), ''];
  const count = Math.min(before.length, after.length, 3);
  for (let i = 0; i < count; i++) {
    lines.push(`Entry ${i + 1}:`);
    lines.push(describeRenameEffect(before[i], after[i], options.renames));
  }
  if (before.length > 3) {
    lines.push(`... and ${before.length - 3} more entries`);
  }
  return lines.join('\n');
}
