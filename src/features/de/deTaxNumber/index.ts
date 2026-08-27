/**
 * Germany Tax Number (Steuernummer) Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/germany/de_tax_number_recognizer.py:40
 * ELSTER 13 digits + state slash formats
 */
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "DE_TAX_NUMBER" as const;
export const COUNTRY_CODE = "de" as const;
export const SUPPORTED_LANGUAGE = "de" as const;
export const BASE_SCORE = 0.5;

export const PATTERN_ELSTER = "(0[1-9]|1[0-6])\\d{11}";
export const PATTERN_BY = "\\d{3}/\\d{3}/\\d{5}";
export const PATTERN_GENERIC = "\\d{2,3}/\\d{3,4}/\\d{4,5}";

export const PATTERNS = [
  { name: "Steuernummer ELSTER (bundeseinheitlich, 13-stellig)", regex: PATTERN_ELSTER, score: 0.5 },
  { name: "Steuernummer mit Schrägstrich (Bayern/BW: 3/3/5)", regex: PATTERN_BY, score: 0.4 },
  { name: "Steuernummer mit Schrägstrich (NW: 3/4/4 oder allgemein 2-3/3-4/4-5)", regex: PATTERN_GENERIC, score: 0.2 },
];

export const REGEX_ELSTER = new RegExp(`\\b${PATTERN_ELSTER}\\b`, "g");
export const REGEX_BY = new RegExp(`(?<!\\w)${PATTERN_BY}(?!\\w)`, "g");
export const REGEX_GENERIC = new RegExp(`(?<!\\w)${PATTERN_GENERIC}(?!\\w)`, "g");
export const REGEX = new RegExp(`\\b${PATTERN_ELSTER}\\b|(?<!\\w)${PATTERN_BY}(?!\\w)|(?<!\\w)${PATTERN_GENERIC}(?!\\w)`, "g");

export const CONTEXT: readonly string[] = [
  "steuernummer",
  "steuer-nr",
  "steuer nr",
  "st.-nr",
  "st-nr",
  "finanzamt",
  "umsatzsteuer",
  "einkommensteuer",
  "körperschaftsteuer",
  "gewerbesteuer",
  "steuerveranlagung",
  "steuerbescheid",
] as const;

export function validateResult(_patternText: string): boolean | null { return null; }

export function findAll(text: string): Array<{ value: string; start: number; end: number; score: number }> {
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  const seen = new Set<string>();
  for (const pat of PATTERNS) {
    const re = new RegExp(`\\b${pat.regex}\\b|(?<!\\w)${pat.regex}(?!\\w)`, "g");
    // Use specific regex boundaries per pattern type
    const actualRe = pat.regex === PATTERN_ELSTER
      ? new RegExp(`\\b${pat.regex}\\b`, "g")
      : new RegExp(`(?<!\\w)${pat.regex}(?!\\w)`, "g");
    for (const m of text.matchAll(actualRe)) {
      const value = m[0];
      const start = m.index ?? 0;
      const end = start + value.length;
      if (!value) continue;
      const key = `${start}-${end}`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({ value, start, end, score: pat.score });
    }
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export function analyze(text: string): RecognizerResult[] {
  const results: RecognizerResult[] = [];
  const seen = new Set<string>();
  for (const pat of PATTERNS) {
    const actualRe = pat.regex === PATTERN_ELSTER
      ? new RegExp(`\\b${pat.regex}\\b`, "g")
      : new RegExp(`(?<!\\w)${pat.regex}(?!\\w)`, "g");
    for (const m of text.matchAll(actualRe)) {
      const value = m[0];
      const start = m.index ?? 0;
      const end = start + value.length;
      if (!value) continue;
      const key = `${start}-${end}`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({
        entityType: ENTITY_TYPE,
        start, end, score: pat.score, value,
        recognitionMetadata: { recognizerName: "DeTaxNumberRecognizer" },
        analysisExplanation: {
          recognizer: "DeTaxNumberRecognizer",
          patternName: pat.name,
          pattern: pat.regex,
          originalScore: pat.score,
          validationResult: null,
          textualExplanation: `Detected by \`DeTaxNumberRecognizer\` using pattern \`${pat.name}\``,
        },
      });
    }
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class DeTaxNumberRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "DeTaxNumberRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  validateResult(patternText: string): boolean | null { return validateResult(patternText); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string): RecognizerResult[] { return analyze(text); }
}
