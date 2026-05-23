/**
 * High-level search interface combining parsing, filtering, and query evaluation.
 */

import { parseLogLines, LogEntry } from './parser';
import { filterLogs, FilterOptions } from './filter';
import { parseQuery, FieldQuery, Operator } from './query';

export interface SearchOptions {
  query?: string;
  rawLines: string[];
}

export interface SearchResult {
  entries: LogEntry[];
  total: number;
  matched: number;
}

function evaluateFieldQuery(entry: LogEntry, fq: FieldQuery): boolean {
  const raw = entry.fields[fq.field];
  if (raw === undefined) return false;

  const entryVal = String(raw);
  const queryVal = fq.value;

  const numEntry = parseFloat(entryVal);
  const numQuery = parseFloat(queryVal);
  const numericComparison = !isNaN(numEntry) && !isNaN(numQuery);

  switch (fq.operator as Operator) {
    case '=':  return entryVal === queryVal;
    case '!=': return entryVal !== queryVal;
    case '>':  return numericComparison ? numEntry > numQuery : entryVal > queryVal;
    case '>=': return numericComparison ? numEntry >= numQuery : entryVal >= queryVal;
    case '<':  return numericComparison ? numEntry < numQuery : entryVal < queryVal;
    case '<=': return numericComparison ? numEntry <= numQuery : entryVal <= queryVal;
    default:   return false;
  }
}

/**
 * Search raw log lines using an optional query string.
 */
export function search(options: SearchOptions): SearchResult {
  const { rawLines, query } = options;
  const allEntries = parseLogLines(rawLines);

  if (!query || query.trim() === '') {
    return { entries: allEntries, total: allEntries.length, matched: allEntries.length };
  }

  const parsed = parseQuery(query);

  const filterOptions: FilterOptions = {
    timeFrom: parsed.timeFrom,
    timeTo: parsed.timeTo,
  };

  let filtered = filterLogs(allEntries, filterOptions);

  if (parsed.fields.length > 0) {
    filtered = filtered.filter(entry =>
      parsed.fields.every(fq => evaluateFieldQuery(entry, fq))
    );
  }

  return {
    entries: filtered,
    total: allEntries.length,
    matched: filtered.length,
  };
}
