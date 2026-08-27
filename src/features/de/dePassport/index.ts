/**
 * Germany Passport (Reisepassnummer) Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/germany/de_passport_recognizer.py:55
 * ICAO Doc9303 weights 7,3,1
 */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "DE_PASSPORT" as const;
export const COUNTRY_CODE = "de" as const;
export const SUPPORTED_LANGUAGE = "de" as const;
export const BASE_SCORE = 0.4;

export const PATTERN_SOURCE = "[CFGHJKLMNPRTVWXYZ][CFGHJKLMNPRTVWXYZ0-9]{7}[0-9]";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "g");
export const REGEX_SINGLE = new RegExp(`^${PATTERN_SOURCE}$`);
export const PATTERNS = [{ name: "Reisepassnummer (Strict ICAO charset)", regex: PATTERN_SOURCE, score: BASE_SCORE }];

export const CONTEXT: readonly string[] = [
  "reisepass",
  "pass",
  "passnummer",
  "reisepassnummer",
  "passport",
  "passport number",
  "pass-nr",
  "dokumentennummer",
  "bundesrepublik deutschland",
  "ausweisdokument",
  "mrz",
] as const;

const FORBIDDEN = new Set("ABDEIOQSU".split(""));

export function validateResult(patternText: string): boolean {
  const t = patternText.toUpperCase().trim();
  if (t.length !== 9 || !/\d$/.test(t)) return false;
  // reject forbidden letters in first 8 chars (ICAO)
  for (let i = 0; i < 8; i++) {
    if (FORBIDDEN.has(t[i]!)) return false;
  }
  const weights = [7, 3, 1];
  let total = 0;
  for (let i = 0; i < 8; i++) {
    const c = t[i]!;
    let value: number;
    if (c >= "0" && c <= "9") value = parseInt(c, 10);
    else if (c >= "A" && c <= "Z") value = c.charCodeAt(0) - 65 + 10;
    else return false;
    total += value * weights[i % 3]!;
  }
  return (total % 10) === parseInt(t[8]!, 10);
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
      recognitionMetadata: { recognizerName: "DePassportRecognizer" },
      analysisExplanation: {
        recognizer: "DePassportRecognizer",
        patternName: "Reisepassnummer (Strict ICAO charset)",
        pattern: REGEX.source,
        originalScore: BASE_SCORE,
        validationResult,
        textualExplanation: "Detected by `DePassportRecognizer` using pattern `Reisepassnummer (Strict ICAO charset)`",
      },
    });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class DePassportRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "DePassportRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  validateResult(patternText: string): boolean { return validateResult(patternText); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string): RecognizerResult[] { return analyze(text); }
}
