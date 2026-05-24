import { LogEntry } from "./types";
import { flattenEntries, parseFlattenOption } from "./flatten";

export interface FlattenPipelineOptions {
  flatten?: string;
}

/**
 * Parses CLI-style options for the flatten pipeline step.
 * Accepts --flatten or --flatten=depth:N
 */
export function parseFlattenPipelineOptions(
  args: Record<string, string | boolean | undefined>
): { enabled: boolean; maxDepth: number } {
  const raw = args["flatten"];
  if (!raw) return { enabled: false, maxDepth: 5 };

  if (raw === true || raw === "true" || raw === "flat") {
    return { enabled: true, maxDepth: 5 };
  }

  const maxDepth = parseFlattenOption(String(raw));
  return { enabled: true, maxDepth };
}

/**
 * Runs the flatten pipeline step on a set of log entries.
 * Returns original entries if flatten is not enabled.
 */
export function runFlattenPipeline(
  entries: LogEntry[],
  options: { enabled: boolean; maxDepth: number }
): LogEntry[] {
  if (!options.enabled) return entries;
  return flattenEntries(entries, options.maxDepth);
}

/**
 * Formats a summary line for the flatten step.
 */
export function formatFlattenSummary(
  original: LogEntry[],
  flattened: LogEntry[],
  maxDepth: number
): string {
  const originalKeys = new Set(original.flatMap((e) => Object.keys(e))).size;
  const flattenedKeys = new Set(flattened.flatMap((e) => Object.keys(e))).size;
  return (
    `Flattened ${flattened.length} entr${flattened.length === 1 ? "y" : "ies"} ` +
    `(depth: ${maxDepth}) — keys: ${originalKeys} → ${flattenedKeys}`
  );
}
