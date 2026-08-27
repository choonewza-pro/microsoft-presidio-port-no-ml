/**
 * UK Driving Licence Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/uk/uk_driving_licence_recognizer.py
 * Validation: surname not all 99999 and matches ^[A-Z]+9*$
 * Returns False for invalid, None (null) for plausible (kept at BASE_SCORE)
 */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "UK_DRIVING_LICENCE" as const;
export const COUNTRY_CODE = "uk" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.5;

export const PATTERN_SOURCE = "[A-Z9]{5}[0-9](?:0[1-9]|1[0-2]|5[1-9]|6[0-2])(?:0[1-9]|[12][0-9]|3[01])[0-9][A-Z9]{2}[A-Z0-9][A-Z]{2}";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "g");
export const REGEX_SINGLE = new RegExp(`^${PATTERN_SOURCE}$`);
export const PATTERNS = [{ name: "UK Driving Licence", regex: PATTERN_SOURCE, score: BASE_SCORE }];

export const CONTEXT: readonly string[] = [
  "driving licence",
  "driving license",
  "driver's licence",
  "driver's license",
  "dvla",
  "dl number",
  "licence number",
  "license number",
] as const;

export function validateResult(patternText: string): boolean | null {
  const text = patternText.toUpperCase();
  if (text.slice(0, 5) === "99999") return false;
  const surname = text.slice(0, 5);
  if (!/^[A-Z]+9*$/.test(surname)) return false;
  return null;
}

export function findAll(text: string): Array<{ value: string; start: number; end: number; score: number }> {
  const re = new RegExp(REGEX.source, REGEX.flags);
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  for (const m of text.matchAll(re)) {
    const value = m[0];
    const start = m.index ?? 0;
    const end = start + value.length;
    if (!value) continue;
    const vr = validateResult(value);
    if (vr === false) continue;
    const score = vr === true ? MAX_SCORE : BASE_SCORE;
    if (score > MIN_SCORE) results.push({ value, start, end, score });
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
    const vr = validateResult(value);
    if (vr === false) continue;
    const score = vr === true ? MAX_SCORE : BASE_SCORE;
    results.push({
      entityType: ENTITY_TYPE,
      start, end, score, value,
      recognitionMetadata: { recognizerName: "UkDrivingLicenceRecognizer" },
      analysisExplanation: {
        recognizer: "UkDrivingLicenceRecognizer",
        patternName: "UK Driving Licence",
        pattern: REGEX.source,
        originalScore: BASE_SCORE,
        validationResult: vr as boolean | null,
        textualExplanation: "Detected by `UkDrivingLicenceRecognizer` using pattern `UK Driving Licence`",
      },
    });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class UkDrivingLicenceRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "UkDrivingLicenceRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  validateResult(patternText: string): boolean | null { return validateResult(patternText); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string): RecognizerResult[] { return analyze(text); }
}
