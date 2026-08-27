/**
 * AU_ABN - Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/australia/au_abn_recognizer.py
 * Modulus 89 checksum: (abn_list[0]-1) weighted [10,1,3,5,7,9,11,13,15,17,19] sum%89==0
 */
import { sanitizeValue, type ReplacementPair } from "../../../core/sanitize.ts";
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "AU_ABN" as const;
export const COUNTRY_CODE = "au" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.5;

export const PATTERNS = [
  { name: "ABN (Medium)", regex: "\\b\\d{2}\\s\\d{3}\\s\\d{3}\\s\\d{3}\\b", score: 0.1 },
  { name: "ABN (Low)", regex: "\\b\\d{11}\\b", score: 0.01 },
] as const;

export const CONTEXT = ["australian business number", "abn"] as const;

export const DEFAULT_REPLACEMENT_PAIRS: ReplacementPair[] = [["-", ""], [" ", ""]];

export const REGEXES = PATTERNS.map((p) => ({
  name: p.name,
  regex: new RegExp(p.regex, "gims"),
  score: p.score,
  source: p.regex,
}));

export const PATTERN_SOURCE = PATTERNS[1]!.regex;
export const REGEX = new RegExp(PATTERN_SOURCE, "gims");

const WEIGHT = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19] as const;

export function validateResult(
  patternText: string,
  replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS,
): boolean {
  const text = sanitizeValue(patternText, replacementPairs);
  // After sanitizing, should be 11 digits
  if (!/^\d{11}$/.test(text)) return false;
  const abnList = [...text].map((d) => parseInt(d, 10));
  abnList[0] = abnList[0]! - 1;
  let sumProduct = 0;
  for (let i = 0; i < 11; i++) {
    sumProduct += abnList[i]! * WEIGHT[i]!;
  }
  const remainder = sumProduct % 89;
  return remainder === 0;
}

export function findAll(
  text: string,
  replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS,
): Array<{ value: string; start: number; end: number; score: number }> {
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  const seen = new Set<string>();
  for (const p of REGEXES) {
    const re = new RegExp(p.regex, "gims");
    for (const m of text.matchAll(re)) {
      const value = m[0];
      if (!value) continue;
      const start = m.index ?? 0;
      const end = start + value.length;
      const key = `${start}-${end}`;
      if (seen.has(key)) continue;
      if (!validateResult(value, replacementPairs)) continue;
      seen.add(key);
      results.push({ value, start, end, score: MAX_SCORE });
    }
  }
  return results.sort((a, b) => a.start - b.start);
}

export function analyze(
  text: string,
  replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS,
): RecognizerResult[] {
  const results: RecognizerResult[] = [];
  const seen = new Set<string>();
  for (const p of REGEXES) {
    const re = new RegExp(p.regex, "gims");
    for (const m of text.matchAll(re)) {
      const value = m[0];
      if (!value) continue;
      const start = m.index ?? 0;
      const end = start + value.length;
      const key = `${start}-${end}`;
      if (seen.has(key)) continue;
      const isValid = validateResult(value, replacementPairs);
      if (!isValid) continue;
      seen.add(key);
      results.push({
        entityType: ENTITY_TYPE,
        start,
        end,
        score: MAX_SCORE,
        value,
        recognitionMetadata: { recognizerName: ENTITY_TYPE },
        analysisExplanation: {
          recognizer: ENTITY_TYPE,
          patternName: p.name,
          pattern: p.regex,
          originalScore: p.score,
          validationResult: isValid,
          textualExplanation: `Detected by ${ENTITY_TYPE} using pattern ${p.name}`,
        },
      });
    }
  }
  return results.sort((a, b) => a.start - b.start);
}

export class AuAbnRecognizer {
  replacementPairs: ReplacementPair[];
  constructor(replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS) {
    this.replacementPairs = replacementPairs;
  }
  validateResult(t: string) { return validateResult(t, this.replacementPairs); }
  findAll(text: string) { return findAll(text, this.replacementPairs); }
  analyze(text: string) { return analyze(text, this.replacementPairs); }
}
