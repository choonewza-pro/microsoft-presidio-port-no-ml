/**
 * MEDICAL_LICENSE - Ported from country_specific/us/medical_license_recognizer.py
 * DEA Certificate Number with Luhn-like checksum, replacementPairs support
 */
import { sanitizeValue, type ReplacementPair } from "../../../core/sanitize.ts";
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "MEDICAL_LICENSE" as const;
export const COUNTRY_CODE = "us" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.4;

export const PATTERN_SOURCE =
  "[abcdefghjklmprstuxABCDEFGHJKLMPRSTUX]{1}[a-zA-Z]{1}\\d{7}|[abcdefghjklmprstuxABCDEFGHJKLMPRSTUX]{1}9\\d{7}";

export const PATTERNS = [
  { name: "USA DEA Certificate Number (weak)", regex: PATTERN_SOURCE, score: 0.4 },
] as const;

export const CONTEXT = ["medical", "certificate", "DEA"] as const;

export const DEFAULT_REPLACEMENT_PAIRS: ReplacementPair[] = [["-", ""], [" ", ""]];

export const REGEX = new RegExp(`\\b(?:${PATTERN_SOURCE})\\b`, "gims");

function digitsOf(n: string): number[] {
  return [...n].map((d) => parseInt(d, 10));
}

export function luhnChecksum(sanitizedValue: string): boolean {
  const digits = digitsOf(sanitizedValue.slice(2));
  const checksum = digits.pop();
  if (checksum === undefined) return false;
  const evenDigits = digits.filter((_, i, arr) => (arr.length - 1 - i) % 2 === 0).reverse();
  // Python: digits[-1::-2] = every second from end, stepping -2 starting at last
  // digits[-2::-2] = starting at second last
  // Replicate exactly:
  const even: number[] = [];
  const odd: number[] = [];
  for (let i = digits.length - 1; i >= 0; i -= 2) even.push(digits[i]!);
  for (let i = digits.length - 2; i >= 0; i -= 2) odd.push(digits[i]!);
  let chk = checksum * -1;
  chk += 2 * even.reduce((a, b) => a + b, 0) + odd.reduce((a, b) => a + b, 0);
  return chk % 10 === 0;
}

export function validateResult(
  patternText: string,
  replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS,
): boolean {
  const sanitized = sanitizeValue(patternText, replacementPairs);
  return luhnChecksum(sanitized);
}

export function invalidateResult(
  patternText: string,
  replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS,
): boolean {
  return !validateResult(patternText, replacementPairs);
}

export function findAll(
  text: string,
  replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS,
): Array<{ value: string; start: number; end: number; score: number }> {
  const re = new RegExp(REGEX.source, REGEX.flags);
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  for (const m of text.matchAll(re)) {
    const value = m[0];
    if (!value) continue;
    const start = m.index ?? 0;
    const end = start + value.length;
    if (!validateResult(value, replacementPairs)) continue;
    results.push({ value, start, end, score: MAX_SCORE });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export function analyze(
  text: string,
  replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS,
): RecognizerResult[] {
  const re = new RegExp(REGEX.source, REGEX.flags);
  const results: RecognizerResult[] = [];
  for (const m of text.matchAll(re)) {
    const value = m[0];
    if (!value) continue;
    const start = m.index ?? 0;
    const end = start + value.length;
    const isValid = validateResult(value, replacementPairs);
    if (!isValid) continue;
    results.push({
      entityType: ENTITY_TYPE,
      start,
      end,
      score: MAX_SCORE,
      value,
      recognitionMetadata: { recognizerName: "MedicalLicenseRecognizer" },
      analysisExplanation: {
        recognizer: "MedicalLicenseRecognizer",
        patternName: PATTERNS[0]!.name,
        pattern: PATTERNS[0]!.regex,
        originalScore: PATTERNS[0]!.score,
        validationResult: isValid,
        textualExplanation: `Detected by \`MedicalLicenseRecognizer\` using pattern \`${PATTERNS[0]!.name}\``,
      },
    });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class MedicalLicenseRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  replacementPairs: ReplacementPair[];
  constructor(replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS) {
    this.replacementPairs = replacementPairs;
  }
  validateResult(t: string) { return validateResult(t, this.replacementPairs); }
  invalidateResult(t: string) { return invalidateResult(t, this.replacementPairs); }
  findAll(text: string) { return findAll(text, this.replacementPairs); }
  analyze(text: string) { return analyze(text, this.replacementPairs); }
}
