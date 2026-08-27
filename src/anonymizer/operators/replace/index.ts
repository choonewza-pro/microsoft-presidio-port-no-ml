/** Replace - presidio-anonymizer/.../operators/replace.py:9 */
export const OPERATOR_NAME = "replace" as const;
export const NEW_VALUE = "new_value" as const;

export interface ReplaceParams {
  new_value?: string;
  entity_type?: string;
  [key: string]: unknown;
}

/**
 * @example operate("my text", {new_value: "REPLACED"}) // "REPLACED"
 * operate("secret", {}) // "<PERSON>" (fallback to <entity_type>)
 */
export function operate(text: string | null, params: ReplaceParams = {}): string {
  const newVal = params[NEW_VALUE] as string | undefined;
  if (!newVal) return `<${params.entity_type ?? ""}>`;
  return newVal;
}

export function validate(params: ReplaceParams = {}): void {
  if (params[NEW_VALUE] !== undefined && typeof params[NEW_VALUE] !== "string") {
    throw new Error(`Invalid param ${NEW_VALUE} must be string`);
  }
}

export class Replace {
  operate(text: string, params: ReplaceParams) { return operate(text, params); }
  validate(params: ReplaceParams) { return validate(params); }
  operatorName() { return OPERATOR_NAME; }
}
