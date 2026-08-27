/**
 * Italy Passport Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/italy/it_passport_recognizer.py
 */
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "IT_PASSPORT" as const;
export const COUNTRY_CODE = "it" as const;
export const SUPPORTED_LANGUAGE = "it" as const;
export const BASE_SCORE = 0.01;

export const PATTERN_SOURCE = "[A-Z]{2}\\d{7}";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "gi");
export const REGEX_SINGLE = new RegExp(`^${PATTERN_SOURCE}$`, "i");
export const PATTERNS = [{ name: "Passport (very weak)", regex: PATTERN_SOURCE, score: BASE_SCORE }];

export const CONTEXT: readonly string[] = [
  "passaporto",
  "elettronico",
  "italiano",
  "viaggio",
  "viaggiare",
  "estero",
  "documento",
  "dogana",
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
      recognitionMetadata: { recognizerName: "ItPassportRecognizer" },
      analysisExplanation: {
        recognizer: "ItPassportRecognizer",
        patternName: "Passport (very weak)",
        pattern: REGEX.source,
        originalScore: BASE_SCORE,
        validationResult: null,
        textualExplanation: "Detected by `ItPassportRecognizer` using pattern `Passport (very weak)`",
      },
    });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class ItPassportRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "ItPassportRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  validateResult(patternText: string): boolean { return validateResult(patternText); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string): RecognizerResult[] { return analyze(text); }
}
