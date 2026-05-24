import { LogEntry } from "./types";
import { diffLog, formatDiffs, EntryDiff } from "./diff";

export interface DiffPipelineOptions {
  entries: LogEntry[];
  outputFormat?: "text" | "json";
  onlyChanged?: boolean;
}

export interface DiffPipelineResult {
  diffs: EntryDiff[];
  total: number;
  formatted: string;
}

export function runDiffPipeline(options: DiffPipelineOptions): DiffPipelineResult {
  const { entries, outputFormat = "text", onlyChanged = true } = options;

  const diffs = diffLog(entries);

  const filtered = onlyChanged
    ? diffs.filter(
        (d) => d.added.length > 0 || d.removed.length > 0 || d.changed.length > 0
      )
    : diffs;

  let formatted: string;
  if (outputFormat === "json") {
    formatted = JSON.stringify(filtered, null, 2);
  } else {
    formatted = formatDiffs(filtered);
  }

  return {
    diffs: filtered,
    total: filtered.length,
    formatted,
  };
}

export function formatDiffSummary(result: DiffPipelineResult): string {
  if (result.total === 0) {
    return "Diff summary: no changes detected between consecutive entries.";
  }
  return `Diff summary: ${result.total} transition(s) with field changes detected.`;
}
