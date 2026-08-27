/**
 * Germany LANR (Lebenslange Arztnummer) Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/germany/de_lanr_recognizer.py
 * 9 digits KBV check: weights [4,9,4,9,4,9] on pos1-6, check = (10 - sum%10)%10 at pos7
 */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "DE_LANR" as const;
export const COUNTRY_CODE = "de" as const;
export const SUPPORTED_LANGUAGE = "de" as const;
export const BASE_SCORE = 0.3;

export const PATTERN_SOURCE = "\\d{9}";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "g");
export const REGEX_SINGLE = new RegExp(`^${PATTERN_SOURCE}$`);
export const PATTERNS = [{ name: "Lebenslange Arztnummer LANR (9 digits)", regex: PATTERN_SOURCE, score: BASE_SCORE }];

export const CONTEXT: readonly string[] = [
  "arztnummer",
  "lanr",
  "lebenslange arztnummer",
  "arzt-nr",
  "arzt nr",
  "arzt-nummer",
  "vertragsarzt",
  "kassenarzt",
  "niedergelassener arzt",
  "kbv",
  "kassenärztliche vereinigung",
  "kv-nummer",
  "rezept",
  "verschreibung",
  "behandelnder arzt",
  "hausarzt",
  "facharzt",
] as const;

export function validateResult(patternText: string): boolean {
  const t = patternText.trim();
  if (t.length !== 9 || !/^\d{9}$/.test(t)) return false;
  const weights = [4, 9, 4, 9, 4, 9];
  let total = 0;
  for (let i = 0; i < 6; i++) total += parseInt(t[i]!, 10) * weights[i]!;
  const expected = (10 - (total % 10)) % 10;
  return parseInt(t[6]!, 10) === expected;
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
      recognitionMetadata: { recognizerName: "DeLanrRecognizer" },
      analysisExplanation: {
        recognizer: "DeLanrRecognizer",
        patternName: "Lebenslange Arztnummer LANR (9 digits)",
        pattern: REGEX.source,
        originalScore: BASE_SCORE,
        validationResult,
        textualExplanation: "Detected by `DeLanrRecognizer` using pattern `Lebenslange Arztnummer LANR (9 digits)`",
      },
    });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class DeLanrRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "DeLanrRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  validateResult(patternText: string): boolean { return validateResult(patternText); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string): RecognizerResult[] { return analyze(text); }
}
