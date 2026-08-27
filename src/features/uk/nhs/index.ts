/**
 * UK NHS Number Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/uk/uk_nhs_recognizer.py
 *
 * NHS 10 digits mod11: sum(d[i] * (10-i)) %11 ==0 (weights 10..1)
 */
import { sanitizeValue } from "../../../core/sanitize.ts";
import type { ReplacementPair } from "../../../core/sanitize.ts";
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "UK_NHS" as const;
export const COUNTRY_CODE = "uk" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.5;
export const REPLACEMENT_PAIRS: ReplacementPair[] = [["-", ""], [" ", ""]];

export const PATTERN_SOURCE = "([0-9]{3})[- ]?([0-9]{3})[- ]?([0-9]{4})";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "g");
export const REGEX_SINGLE = new RegExp(`^${PATTERN_SOURCE}$`);
export const PATTERNS = [{ name: "NHS (medium)", regex: PATTERN_SOURCE, score: BASE_SCORE }];

export const CONTEXT: readonly string[] = [
  "national health service",
  "nhs",
  "health services authority",
  "health authority",
] as const;

export function validateResult(patternText: string, replacementPairs: ReplacementPair[] = REPLACEMENT_PAIRS): boolean {
  const text = sanitizeValue(patternText, replacementPairs);
  if (!/^\d{10}$/.test(text)) return false;
  // Port of: sum(int(c)*multiplier for c,multiplier in zip(text, reversed(range(11)))) %11==0
  // reversed(range(11)) = 10..0, first 10 weights 10..1
  let total = 0;
  for (let i = 0; i < 10; i++) {
    total += parseInt(text[i]!, 10) * (10 - i);
  }
  return total % 11 === 0;
}

export function isValidNhs(value: string, replacementPairs: ReplacementPair[] = REPLACEMENT_PAIRS): boolean {
  return validateResult(value, replacementPairs);
}

export function findAll(text: string, replacementPairs: ReplacementPair[] = REPLACEMENT_PAIRS): Array<{ value: string; start: number; end: number; score: number }> {
  const re = new RegExp(REGEX.source, REGEX.flags);
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  for (const m of text.matchAll(re)) {
    const value = m[0];
    const start = m.index ?? 0;
    const end = start + value.length;
    if (!value) continue;
    const ok = validateResult(value, replacementPairs);
    const score = ok ? MAX_SCORE : MIN_SCORE;
    if (score > MIN_SCORE) results.push({ value, start, end, score });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export function analyze(text: string, replacementPairs: ReplacementPair[] = REPLACEMENT_PAIRS): RecognizerResult[] {
  const re = new RegExp(REGEX.source, REGEX.flags);
  const results: RecognizerResult[] = [];
  for (const m of text.matchAll(re)) {
    const value = m[0];
    const start = m.index ?? 0;
    const end = start + value.length;
    if (!value) continue;
    const validationResult = validateResult(value, replacementPairs);
    const score = validationResult ? MAX_SCORE : MIN_SCORE;
    if (score <= MIN_SCORE) continue;
    results.push({
      entityType: ENTITY_TYPE,
      start, end, score, value,
      recognitionMetadata: { recognizerName: "NhsRecognizer" },
      analysisExplanation: {
        recognizer: "NhsRecognizer",
        patternName: "NHS (medium)",
        pattern: REGEX.source,
        originalScore: BASE_SCORE,
        validationResult,
        textualExplanation: "Detected by `NhsRecognizer` using pattern `NHS (medium)`",
      },
    });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class NhsRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  static readonly BASE_SCORE = BASE_SCORE;
  name = "NhsRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  replacementPairs: ReplacementPair[];
  constructor(replacementPairs: ReplacementPair[] = REPLACEMENT_PAIRS) { this.replacementPairs = replacementPairs; }
  validateResult(patternText: string): boolean { return validateResult(patternText, this.replacementPairs); }
  findAll(text: string) { return findAll(text, this.replacementPairs); }
  analyze(text: string): RecognizerResult[] { return analyze(text, this.replacementPairs); }
}
