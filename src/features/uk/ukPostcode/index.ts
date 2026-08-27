/**
 * UK Postcode Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/uk/uk_postcode_recognizer.py
 */
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "UK_POSTCODE" as const;
export const COUNTRY_CODE = "uk" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.1;

export const PATTERN_SOURCE = "(" +
  "GIR\\s?0AA" +
  "|[A-PR-UWYZ][0-9][ABCDEFGHJKPSTUW]?\\s?[0-9][ABD-HJLNP-UW-Z]{2}" +
  "|[A-PR-UWYZ][0-9]{2}\\s?[0-9][ABD-HJLNP-UW-Z]{2}" +
  "|[A-PR-UWYZ][A-HK-Y][0-9][ABEHMNPRVWXY]?\\s?[0-9][ABD-HJLNP-UW-Z]{2}" +
  "|[A-PR-UWYZ][A-HK-Y][0-9]{2}\\s?[0-9][ABD-HJLNP-UW-Z]{2}" +
  ")";

export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "g");
export const REGEX_SINGLE = new RegExp(`^${PATTERN_SOURCE}$`);
export const PATTERNS = [{ name: "UK Postcode", regex: PATTERN_SOURCE, score: BASE_SCORE }];

export const CONTEXT: readonly string[] = [
  "postcode",
  "post code",
  "postal code",
  "zip",
  "address",
  "delivery",
  "mailing",
  "shipping",
  "correspondence",
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
      recognitionMetadata: { recognizerName: "UkPostcodeRecognizer" },
      analysisExplanation: {
        recognizer: "UkPostcodeRecognizer",
        patternName: "UK Postcode",
        pattern: REGEX.source,
        originalScore: BASE_SCORE,
        validationResult: null,
        textualExplanation: "Detected by `UkPostcodeRecognizer` using pattern `UK Postcode`",
      },
    });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class UkPostcodeRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "UkPostcodeRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  validateResult(patternText: string): boolean { return validateResult(patternText); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string): RecognizerResult[] { return analyze(text); }
}
