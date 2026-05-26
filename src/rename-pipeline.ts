import { LogEntry } from './types';
import { parseTransformOption, applyTransforms } from './transform';

export interface RenamePipelineOptions {
  renames: Array<{ from: string; to: string }>;
  strict: boolean;
}

export function parseRenamePipelineOptions(args: string[]): RenamePipelineOptions {
  const renames: Array<{ from: string; to: string }> = [];
  let strict = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--rename' && args[i + 1]) {
      const parts = args[++i].split(':');
      if (parts.length === 2) {
        renames.push({ from: parts[0].trim(), to: parts[1].trim() });
      }
    } else if (args[i] === '--strict') {
      strict = true;
    }
  }

  return { renames, strict };
}

export function runRenamePipeline(
  entries: LogEntry[],
  options: RenamePipelineOptions
): { entries: LogEntry[]; warnings: string[] } {
  const warnings: string[] = [];
  const transforms = options.renames.map(({ from, to }) =>
    parseTransformOption(`rename:${from}:${to}`)
  );

  const renamed = entries.map((entry) => {
    if (options.strict) {
      for (const { from } of options.renames) {
        if (!(from in entry)) {
          warnings.push(`Field "${from}" not found in entry at ${entry.timestamp ?? 'unknown'}`);
        }
      }
    }
    return applyTransforms(entry, transforms);
  });

  return { entries: renamed, warnings };
}

export function formatRenameSummary(
  options: RenamePipelineOptions,
  count: number,
  warnings: string[]
): string {
  const lines: string[] = [];
  lines.push(`Renamed ${options.renames.length} field(s) across ${count} entries.`);
  for (const { from, to } of options.renames) {
    lines.push(`  ${from} -> ${to}`);
  }
  if (warnings.length > 0) {
    lines.push(`Warnings (${warnings.length}):`);
    warnings.slice(0, 5).forEach((w) => lines.push(`  ! ${w}`));
    if (warnings.length > 5) lines.push(`  ... and ${warnings.length - 5} more`);
  }
  return lines.join('\n');
}
