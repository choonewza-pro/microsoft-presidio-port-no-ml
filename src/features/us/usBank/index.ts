/**
 * US_BANK_NUMBER - Ported from country_specific/us/us_bank_recognizer.py
 * 8-17 digits
 */
import type { ReplacementPair } from "../../../core/sanitize.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "US_BANK_NUMBER" as const;
export const COUNTRY_CODE = "us" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.05;

export const PATTERNS = [
  { name: "Bank Account (weak)", regex: "\\b[0-9]{8,17}\\b", score: 0.05 },
] as const;

export const CONTEXT = ["check", "account", "account#", "acct", "bank", "save", "debit"] as const;

export const REGEX = new RegExp(PATTERNS[0]!.regex, "gims");
export const PATTERN_SOURCE = PATTERNS[0]!.regex;

export function validateResult(_patternText: string, _replacementPairs: ReplacementPair[] = []): boolean {
  return true;
}
export function invalidateResult(_patternText: string, _replacementPairs: ReplacementPair[] = []): boolean {
  return false;
}

export function findAll(
  text: string,
  _replacementPairs: ReplacementPair[] = [],
): Array<{ value: string; start: number; end: number; score: number }> {
  const re = new RegExp(REGEX.source, REGEX.flags);
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  for (const m of text.matchAll(re)) {
    const value = m[0];
    if (!value) continue;
    const start = m.index ?? 0;
    const end = start + value.length;
    results.push({ value, start, end, score: BASE_SCORE });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export function analyze(
  text: string,
  replacementPairs: ReplacementPair[] = [],
): RecognizerResult[] {
  return findAll(text, replacementPairs).map(({ value, start, end, score }) => ({
    entityType: ENTITY_TYPE,
    start,
    end,
    score,
    value,
    recognitionMetadata: { recognizerName: "UsBankRecognizer" },
    analysisExplanation: {
      recognizer: "UsBankRecognizer",
      patternName: PATTERNS[0]!.name,
      pattern: PATTERNS[0]!.regex,
      originalScore: PATTERNS[0]!.score,
      validationResult: null,
      textualExplanation: `Detected by \`UsBankRecognizer\` using pattern \`${PATTERNS[0]!.name}\``,
    },
  }));
}

export class UsBankRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  replacementPairs: ReplacementPair[];
  constructor(replacementPairs: ReplacementPair[] = []) { this.replacementPairs = replacementPairs; }
  validateResult(t: string) { return validateResult(t, this.replacementPairs); }
  invalidateResult(t: string) { return invalidateResult(t, this.replacementPairs); }
  findAll(text: string) { return findAll(text, this.replacementPairs); }
  analyze(text: string) { return analyze(text, this.replacementPairs); }
}
