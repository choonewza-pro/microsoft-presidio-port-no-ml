/** Mask - presidio-anonymizer/.../operators/mask.py:10 */
export const OPERATOR_NAME = "mask" as const;

export interface MaskParams {
  chars_to_mask?: number;
  from_end?: boolean;
  masking_char?: string;
  [key: string]: unknown;
}

/**
 * @example operate("secret", {masking_char:"*", chars_to_mask:3, from_end:false}) // "***ret"
 * operate("secret", {masking_char:"*", chars_to_mask:2, from_end:true}) // "secr**"
 */
export function operate(text: string, params: MaskParams = {}): string {
  const charsToMask = params.chars_to_mask as number | undefined ?? 0;
  const fromEnd = params.from_end as boolean | undefined ?? false;
  const maskingChar = (params.masking_char as string | undefined) ?? "*";
  const effective = Math.min(text.length, charsToMask > 0 ? charsToMask : 0);
  if (!fromEnd) return maskingChar.repeat(effective) + text.slice(effective);
  const idx = text.length - effective;
  return text.slice(0, idx) + maskingChar.repeat(effective);
}

export function validate(params: MaskParams = {}): void {
  const c = params.masking_char;
  if (c !== undefined && typeof c !== "string") throw new Error("masking_char must be string");
  if (typeof c === "string" && c.length > 1) throw new Error("masking_char must be a character");
  if (params.chars_to_mask !== undefined && typeof params.chars_to_mask !== "number") throw new Error("chars_to_mask must be int");
  if (params.from_end !== undefined && typeof params.from_end !== "boolean") throw new Error("from_end must be bool");
}

export function getEffectiveCharsToMask(text: string, charsToMask: number): number {
  return Math.min(text.length, charsToMask > 0 ? charsToMask : 0);
}

export class Mask {
  operate(text: string, params: MaskParams) { return operate(text, params); }
  validate(params: MaskParams) { return validate(params); }
  operatorName() { return OPERATOR_NAME; }
}
