import { LogEntry } from "./types";
import { parseTailOption, tailLogs, formatTailSummary, TailOptions } from "./tail";

export interface TailPipelineOptions {
  args: Record<string, string | boolean | undefined>;
  entries: LogEntry[];
  quiet?: boolean;
}

export interface TailPipelineResult {
  entries: LogEntry[];
  summary: string;
  options: TailOptions;
}

/**
 * Run the tail pipeline: parse options, slice entries, build summary.
 */
export function runTailPipeline(opts: TailPipelineOptions): TailPipelineResult {
  const options = parseTailOption(opts.args);
  const sliced = tailLogs(opts.entries, options.lines);
  const summary = opts.quiet
    ? ""
    : formatTailSummary(opts.entries.length, sliced.length);

  return { entries: sliced, summary, options };
}

/**
 * Format the tail pipeline output for display.
 * Returns formatted lines joined by newline.
 */
export function formatTailOutput(
  result: TailPipelineResult,
  formatter: (entry: LogEntry) => string
): string {
  const lines = result.entries.map(formatter);
  if (result.summary) {
    lines.push("", result.summary);
  }
  return lines.join("\n");
}
