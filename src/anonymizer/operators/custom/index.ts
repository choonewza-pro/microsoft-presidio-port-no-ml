/** Custom - presidio-anonymizer/.../operators/custom.py:9 */
export const OPERATOR_NAME = "custom" as const;

export type CustomLambda = (text: string, params: Record<string, unknown>) => string;

export interface CustomParams {
  lambda: CustomLambda;
  [k: string]: unknown;
}

/** @example operate("my text", {lambda: (x)=> x.toUpperCase()}) // "MY TEXT" */
export function operate(text: string, params: CustomParams): string {
  const fn = params.lambda;
  if (typeof fn !== "function") throw new Error("lambda must be function");
  return fn(text, params);
}

export function validate(params: CustomParams): void {
  if (typeof params.lambda !== "function") throw new Error("lambda must be function");
}

export class Custom {
  operate(text: string, params: CustomParams) { return operate(text, params); }
  validate(params: CustomParams) { return validate(params); }
  operatorName() { return OPERATOR_NAME; }
}
