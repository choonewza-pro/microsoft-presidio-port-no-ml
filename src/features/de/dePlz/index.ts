/**
 * Germany Postal Code (PLZ) Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/germany/de_plz_recognizer.py:45
 * 5 digits 01001-99998
 */
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "DE_PLZ" as const;
export const COUNTRY_CODE = "de" as const;
export const SUPPORTED_LANGUAGE = "de" as const;
export const BASE_SCORE = 0.05;

export const PATTERN_SOURCE = "(?!01000\\b|99999\\b)(0[1-9]\\d{3}|[1-9]\\d{4})";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "g");
export const REGEX_SINGLE = new RegExp(`^${PATTERN_SOURCE}$`);
export const PATTERNS = [{ name: "Postleitzahl (5 digits, very low base confidence – context required)", regex: PATTERN_SOURCE, score: BASE_SCORE }];

export const CONTEXT: readonly string[] = [
  "plz",
  "postleitzahl",
  "postanschrift",
  "adresse",
  "wohnort",
  "ort",
  "wohnanschrift",
  "lieferadresse",
  "rechnungsadresse",
  "straße",
  "strasse",
  "hausnummer",
  "postfach",
  "bundesland",
  "gemeinde",
  "stadt",
  "dorf",
] as const;

export function validateResult(patternText: string): boolean {
  const t = patternText.trim();
  if (!/^\d{5}$/.test(t)) return false;
  if (t === "01000" || t === "99999") return false;
  const n = parseInt(t, 10);
  return n >= 1001 && n <= 99998;
}

export function findAll(text: string): Array<{ value: string; start: number; end: number; score: number }> {
  const re = new RegExp(REGEX.source, REGEX.flags);
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  for (const m of text.matchAll(re)) {
    const value = m[0];
    const start = m.index ?? 0;
    const end = start + value.length;
    if (!value) continue;
    // The regex already excludes 01000/99999, but validate ensures range
    const ok = validateResult(value);
    if (!ok) continue;
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
    const vr = validateResult(value);
    if (!vr) continue;
    results.push({
      entityType: ENTITY_TYPE,
      start, end, score: BASE_SCORE, value,
      recognitionMetadata: { recognizerName: "DePlzRecognizer" },
      analysisExplanation: {
        recognizer: "DePlzRecognizer",
        patternName: "Postleitzahl (5 digits, very low base confidence – context required)",
        pattern: REGEX.source,
        originalScore: BASE_SCORE,
        validationResult: vr,
        textualExplanation: "Detected by `DePlzRecognizer` using pattern `Postleitzahl (5 digits, very low base confidence – context required)`",
      },
    });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class DePlzRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "DePlzRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  validateResult(patternText: string): boolean { return validateResult(patternText); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string): RecognizerResult[] { return analyze(text); }
}
