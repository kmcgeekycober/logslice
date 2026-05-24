import { LogEntry } from './types';
import { parseRateOption, computeRates, formatRateResults, RateResult } from './rate';

export interface RatePipelineOptions {
  window: string;
  groupByLevel?: boolean;
  json?: boolean;
}

export function parseRatePipelineOptions(args: Record<string, string | boolean>): RatePipelineOptions {
  const window = typeof args['rate-window'] === 'string' ? args['rate-window'] : '1m';
  const groupByLevel = args['rate-by-level'] === true;
  const json = args['json'] === true;
  return { window, groupByLevel, json };
}

export function runRatePipeline(
  entries: LogEntry[],
  options: RatePipelineOptions
): { results: RateResult[]; output: string } {
  const windowMs = parseRateOption(options.window);
  const results = computeRates(entries, windowMs, options.groupByLevel ?? false);

  let output: string;
  if (options.json) {
    output = JSON.stringify(results, null, 2);
  } else {
    output = formatRateResults(results);
  }

  return { results, output };
}

export function formatRateSummary(results: RateResult[]): string {
  if (results.length === 0) return 'Rate summary: no data.';
  const total = results.reduce((sum, r) => sum + r.count, 0);
  const maxRate = Math.max(...results.map(r => r.rate));
  const avgRate = results.reduce((sum, r) => sum + r.rate, 0) / results.length;
  return [
    `Rate summary over ${results.length} window(s):`,
    `  Total events : ${total}`,
    `  Peak rate    : ${maxRate.toFixed(2)}/s`,
    `  Avg rate     : ${avgRate.toFixed(2)}/s`,
  ].join('\n');
}
