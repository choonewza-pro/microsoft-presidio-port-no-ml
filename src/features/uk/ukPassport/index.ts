/**
 * UK Passport Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/uk/uk_passport_recognizer.py
 */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "UK_PASSPORT" as const;
export const COUNTRY_CODE = "uk" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.1;

export const PATTERN_SOURCE = "[A-Z]{2}\\d{7}";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "g");
export const REGEX_SINGLE = new RegExp(`^${PATTERN_SOURCE}$`);
export const PATTERNS = [{ name: "UK Passport (weak)", regex: PATTERN_SOURCE, score: BASE_SCORE }];

export const CONTEXT: readonly string[] = [
  "passport",
  "passport number",
  "travel document",
  "uk passport",
  "british passport",
  "her majesty",
  "his majesty",
  "hm passport",
  "hmpo",
] as const;

export function validateResult(_patternText: string): boolean { return true; }

export function findAll(text: string): Array<{ value: string; start: number; end: number; score: number }> {
  const re = new RegExp(REGEX.source, REGEX.flags);
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  for (const m of text.matchAll(re)) {
    const value = m[0];
    const start = m.index ?? 0;
    const end = start + value.length;
    if (!value) continue;
    results.push({ value, start, end, score: BASE_SCORE });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export function analyze(text: string): RecognizerResult[] {
  const re = new RegExp(REGEX.source, REGEX.flags);
  const results: RecognizerResult[] = [];
  for (const m of text.matchAll(re)) {
    const value = m[0];
    const start = m.index ?? 0;
    const end = start + value.length;
    if (!value) continue;
    results.push({
      entityType: ENTITY_TYPE,
      start, end, score: BASE_SCORE, value,
      recognitionMetadata: { recognizerName: "UkPassportRecognizer" },
      analysisExplanation: {
        recognizer: "UkPassportRecognizer",
        patternName: "UK Passport (weak)",
        pattern: REGEX.source,
        originalScore: BASE_SCORE,
        validationResult: null,
        textualExplanation: "Detected by `UkPassportRecognizer` using pattern `UK Passport (weak)`",
      },
    });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class UkPassportRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "UkPassportRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  validateResult(patternText: string): boolean { return validateResult(patternText); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string): RecognizerResult[] { return analyze(text); }
}
