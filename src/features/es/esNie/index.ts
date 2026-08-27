/**
 * Spain NIE Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/spain/es_nie_recognizer.py
 * XYZ->012 + mod23 via TRWAGMYFPDXBNJZSQVHLCKE
 */
import { sanitizeValue } from "../../../core/sanitize.ts";
import type { ReplacementPair } from "../../../core/sanitize.ts";
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "ES_NIE" as const;
export const COUNTRY_CODE = "es" as const;
export const SUPPORTED_LANGUAGE = "es" as const;
export const BASE_SCORE = 0.5;
export const REPLACEMENT_PAIRS: ReplacementPair[] = [["-", ""], [" ", ""]];

export const PATTERN_SOURCE = "[X-Z]?[0-9]?[0-9]{7}[-]?[A-Z]";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "g");
export const REGEX_SINGLE = new RegExp(`^${PATTERN_SOURCE}$`, "i");
export const PATTERNS = [{ name: "NIE", regex: PATTERN_SOURCE, score: BASE_SCORE }];

export const CONTEXT: readonly string[] = ["número de identificación de extranjero", "NIE"] as const;

const LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";

export function validateResult(patternText: string, replacementPairs: ReplacementPair[] = REPLACEMENT_PAIRS): boolean {
  const text = sanitizeValue(patternText, replacementPairs).toUpperCase();
  const letter = text[text.length - 1]!;
  if (text.length < 8 || text.length > 9) return false;
  if (!text.slice(1, -1).split("").every(c => /[0-9]/.test(c))) return false;
  if (!"XYZ".includes(text[0]!)) return false;
  const number = parseInt(String("XYZ".indexOf(text[0]!)) + text.slice(1, -1), 10);
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
      recognitionMetadata: { recognizerName: "EsNieRecognizer" },
      analysisExplanation: {
        recognizer: "EsNieRecognizer",
        patternName: "NIE",
        pattern: REGEX.source,
        originalScore: BASE_SCORE,
        validationResult,
        textualExplanation: "Detected by `EsNieRecognizer` using pattern `NIE`",
      },
    });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class EsNieRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "EsNieRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  replacementPairs: ReplacementPair[];
  constructor(replacementPairs: ReplacementPair[] = REPLACEMENT_PAIRS) { this.replacementPairs = replacementPairs; }
  validateResult(patternText: string): boolean { return validateResult(patternText, this.replacementPairs); }
  findAll(text: string) { return findAll(text, this.replacementPairs); }
  analyze(text: string): RecognizerResult[] { return analyze(text, this.replacementPairs); }
}
