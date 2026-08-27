/** US_REFERRAL_NUMBER - us_healthcare_admin_recognizers.py:188 */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE = "US_REFERRAL_NUMBER" as const;
export const COUNTRY_CODE = "us" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const PATTERNS = [
  { name: "Referral labelled", source: "(?<=\\b(?:referral|infusion\\s+referral)(?:\\s*(?:#|no\\.?|number|id)\\s*:?\\s*|\\s*:\\s*|\\s+))(?:(?:REF|INF)-?)?\\d{6,12}", score: 0.35 },
  { name: "Weak prefixed", source: "(?:REF|INF)-?\\d{6,12}", score: 0.1 },
];
export const CONTEXT = ["referral", "infusion", "specialty", "referring"] as const;
export function findAll(text: string) {
  const res: Array<{ value: string; start: number; end: number; score: number }> = [];
  for (const p of PATTERNS) {
    try {
      const re = new RegExp(`\\b${p.source}\\b`, "gims");
      for (const m of text.matchAll(re)) {
        const value = m[0]; const start = m.index ?? 0; const end = start + value.length;
        res.push({ value, start, end, score: p.score });
      }
    } catch {}
    try {
      const re2 = new RegExp(p.source.replace(/\(\?<=.*?\)/, ""), "gims");
      for (const m of text.matchAll(re2)) {
        const value = m[0]; const start = m.index ?? 0; const end = start + value.length;
        if (!res.some(r=>r.start===start)) res.push({ value, start, end, score: p.score });
      }
    } catch {}
  }
  return res;
}
export function analyze(text: string): RecognizerResult[] {
  return findAll(text).map(({ value, start, end, score }) => ({ entityType: ENTITY_TYPE, start, end, score, value, recognitionMetadata: { recognizerName: "UsReferralNumberRecognizer" }, analysisExplanation: { recognizer: "UsReferralNumberRecognizer", patternName: "Referral", pattern: PATTERNS[0]!.source, originalScore: score, validationResult: null, textualExplanation: "Detected" } }));
}
export class UsReferralNumberRecognizer { findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);} }
