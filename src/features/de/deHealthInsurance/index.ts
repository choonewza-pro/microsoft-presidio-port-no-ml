/**
 * Germany Health Insurance (KVNR) Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/germany/de_health_insurance_recognizer.py:57
 * A + 9 digits, GKV checksum (alt 1,2 with cross-sum)
 */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "DE_HEALTH_INSURANCE" as const;
export const COUNTRY_CODE = "de" as const;
export const SUPPORTED_LANGUAGE = "de" as const;
export const BASE_SCORE = 0.3;

export const PATTERN_SOURCE = "[A-Z]\\d{9}";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "g");
export const REGEX_SINGLE = new RegExp(`^${PATTERN_SOURCE}$`);
export const PATTERNS = [{ name: "Krankenversicherungsnummer KVNR (letter + 9 digits)", regex: PATTERN_SOURCE, score: BASE_SCORE }];

export const CONTEXT: readonly string[] = [
  "krankenversicherungsnummer",
  "krankenversichertennummer",
  "versichertennummer",
  "kvnr",
  "krankenkasse",
  "krankenversicherung",
  "gesundheitskarte",
  "egk",
  "elektronische gesundheitskarte",
  "gkv",
  "gesetzliche krankenversicherung",
  "krankenversicherungsausweis",
  "versichertenausweis",
  "versichertenkarte",
  "aok",
  "tkk",
  "barmer",
  "dak",
] as const;

export function validateResult(patternText: string): boolean {
  const t = patternText.toUpperCase().trim();
  if (t.length !== 10) return false;
  if (!/^[A-Z]\d{9}$/.test(t)) return false;
  const letter = t[0]!;
  const letterVal = String(letter.charCodeAt(0) - 65 + 1).padStart(2, "0");
  const effective = letterVal + t.slice(1, 9);
  const checkDigit = parseInt(t[9]!, 10);
  const factors = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  let total = 0;
  for (let i = 0; i < 10; i++) {
    let product = parseInt(effective[i]!, 10) * factors[i]!;
    if (product >= 10) product = Math.floor(product / 10) + (product % 10);
    total += product;
  }
  return (total % 10) === checkDigit;
}

export function findAll(text: string): Array<{ value: string; start: number; end: number; score: number }> {
  const re = new RegExp(REGEX.source, REGEX.flags);
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  for (const m of text.matchAll(re)) {
    const value = m[0];
    const start = m.index ?? 0;
    const end = start + value.length;
    if (!value) continue;
    const ok = validateResult(value);
    const score = ok ? MAX_SCORE : MIN_SCORE;
    if (score <= MIN_SCORE) continue;
    results.push({ value, start, end, score });
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
    const validationResult = validateResult(value);
    const score = validationResult ? MAX_SCORE : MIN_SCORE;
    if (score <= MIN_SCORE) continue;
    results.push({
      entityType: ENTITY_TYPE,
      start, end, score, value,
      recognitionMetadata: { recognizerName: "DeHealthInsuranceRecognizer" },
      analysisExplanation: {
        recognizer: "DeHealthInsuranceRecognizer",
        patternName: "Krankenversicherungsnummer KVNR (letter + 9 digits)",
        pattern: REGEX.source,
        originalScore: BASE_SCORE,
        validationResult,
        textualExplanation: "Detected by `DeHealthInsuranceRecognizer` using pattern `Krankenversicherungsnummer KVNR (letter + 9 digits)`",
      },
    });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class DeHealthInsuranceRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "DeHealthInsuranceRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  validateResult(patternText: string): boolean { return validateResult(patternText); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string): RecognizerResult[] { return analyze(text); }
}
