/**
 * CREDIT_CARD - Ported from generic/credit_card_recognizer.py:19
 * Regex weak 0.3 + Luhn checksum + replacementPairs
 */
import { sanitizeValue, type ReplacementPair } from "../../../core/sanitize.ts";
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "CREDIT_CARD" as const;
export const COUNTRY_CODE = null;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.3;
export const PATTERN_SOURCE =
  "(?!1\\d{12}(?!\\d))((4\\d{3})|(5[0-5]\\d{2})|(6\\d{3})|(1\\d{3})|(3\\d{3}))[- ]?(\\d{3,4})[- ]?(\\d{3,4})[- ]?(\\d{3,5})";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "gims");
export const CONTEXT = [
  "credit",
  "card",
  "visa",
  "mastercard",
  "cc ",
  "amex",
  "discover",
  "jcb",
  "diners",
  "maestro",
  "instapayment",
] as const;
export const DEFAULT_REPLACEMENT_PAIRS: ReplacementPair[] = [
  ["-", ""],
  [" ", ""],
];

export function luhnChecksum(sanitized: string): boolean {
  const digits = sanitized.split("").map((d) => parseInt(d, 10));
  const odd = digits.filter((_, i) => (digits.length - 1 - i) % 2 === 0);
  const even = digits.filter((_, i) => (digits.length - 1 - i) % 2 === 1);
  let sum = odd.reduce((a, b) => a + b, 0);
  for (const d of even) {
    const dbl = d * 2;
    sum += Math.floor(dbl / 10) + (dbl % 10);
  }
  return sum % 10 === 0;
}

/** ตรง validate_result - sanitize + Luhn */
export function validateResult(
  patternText: string,
  replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS,
): boolean {
  const sanitized = sanitizeValue(patternText, replacementPairs);
  if (!/^\d+$/.test(sanitized)) return false;
  return luhnChecksum(sanitized);
}

export function isValidCreditCard(
  text: string,
  replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS,
): boolean {
  const sanitized = sanitizeValue(text, replacementPairs);
  if (!new RegExp(`^${PATTERN_SOURCE}$`, "ims").test(sanitized)) {
    // also try with original separators
    if (!REGEX.test(text)) return false;
  }
  return validateResult(text, replacementPairs);
}

export function findAll(
  text: string,
  replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS,
): Array<{ value: string; start: number; end: number; score: number }> {
  const re = new RegExp(REGEX.source, REGEX.flags);
  const res: Array<{ value: string; start: number; end: number; score: number }> = [];
  for (const m of text.matchAll(re)) {
    const value = m[0];
    const start = m.index ?? 0;
    const end = start + value.length;
    if (!value) continue;
    const ok = validateResult(value, replacementPairs);
    const score = ok ? MAX_SCORE : MIN_SCORE;
    if (score > MIN_SCORE) res.push({ value, start, end, score });
  }
  return res.sort((a, b) => b.score - a.score || a.start - b.start);
}

export function analyze(
  text: string,
  replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS,
): RecognizerResult[] {
  return findAll(text, replacementPairs).map(({ value, start, end, score }) => ({
    entityType: ENTITY_TYPE,
    start,
    end,
    score,
    value,
    recognitionMetadata: { recognizerName: "CreditCardRecognizer" },
    analysisExplanation: {
      recognizer: "CreditCardRecognizer",
      patternName: "All Credit Cards (weak)",
      pattern: REGEX.source,
      originalScore: BASE_SCORE,
      validationResult: true,
      textualExplanation: "Detected by `CreditCardRecognizer` using pattern `All Credit Cards (weak)`",
    },
  }));
}

export class CreditCardRecognizer {
  static ENTITY_TYPE = ENTITY_TYPE;
  static PATTERN_SOURCE = PATTERN_SOURCE;
  static CONTEXT = CONTEXT;
  replacementPairs: ReplacementPair[];
  constructor(replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS) {
    this.replacementPairs = replacementPairs;
  }
  validateResult(t: string) { return validateResult(t, this.replacementPairs); }
  findAll(text: string) { return findAll(text, this.replacementPairs); }
  analyze(text: string) { return analyze(text, this.replacementPairs); }
}
