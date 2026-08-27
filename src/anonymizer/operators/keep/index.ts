/** Keep - presidio-anonymizer/.../operators/keep.py:25 */
export const OPERATOR_NAME = "keep" as const;

/** @example operate("secret") // "secret" */
export function operate(text: string | null, _params: Record<string, unknown> = {}): string {
  return text ?? "";
}
export function validate(_params: Record<string, unknown> = {}): void {}

export class Keep {
  operate(text: string, params: Record<string, unknown>) { return operate(text, params); }
  validate(params: Record<string, unknown>) { return validate(params); }
  operatorName() { return OPERATOR_NAME; }
}
