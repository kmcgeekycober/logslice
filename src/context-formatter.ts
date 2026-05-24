import { ContextResult } from './context';
import { formatEntry } from './formatter';

const SEPARATOR = '--';

/**
 * Formats context results into human-readable lines, inserting separators
 * between non-contiguous groups (similar to grep context output).
 */
export function formatContextResults(
  results: ContextResult[],
  fields?: string[]
): string[] {
  const lines: string[] = [];
  let lastWasGap = false;

  for (let i = 0; i < results.length; i++) {
    const current = results[i];
    const prev = results[i - 1];

    if (i > 0 && prev) {
      const prevEntry = prev.entry;
      const currEntry = current.entry;
      const prevTs = prevEntry.timestamp ?? '';
      const currTs = currEntry.timestamp ?? '';
      const isContiguous = prevTs && currTs ? true : false;
      // Insert separator when there's a logical gap between groups
      const prevContext = prev.context;
      const currContext = current.context;
      if (
        !lastWasGap &&
        prevContext === 'after' &&
        currContext === 'before'
      ) {
        lines.push(SEPARATOR);
        lastWasGap = true;
      } else {
        lastWasGap = false;
      }
      void isContiguous;
    }

    const prefix = current.context === 'match' ? '>' : ' ';
    const formatted = formatEntry(current.entry, fields);
    lines.push(`${prefix} ${formatted}`);
  }

  return lines;
}

export function formatContextSummary(results: ContextResult[]): string {
  const matches = results.filter((r) => r.context === 'match').length;
  const total = results.length;
  return `${matches} match(es) shown with ${total - matches} context line(s)`;
}
