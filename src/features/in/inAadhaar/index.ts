/**
 * IN_AADHAAR - Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/india/in_aadhaar_recognizer.py
 * Verhoeff checksum + first digit >=2 + not palindrome
 */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "IN_AADHAAR" as const;
export const COUNTRY_CODE = "in" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.5;

export const PATTERNS = [
  { name: "AADHAAR (Very Weak)", regex: "\\b[0-9]{12}\\b", score: 0.01 },
  { name: "AADHAR (Very Weak)", regex: "\\b[0-9]{4}[- :][0-9]{4}[- :][0-9]{4}\\b", score: 0.01 },
  // Convenience spaced pattern allowing spaces (also covered by above but with explicit space)
  { name: "AADHAAR spaced", regex: "\\b[2-9][0-9]{3} ?[0-9]{4} ?[0-9]{4}\\b", score: 0.01 },
] as const;

export const CONTEXT = ["aadhaar", "uidai"] as const;

export const REPLACEMENT_PAIRS: Array<[string, string]> = [["-", ""], [" ", ""], [":", ""]];

export const REGEXES = PATTERNS.map((p) => ({
  name: p.name,
  regex: new RegExp(p.regex, "gims"),
  score: p.score,
  source: p.regex,
}));

export const PATTERN_SOURCE = "\\b[2-9][0-9]{3} ?[0-9]{4} ?[0-9]{4}\\b";
export const REGEX = new RegExp(PATTERN_SOURCE, "gims");

export function sanitizeValue(text: string, replacementPairs: Array<[string, string]> = REPLACEMENT_PAIRS): string {
  let s = text;
  for (const [old, nw] of replacementPairs) {
    s = s.split(old).join(nw);
  }
  return s;
}

function isPalindrome(text: string, caseInsensitive = false): boolean {
  let t = text;
  if (caseInsensitive) t = t.replace(/ /g, "").toLowerCase();
  return t === t.split("").reverse().join("");
}

// Verhoeff tables
const D_TABLE: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const P_TABLE: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];
const INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

export function isVerhoeffNumber(inputNumber: number): boolean {
  let c = 0;
  const inverted = String(inputNumber).split("").reverse().map((ch) => parseInt(ch, 10));
  for (let i = 0; i < inverted.length; i++) {
    c = D_TABLE[c]![P_TABLE[i % 8]![inverted[i]!]!]!;
  }
  return INV[c] === 0;
}

export function validateResult(patternText: string, replacementPairs: Array<[string, string]> = REPLACEMENT_PAIRS): boolean {
  const sanitized = sanitizeValue(patternText, replacementPairs);
  if (sanitized.length !== 12) return false;
  if (!/^\d{12}$/.test(sanitized)) return false;
  if (parseInt(sanitized[0]!, 10) < 2) return false;
  if (isPalindrome(sanitized)) return false;
  const num = Number(sanitized); // within safe integer (12 digits < 2^53)
  // For numbers with leading zeros (not possible due to first digit >=2), string-based fallback
  // Use numeric verhoeff; for 12-digit numbers this is safe.
  return isVerhoeffNumber(num);
}

export function findAll(text: string): Array<{ value: string; start: number; end: number; score: number }> {
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
      if (!validateResult(value)) continue;
      seen.add(key);
      results.push({ value, start, end, score: MAX_SCORE });
    }
  }
  return results.sort((a, b) => a.start - b.start);
}

export function analyze(text: string): RecognizerResult[] {
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
      if (!validateResult(value)) continue;
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
          validationResult: true,
          textualExplanation: `Detected by ${ENTITY_TYPE} using pattern ${p.name}`,
        },
      });
    }
  }
  return results.sort((a, b) => a.start - b.start);
}

export class InAadhaarRecognizer {
  replacementPairs = REPLACEMENT_PAIRS;
  findAll(t: string) { return findAll(t); }
  analyze(t: string) { return analyze(t); }
  validateResult(t: string) { return validateResult(t, this.replacementPairs); }
  sanitizeValue(t: string) { return sanitizeValue(t, this.replacementPairs); }
}
