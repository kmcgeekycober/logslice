import { LogEntry } from './types';

export interface RateWindow {
  windowMs: number;
  count: number;
  entries: LogEntry[];
}

export interface RateResult {
  windowStart: string;
  windowEnd: string;
  count: number;
  rate: number; // events per second
  level?: string;
}

export function parseRateOption(option: string): number {
  const match = option.match(/^(\d+)(ms|s|m|h)$/);
  if (!match) throw new Error(`Invalid rate window: "${option}". Expected format: 10s, 5m, 1h, 500ms`);
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 'ms': return value;
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 3600 * 1000;
    default: throw new Error(`Unknown time unit: ${unit}`);
  }
}

export function computeRates(
  entries: LogEntry[],
  windowMs: number,
  groupByLevel = false
): RateResult[] {
  if (entries.length === 0) return [];

  const sorted = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const results: RateResult[] = [];
  const start = new Date(sorted[0].timestamp).getTime();
  const end = new Date(sorted[sorted.length - 1].timestamp).getTime();

  for (let windowStart = start; windowStart <= end; windowStart += windowMs) {
    const windowEnd = windowStart + windowMs;
    const inWindow = sorted.filter(e => {
      const t = new Date(e.timestamp).getTime();
      return t >= windowStart && t < windowEnd;
    });

    if (groupByLevel) {
      const byLevel: Record<string, LogEntry[]> = {};
      for (const e of inWindow) {
        const lvl = e.level ?? 'unknown';
        (byLevel[lvl] = byLevel[lvl] || []).push(e);
      }
      for (const [level, group] of Object.entries(byLevel)) {
        results.push({
          windowStart: new Date(windowStart).toISOString(),
          windowEnd: new Date(windowEnd).toISOString(),
          count: group.length,
          rate: group.length / (windowMs / 1000),
          level,
        });
      }
    } else {
      results.push({
        windowStart: new Date(windowStart).toISOString(),
        windowEnd: new Date(windowEnd).toISOString(),
        count: inWindow.length,
        rate: inWindow.length / (windowMs / 1000),
      });
    }
  }

  return results;
}

export function formatRateResults(results: RateResult[]): string {
  if (results.length === 0) return 'No rate data.';
  return results
    .map(r => {
      const levelTag = r.level ? ` [${r.level}]` : '';
      return `${r.windowStart} → ${r.windowEnd}${levelTag}: ${r.count} events (${r.rate.toFixed(2)}/s)`;
    })
    .join('\n');
}
