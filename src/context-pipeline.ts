import { LogEntry } from './types';
import { ContextOptions, ContextResult, addContext } from './context';
import { evaluateFieldQuery } from './search';

export interface ContextPipelineOptions extends ContextOptions {
  query?: string;
  matchSubstring?: string;
}

/**
 * Finds matched indices in entries based on a query or substring match,
 * then expands results with surrounding context.
 */
export function runContextPipeline(
  entries: LogEntry[],
  options: ContextPipelineOptions
): ContextResult[] {
  if (!options.query && !options.matchSubstring) {
    return entries.map((entry) => ({ entry, context: 'match' as const }));
  }

  const matchedIndices = new Set<number>();

  entries.forEach((entry, i) => {
    if (options.query) {
      try {
        if (evaluateFieldQuery(entry, options.query)) {
          matchedIndices.add(i);
        }
      } catch {
        // skip unparseable entries
      }
    } else if (options.matchSubstring) {
      const raw = JSON.stringify(entry);
      if (raw.includes(options.matchSubstring)) {
        matchedIndices.add(i);
      }
    }
  });

  if (matchedIndices.size === 0) return [];

  return addContext(entries, matchedIndices, {
    before: options.before,
    after: options.after,
  });
}
