import type { LogEntry, PipelineResult } from './types';

export interface SummaryStats {
  totalParsed: number;
  totalMatched: number;
  matchRate: string;
  levelCounts: Record<string, number>;
  earliestTimestamp: string | null;
  latestTimestamp: string | null;
}

export function buildSummary(result: PipelineResult): SummaryStats {
  const { entries, totalParsed, totalMatched } = result;

  const levelCounts: Record<string, number> = {};
  let earliest: Date | null = null;
  let latest: Date | null = null;

  for (const entry of entries) {
    const level = (entry.level ?? 'unknown').toLowerCase();
    levelCounts[level] = (levelCounts[level] ?? 0) + 1;

    if (entry.timestamp) {
      const ts = new Date(entry.timestamp);
      if (!isNaN(ts.getTime())) {
        if (earliest === null || ts < earliest) earliest = ts;
        if (latest === null || ts > latest) latest = ts;
      }
    }
  }

  const matchRate =
    totalParsed > 0
      ? `${((totalMatched / totalParsed) * 100).toFixed(1)}%`
      : '0.0%';

  return {
    totalParsed,
    totalMatched,
    matchRate,
    levelCounts,
    earliestTimestamp: earliest ? earliest.toISOString() : null,
    latestTimestamp: latest ? latest.toISOString() : null,
  };
}

export function formatSummary(stats: SummaryStats): string {
  const lines: string[] = [
    `Parsed: ${stats.totalParsed}  Matched: ${stats.totalMatched}  (${stats.matchRate})`,
  ];
  if (Object.keys(stats.levelCounts).length > 0) {
    const levels = Object.entries(stats.levelCounts)
      .map(([k, v]) => `${k}=${v}`)
      .join('  ');
    lines.push(`Levels: ${levels}`);
  }
  if (stats.earliestTimestamp) {
    lines.push(`Range: ${stats.earliestTimestamp} → ${stats.latestTimestamp}`);
  }
  return lines.join('\n');
}
