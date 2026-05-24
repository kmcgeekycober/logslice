import {
  renameField,
  addField,
  removeField,
  parseTransformOption,
  applyTransforms,
} from './transform';
import { LogEntry } from './types';

const base: LogEntry = {
  timestamp: '2024-01-01T00:00:00Z',
  level: 'info',
  message: 'hello',
  service: 'api',
};

describe('renameField', () => {
  it('renames an existing field', () => {
    const result = renameField(base, 'service', 'svc');
    expect(result).toHaveProperty('svc', 'api');
    expect(result).not.toHaveProperty('service');
  });

  it('returns entry unchanged if field missing', () => {
    const result = renameField(base, 'nonexistent', 'x');
    expect(result).toEqual(base);
  });

  it('does not mutate the original entry', () => {
    const original = { ...base };
    renameField(base, 'service', 'svc');
    expect(base).toEqual(original);
  });
});

describe('addField', () => {
  it('adds a new field', () => {
    const result = addField(base, 'env', 'production');
    expect(result).toHaveProperty('env', 'production');
  });

  it('overwrites an existing field', () => {
    const result = addField(base, 'level', 'debug');
    expect(result.level).toBe('debug');
  });

  it('does not mutate the original entry', () => {
    const original = { ...base };
    addField(base, 'env', 'production');
    expect(base).toEqual(original);
  });
});

describe('removeField', () => {
  it('removes a field', () => {
    const result = removeField(base, 'service');
    expect(result).not.toHaveProperty('service');
  });

  it('is a no-op for missing fields', () => {
    const result = removeField(base, 'missing');
    expect(result).toEqual(base);
  });
});

describe('parseTransformOption', () => {
  it('parses rename transform', () => {
    const fn = parseTransformOption('rename:service=svc');
    expect(fn(base)).toHaveProperty('svc', 'api');
  });

  it('parses add transform', () => {
    const fn = parseTransformOption('add:env=staging');
    expect(fn(base)).toHaveProperty('env', 'staging');
  });

  it('parses remove transform', () => {
    const fn = parseTransformOption('remove:service');
    expect(fn(base)).not.toHaveProperty('service');
  });

  it('throws on unknown operation', () => {
    expect(() => parseTransformOption('flip:foo')).toThrow('Unknown transform');
  });

  it('throws on malformed rename missing "="', () => {
    expect(() => parseTransformOption('rename:serviceSvc')).toThrow();
  });
});

describe('applyTransforms', () => {
  it('applies multiple transforms in order', () => {
    const fns = [
      parseTransformOption('rename:service=svc'),
      parseTransformOption('add:env=prod'),
    ];
    const results = applyTransforms([base], fns);
    expect(results[0]).toHaveProperty('svc', 'api');
    expect(results[0]).toHaveProperty('env', 'prod');
    expect(results[0]).not.toHaveProperty('service');
  });

  it('returns an empty array when given no entries', () => {
    const fns = [parseTransformOption('add:env=prod')];
    const results = applyTransforms([], fns);
    expect(results).toEqual([]);
  });
});
