import { LogEntry } from './types';

export type TransformFn = (entry: LogEntry) => LogEntry;

export function renameField(
  entry: LogEntry,
  from: string,
  to: string
): LogEntry {
  if (!(from in entry)) return entry;
  const { [from]: value, ...rest } = entry;
  return { ...rest, [to]: value };
}

export function addField(
  entry: LogEntry,
  key: string,
  value: unknown
): LogEntry {
  return { ...entry, [key]: value };
}

export function removeField(entry: LogEntry, key: string): LogEntry {
  const { [key]: _removed, ...rest } = entry;
  return rest as LogEntry;
}

export function parseTransformOption(raw: string): TransformFn {
  const [op, ...args] = raw.split(':');
  switch (op) {
    case 'rename': {
      const [from, to] = args[0].split('=');
      if (!from || !to) throw new Error(`rename requires from=to, got: ${args[0]}`);
      return (entry) => renameField(entry, from, to);
    }
    case 'add': {
      const [key, val] = args[0].split('=');
      if (!key || val === undefined) throw new Error(`add requires key=value, got: ${args[0]}`);
      return (entry) => addField(entry, key, val);
    }
    case 'remove': {
      const key = args[0];
      if (!key) throw new Error('remove requires a field name');
      return (entry) => removeField(entry, key);
    }
    default:
      throw new Error(`Unknown transform operation: ${op}`);
  }
}

export function applyTransforms(
  entries: LogEntry[],
  transforms: TransformFn[]
): LogEntry[] {
  return entries.map((entry) =>
    transforms.reduce((acc, fn) => fn(acc), entry)
  );
}
