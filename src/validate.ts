import { LogEntry } from "./types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: "string" | "number" | "boolean";
  pattern?: RegExp;
}

const DEFAULT_RULES: ValidationRule[] = [
  { field: "timestamp", required: true, type: "string" },
  { field: "level", required: true, type: "string", pattern: /^(debug|info|warn|error|fatal)$/i },
  { field: "message", required: true, type: "string" },
];

export function validateEntry(
  entry: LogEntry,
  rules: ValidationRule[] = DEFAULT_RULES
): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    const value = (entry as Record<string, unknown>)[rule.field];

    if (rule.required && (value === undefined || value === null || value === "")) {
      errors.push(`Missing required field: "${rule.field}"`);
      continue;
    }

    if (value !== undefined && value !== null) {
      if (rule.type && typeof value !== rule.type) {
        errors.push(
          `Field "${rule.field}" expected type ${rule.type}, got ${typeof value}`
        );
      }

      if (rule.pattern && typeof value === "string" && !rule.pattern.test(value)) {
        errors.push(
          `Field "${rule.field}" value "${value}" does not match expected pattern`
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateEntries(
  entries: LogEntry[],
  rules: ValidationRule[] = DEFAULT_RULES
): { entry: LogEntry; result: ValidationResult }[] {
  return entries
    .map((entry) => ({ entry, result: validateEntry(entry, rules) }))
    .filter(({ result }) => !result.valid);
}

export function parseValidationRules(raw: string[]): ValidationRule[] {
  return raw.map((r) => {
    const [field, type] = r.split(":");
    return {
      field: field.trim(),
      required: true,
      type: (type?.trim() as ValidationRule["type"]) ?? "string",
    };
  });
}
