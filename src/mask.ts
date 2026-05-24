import { LogEntry } from './types';

const DEFAULT_MASK = '***';

export function maskValue(value: string, pattern: RegExp, mask = DEFAULT_MASK): string {
  return value.replace(pattern, mask);
}

export function maskField(
  entry: LogEntry,
  field: string,
  pattern: RegExp,
  mask = DEFAULT_MASK
): LogEntry {
  const val = entry[field];
  if (typeof val !== 'string') return entry;
  return { ...entry, [field]: maskValue(val, pattern, mask) };
}

export interface MaskRule {
  field: string;
  pattern: RegExp;
  mask?: string;
}

export function parseMaskOption(raw: string): MaskRule {
  // Format: field=/pattern/[flags][,mask=REPLACEMENT]
  const match = raw.match(/^([^=]+)=\/(.+)\/([gimsuy]*)(?:,mask=(.+))?$/);
  if (!match) throw new Error(`Invalid mask option format: ${raw}`);
  const [, field, patternStr, flags, maskStr] = match;
  return {
    field,
    pattern: new RegExp(patternStr, flags),
    mask: maskStr ?? DEFAULT_MASK,
  };
}

export function applyMaskRules(
  entries: LogEntry[],
  rules: MaskRule[]
): LogEntry[] {
  return entries.map((entry) =>
    rules.reduce(
      (acc, rule) => maskField(acc, rule.field, rule.pattern, rule.mask),
      entry
    )
  );
}
