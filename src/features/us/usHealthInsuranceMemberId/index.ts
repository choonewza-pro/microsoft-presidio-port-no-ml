/** US_HEALTH_INSURANCE_MEMBER_ID - us_health_insurance_member_id_recognizer.py:37 */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE = "US_HEALTH_INSURANCE_MEMBER_ID" as const;
export const COUNTRY_CODE = "us" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.1;
export const PATTERN_SOURCE = "(?=[A-Z0-9-]{6,20}\\b)(?=[A-Z0-9-]*[A-Z])(?=[A-Z0-9-]*\\d)[A-Z]{1,5}-?[A-Z0-9]{5,14}";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "gims");
export const CONTEXT = ["member", "subscriber", "insurance", "policy"] as const;
export function findAll(text: string) {
  const re = new RegExp(REGEX.source, REGEX.flags);
  const res: Array<{ value: string; start: number; end: number; score: number }> = [];
  for (const m of text.matchAll(re)) {
    const value = m[0]; const start = m.index ?? 0; const end = start + value.length;
    res.push({ value, start, end, score: BASE_SCORE });
  }
  return res;
}
export function analyze(text: string): RecognizerResult[] {
  return findAll(text).map(({ value, start, end, score }) => ({ entityType: ENTITY_TYPE, start, end, score, value, recognitionMetadata: { recognizerName: "UsHealthInsuranceMemberIdRecognizer" }, analysisExplanation: { recognizer: "UsHealthInsuranceMemberIdRecognizer", patternName: "Health insurance member ID (weak)", pattern: REGEX.source, originalScore: BASE_SCORE, validationResult: null, textualExplanation: "Detected by `UsHealthInsuranceMemberIdRecognizer`" } }));
}
export class UsHealthInsuranceMemberIdRecognizer { findAll(t: string) { return findAll(t); } analyze(t: string) { return analyze(t); } }
