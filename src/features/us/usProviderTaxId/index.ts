/** US_PROVIDER_TAX_ID - us_healthcare_admin_recognizers.py:248 EIN prefix */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";
export const ENTITY_TYPE = "US_PROVIDER_TAX_ID" as const;
export const COUNTRY_CODE = "us" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
const VALID_EIN_PREFIX = "(?:0[1-6]|1[0-6]|2[0-7]|3[0-9]|4[0-8]|5[0-9]|6[0-8]|7[1-7]|8[0-8]|9[0-5]|9[89])";
export const PATTERNS = [
  { name: "Provider tax ID labelled", source: `(?<=\\b(?:(?:(?:billing|rendering|healthcare)\\s+provider|provider\\s+organization|provider)\\s+(?:tax\\s*(?:id|number|identification\\s+number)|tin|ein)|billing\\s+provider)(?:\\s*(?:#|no\\.?|number|id)\\s*:?\\s*|\\s*:\\s*|\\s+))${VALID_EIN_PREFIX}-\\d{7}`, score: 0.35 },
  { name: "Weak valid EIN", source: `\\b${VALID_EIN_PREFIX}-\\d{7}\\b`, score: 0.1 },
];
export const CONTEXT = ["tax", "tin", "ein", "billing"] as const;
export function findAll(text: string) {
  const res: Array<{ value: string; start: number; end: number; score: number }> = [];
  for (const p of PATTERNS) {
    try {
      const re = new RegExp(p.source, "gims");
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
  return findAll(text).map(({ value, start, end, score }) => ({ entityType: ENTITY_TYPE, start, end, score, value, recognitionMetadata: { recognizerName: "UsProviderTaxIdRecognizer" }, analysisExplanation: { recognizer: "UsProviderTaxIdRecognizer", patternName: "Provider tax ID", pattern: PATTERNS[0]!.source, originalScore: score, validationResult: null, textualExplanation: "Detected" } }));
}
export class UsProviderTaxIdRecognizer { findAll(t:string){return findAll(t);} analyze(t:string){return analyze(t);} }
