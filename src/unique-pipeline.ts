import { LogEntry } from "./types";
import {
  parseUniqueOption,
  uniqueLogs,
  formatUniqueSummary,
  UniqueOptions,
} from "./unique";

export interface UniquePipelineOptions {
  uniqueField?: string;
  keepFirst?: boolean;
  summary?: boolean;
}

export function parseUniquePipelineOptions(
  args: Record<string, unknown>
): UniquePipelineOptions {
  const opts: UniquePipelineOptions = {};
  if (typeof args["unique"] === "string") {
    const parsed = parseUniqueOption(args["unique"]);
    opts.uniqueField = parsed.field;
    opts.keepFirst = parsed.keepFirst;
  }
  if (args["summary"] === true || args["summary"] === "true") {
    opts.summary = true;
  }
  return opts;
}

export interface UniquePipelineResult {
  entries: LogEntry[];
  originalCount: number;
  options: UniqueOptions | null;
}

export function runUniquePipeline(
  entries: LogEntry[],
  opts: UniquePipelineOptions
): UniquePipelineResult {
  if (!opts.uniqueField) {
    return { entries, originalCount: entries.length, options: null };
  }

  const options: UniqueOptions = {
    field: opts.uniqueField,
    keepFirst: opts.keepFirst ?? true,
  };

  const filtered = uniqueLogs(entries, options);
  return { entries: filtered, originalCount: entries.length, options };
}

export function formatUniquePipelineOutput(
  result: UniquePipelineResult,
  showSummary: boolean
): string {
  if (!result.options || !showSummary) return "";
  return formatUniqueSummary(
    result.originalCount,
    result.entries.length,
    result.options.field
  );
}
