/**
 * Query parser for logslice field and time-range queries.
 * Supports syntax like: level=error ts>=2024-01-01T00:00:00Z ts<=2024-01-02T00:00:00Z
 */

export type Operator = '=' | '!=' | '>=' | '<=' | '>' | '<';

export interface FieldQuery {
  field: string;
  operator: Operator;
  value: string;
}

export interface ParsedQuery {
  timeFrom?: Date;
  timeTo?: Date;
  fields: FieldQuery[];
}

const TIME_FIELDS = new Set(['ts', 'timestamp', 'time']);
const OPERATOR_REGEX = /^([\w.]+)(!=|>=|<=|>|<|=)(.+)$/;

/**
 * Parse a query string into a structured ParsedQuery object.
 * @param queryString - space-separated key-operator-value tokens
 */
export function parseQuery(queryString: string): ParsedQuery {
  const result: ParsedQuery = { fields: [] };

  if (!queryString || queryString.trim() === '') {
    return result;
  }

  const tokens = queryString.trim().split(/\s+/);

  for (const token of tokens) {
    const match = token.match(OPERATOR_REGEX);
    if (!match) {
      throw new Error(`Invalid query token: "${token}". Expected format: field=value`);
    }

    const [, field, operator, value] = match as [string, string, Operator, string];

    if (TIME_FIELDS.has(field)) {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date value for field "${field}": "${value}"`);
      }
      if (operator === '>=' || operator === '>') {
        result.timeFrom = date;
      } else if (operator === '<=' || operator === '<') {
        result.timeTo = date;
      } else {
        // exact match on time — treat as both bounds
        result.timeFrom = date;
        result.timeTo = date;
      }
    } else {
      result.fields.push({ field, operator, value });
    }
  }

  return result;
}
