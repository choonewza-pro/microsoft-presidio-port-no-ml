/**
 * UK NINO Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/uk/uk_nino_recognizer.py
 * NINO: 2 letters (blacklist bg/gb/nk/kn/nt/tn/zz), 6 digits, 1 letter A-D
 */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "UK_NINO" as const;
export const COUNTRY_CODE = "uk" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.5;

// Python: r"\b(?!bg|gb|nk|kn|nt|tn|zz|BG|GB|NK|KN|NT|TN|ZZ)([a-ceghj-pr-tw-zA-CEGHJ-PR-TW-Z]{1}[a-ceghj-npr-tw-zA-CEGHJ-NPR-TW-Z]{1}) ?([0-9]{2}) ?([0-9]{2}) ?([0-9]{2}) ?([a-dA-D]{1})\b"
export const PATTERN_SOURCE = "(?!bg|gb|nk|kn|nt|tn|zz|BG|GB|NK|KN|NT|TN|ZZ)([a-ceghj-pr-tw-zA-CEGHJ-PR-TW-Z]{1}[a-ceghj-npr-tw-zA-CEGHJ-NPR-TW-Z]{1}) ?([0-9]{2}) ?([0-9]{2}) ?([0-9]{2}) ?([a-dA-D]{1})";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "g");
export const REGEX_SINGLE = new RegExp(`^${PATTERN_SOURCE}$`);
export const PATTERNS = [{ name: "NINO (medium)", regex: PATTERN_SOURCE, score: BASE_SCORE }];

export const CONTEXT: readonly string[] = ["national insurance", "ni number", "nino"] as const;

export function validateResult(_patternText: string): boolean {
  // Python has no validate_result override; blacklist enforced via regex negative lookahead
  return true;
}

export function findAll(text: string): Array<{ value: string; start: number; end: number; score: number }> {
  const re = new RegExp(REGEX.source, REGEX.flags);
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  for (const m of text.matchAll(re)) {
    const value = m[0];
    const start = m.index ?? 0;
    const end = start + value.length;
    if (!value) continue;
    // No checksum to fail, always MAX
    results.push({ value, start, end, score: MAX_SCORE });
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
      start, end, score: MAX_SCORE, value,
      recognitionMetadata: { recognizerName: "UkNinoRecognizer" },
      analysisExplanation: {
        recognizer: "UkNinoRecognizer",
        patternName: "NINO (medium)",
        pattern: REGEX.source,
        originalScore: BASE_SCORE,
        validationResult: true,
        textualExplanation: "Detected by `UkNinoRecognizer` using pattern `NINO (medium)`",
      },
    });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class UkNinoRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "UkNinoRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  validateResult(patternText: string): boolean { return validateResult(patternText); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string): RecognizerResult[] { return analyze(text); }
}
