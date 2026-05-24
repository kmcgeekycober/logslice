import { LogEntry } from "./types";
import { ExportFormat, exportEntries, parseExportFormat } from "./export";

export interface ExportOptions {
  format: ExportFormat;
  outputPath?: string;
}

export function parseExportOptions(args: Record<string, string | undefined>): ExportOptions | null {
  const raw = args["--export"] ?? args["-e"];
  if (!raw) return null;

  const format = parseExportFormat(raw);
  const outputPath = args["--output"] ?? args["-o"];

  return { format, outputPath };
}

export function runExport(
  entries: LogEntry[],
  options: ExportOptions,
  write: (path: string, content: string) => void,
  print: (content: string) => void
): void {
  const content = exportEntries(entries, options.format);

  if (options.outputPath) {
    write(options.outputPath, content);
  } else {
    print(content);
  }
}

export function formatExportSummary(count: number, format: ExportFormat, outputPath?: string): string {
  const dest = outputPath ? `→ ${outputPath}` : "→ stdout";
  return `Exported ${count} entr${count === 1 ? "y" : "ies"} as ${format.toUpperCase()} ${dest}`;
}
