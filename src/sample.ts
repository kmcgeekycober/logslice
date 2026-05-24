import { LogEntry } from './types';

export type SampleMode = 'first' | 'last' | 'random' | 'nth';

export interface SampleOptions {
  mode: SampleMode;
  n: number;
  seed?: number;
}

export function parseSampleOption(raw: string): SampleOptions {
  const parts = raw.split(':');
  const mode = parts[0] as SampleMode;
  const validModes: SampleMode[] = ['first', 'last', 'random', 'nth'];
  if (!validModes.includes(mode)) {
    throw new Error(`Invalid sample mode: "${mode}". Expected one of: ${validModes.join(', ')}`);
  }
  const n = parts[1] !== undefined ? parseInt(parts[1], 10) : 10;
  if (isNaN(n) || n <= 0) {
    throw new Error(`Invalid sample count: "${parts[1]}". Must be a positive integer.`);
  }
  const seed = parts[2] !== undefined ? parseInt(parts[2], 10) : undefined;
  return { mode, n, seed };
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function sampleLogs(entries: LogEntry[], options: SampleOptions): LogEntry[] {
  const { mode, n, seed } = options;

  if (entries.length === 0) return [];

  switch (mode) {
    case 'first':
      return entries.slice(0, n);

    case 'last':
      return entries.slice(Math.max(0, entries.length - n));

    case 'nth': {
      const result: LogEntry[] = [];
      for (let i = 0; i < entries.length; i += n) {
        result.push(entries[i]);
      }
      return result;
    }

    case 'random': {
      if (n >= entries.length) return [...entries];
      const rand = seededRandom(seed ?? Date.now());
      const indices = new Set<number>();
      while (indices.size < n) {
        indices.add(Math.floor(rand() * entries.length));
      }
      return Array.from(indices)
        .sort((a, b) => a - b)
        .map(i => entries[i]);
    }

    default:
      return entries;
  }
}
