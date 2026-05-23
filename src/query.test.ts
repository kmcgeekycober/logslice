import { parseQuery, ParsedQuery } from './query';

describe('parseQuery', () => {
  it('returns empty result for empty string', () => {
    const result = parseQuery('');
    expect(result.fields).toEqual([]);
    expect(result.timeFrom).toBeUndefined();
    expect(result.timeTo).toBeUndefined();
  });

  it('parses a simple field equality query', () => {
    const result = parseQuery('level=error');
    expect(result.fields).toHaveLength(1);
    expect(result.fields[0]).toEqual({ field: 'level', operator: '=', value: 'error' });
  });

  it('parses multiple field queries', () => {
    const result = parseQuery('level=error service!=auth');
    expect(result.fields).toHaveLength(2);
    expect(result.fields[0]).toEqual({ field: 'level', operator: '=', value: 'error' });
    expect(result.fields[1]).toEqual({ field: 'service', operator: '!=', value: 'auth' });
  });

  it('parses time range with >= and <=', () => {
    const result = parseQuery('ts>=2024-01-01T00:00:00Z ts<=2024-01-02T00:00:00Z');
    expect(result.timeFrom).toEqual(new Date('2024-01-01T00:00:00Z'));
    expect(result.timeTo).toEqual(new Date('2024-01-02T00:00:00Z'));
    expect(result.fields).toHaveLength(0);
  });

  it('parses mixed time and field queries', () => {
    const result = parseQuery('level=warn ts>=2024-03-01T00:00:00Z');
    expect(result.timeFrom).toEqual(new Date('2024-03-01T00:00:00Z'));
    expect(result.fields).toHaveLength(1);
    expect(result.fields[0].field).toBe('level');
  });

  it('supports timestamp as a time field alias', () => {
    const result = parseQuery('timestamp>=2024-06-01T12:00:00Z');
    expect(result.timeFrom).toEqual(new Date('2024-06-01T12:00:00Z'));
  });

  it('throws on invalid token format', () => {
    expect(() => parseQuery('invalidtoken')).toThrow('Invalid query token');
  });

  it('throws on invalid date value', () => {
    expect(() => parseQuery('ts>=not-a-date')).toThrow('Invalid date value');
  });

  it('parses inequality operators for fields', () => {
    const result = parseQuery('status>=400');
    expect(result.fields[0]).toEqual({ field: 'status', operator: '>=', value: '400' });
  });
});
