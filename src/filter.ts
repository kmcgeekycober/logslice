import { LogEntry } from './parser';

export interface FilterOptions {
  from?: Date;
  to?: Date;
  fields?: Record<string, string | number | boolean>;
  level?: string;
}

/**
 * Filters an array of parsed log entries based on time range and field criteria.
 */
export function filterLogs(entries: LogEntry[], options: FilterOptions): LogEntry[] {
  return entries.filter((entry) => {
    if (options.from || options.to) {
      const timestamp = entry.timestamp ? new Date(entry.timestamp) : null;

      if (!timestamp || isNaN(timestamp.getTime())) {
        return false;
      }

      if (options.from && timestamp < options.from) {
        return false;
      }

      if (options.to && timestamp > options.to) {
        return false;
      }
    }

    if (options.level) {
      if (!entry.level || entry.level.toLowerCase() !== options.level.toLowerCase()) {
        return false;
      }
    }

    if (options.fields) {
      for (const [key, value] of Object.entries(options.fields)) {
        const entryValue = (entry as Record<string, unknown>)[key];
        if (entryValue === undefined || entryValue === null) {
          return false;
        }
        // eslint-disable-next-line eqeqeq
        if (String(entryValue) !== String(value)) {
          return false;
        }
      }
    }

    return true;
  });
}
