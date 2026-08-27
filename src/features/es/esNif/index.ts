/**
 * Spain NIF Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/spain/es_nif_recognizer.py
 * Check: TRWAGMYFPDXBNJZSQVHLCKE[ number %23]
 */
import { sanitizeValue } from "../../../core/sanitize.ts";
import type { ReplacementPair } from "../../../core/sanitize.ts";
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "ES_NIF" as const;
export const COUNTRY_CODE = "es" as const;
export const SUPPORTED_LANGUAGE = "es" as const;
export const BASE_SCORE = 0.5;
export const REPLACEMENT_PAIRS: ReplacementPair[] = [["-", ""], [" ", ""]];

export const PATTERN_SOURCE = "[0-9]?[0-9]{7}[-]?[A-Z]";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "g");
export const REGEX_SINGLE = new RegExp(`^${PATTERN_SOURCE}$`, "i");
export const PATTERNS = [{ name: "NIF", regex: PATTERN_SOURCE, score: BASE_SCORE }];

export const CONTEXT: readonly string[] = ["documento nacional de identidad", "DNI", "NIF", "identificación"] as const;

const LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";

export function validateResult(patternText: string, replacementPairs: ReplacementPair[] = REPLACEMENT_PAIRS): boolean {
  const sanitized = sanitizeValue(patternText, replacementPairs).toUpperCase();
  if (sanitized.length < 2) return false;
  const letter = sanitized[sanitized.length - 1]!;
  const digits = sanitized.replace(/[^0-9]/g, "");
  if (!digits) return false;
  const number = parseInt(digits, 10);
  if (Number.isNaN(number)) return false;
  return letter === LETTERS[number % 23];
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
      recognitionMetadata: { recognizerName: "EsNifRecognizer" },
      analysisExplanation: {
        recognizer: "EsNifRecognizer",
        patternName: "NIF",
        pattern: REGEX.source,
        originalScore: BASE_SCORE,
        validationResult,
        textualExplanation: "Detected by `EsNifRecognizer` using pattern `NIF`",
      },
    });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class EsNifRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "EsNifRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  replacementPairs: ReplacementPair[];
  constructor(replacementPairs: ReplacementPair[] = REPLACEMENT_PAIRS) { this.replacementPairs = replacementPairs; }
  validateResult(patternText: string): boolean { return validateResult(patternText, this.replacementPairs); }
  findAll(text: string) { return findAll(text, this.replacementPairs); }
  analyze(text: string): RecognizerResult[] { return analyze(text, this.replacementPairs); }
}
