/**
 * Spain Passport Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/spain/es_passport_recognizer.py
 * Format: 3 letters + 6 digits
 */
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "ES_PASSPORT" as const;
export const COUNTRY_CODE = "es" as const;
export const SUPPORTED_LANGUAGE = "es" as const;
export const BASE_SCORE = 0.05;

export const PATTERN_SOURCE = "[A-Z]{3}[0-9]{6}";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "g");
export const REGEX_SINGLE = new RegExp(`^${PATTERN_SOURCE}$`, "i");
export const PATTERNS = [{ name: "ES_PASSPORT", regex: PATTERN_SOURCE, score: BASE_SCORE }];

export const CONTEXT: readonly string[] = ["pasaporte", "passport", "número de pasaporte", "passport number"] as const;

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
      recognitionMetadata: { recognizerName: "EsPassportRecognizer" },
      analysisExplanation: {
        recognizer: "EsPassportRecognizer",
        patternName: "ES_PASSPORT",
        pattern: REGEX.source,
        originalScore: BASE_SCORE,
        validationResult: null,
        textualExplanation: "Detected by `EsPassportRecognizer` using pattern `ES_PASSPORT`",
      },
    });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class EsPassportRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "EsPassportRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  validateResult(patternText: string): boolean { return validateResult(patternText); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string): RecognizerResult[] { return analyze(text); }
}
