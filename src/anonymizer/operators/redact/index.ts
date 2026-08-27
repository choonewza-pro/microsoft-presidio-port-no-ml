/** Redact - presidio-anonymizer/.../operators/redact.py:8 */
export const OPERATOR_NAME = "redact" as const;

/** @example operate("secret") // "" */
export function operate(_text: string | null, _params: Record<string, unknown> = {}): string {
  return "";
}
export function validate(_params: Record<string, unknown> = {}): void {}

export class Redact {
  operate(text: string, params: Record<string, unknown>) { return operate(text, params); }
  validate(params: Record<string, unknown>) { return validate(params); }
  operatorName() { return OPERATOR_NAME; }
}
