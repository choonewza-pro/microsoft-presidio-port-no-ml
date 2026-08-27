/**
 * Germany Vehicle Plate (KFZ-Kennzeichen) Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/germany/de_kfz_recognizer.py:48
 */
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "DE_KFZ" as const;
export const COUNTRY_CODE = "de" as const;
export const SUPPORTED_LANGUAGE = "de" as const;
export const BASE_SCORE = 0.3;

export const PATTERN_SPACE = "[A-ZÄÖÜ]{1,3}\\s[A-Z]{1,2}\\s\\d{1,4}[EH]?";
export const PATTERN_DASH = "[A-ZÄÖÜ]{1,3}-[A-Z]{1,2}-\\d{1,4}[EH]?";
export const PATTERN_DASH_SPACE = "[A-ZÄÖÜ]{1,3}-[A-Z]{1,2}\\s\\d{1,4}[EH]?";
export const PATTERN_ASCII_SPACE = "[A-Z]{1,3}\\s[A-Z]{1,2}\\s\\d{1,4}[EH]?";
export const PATTERN_ASCII_DASH_SPACE = "[A-Z]{1,3}-[A-Z]{1,2}\\s\\d{1,4}[EH]?";

export const PATTERNS = [
  { name: "KFZ-Kennzeichen (mit Leerzeichen)", regex: PATTERN_SPACE, score: 0.3 },
  { name: "KFZ-Kennzeichen (mit Bindestrich)", regex: PATTERN_DASH, score: 0.3 },
  { name: "KFZ-Kennzeichen (Bindestrich + Leerzeichen)", regex: PATTERN_DASH_SPACE, score: 0.3 },
  { name: "KFZ-Kennzeichen (ASCII only, mit Leerzeichen)", regex: PATTERN_ASCII_SPACE, score: 0.2 },
  { name: "KFZ-Kennzeichen (ASCII only, Bindestrich + Leerzeichen)", regex: PATTERN_ASCII_DASH_SPACE, score: 0.2 },
];

// Presidio uses lookbehind (?<![\w-]) and lookahead (?!\w) to avoid partial matches
export const REGEX = new RegExp(`(?<![\\w-])(?:${PATTERN_SPACE}|${PATTERN_DASH}|${PATTERN_DASH_SPACE})(?!\\w)`, "g");
export const REGEX_SINGLE_SPACE = new RegExp(`^(?:${PATTERN_SPACE})$`);
export const REGEX_SINGLE_DASH = new RegExp(`^(?:${PATTERN_DASH})$`);

export const CONTEXT: readonly string[] = [
  "kennzeichen",
  "kfz-kennzeichen",
  "kraftfahrzeugkennzeichen",
  "nummernschild",
  "fahrzeugkennzeichen",
  "zulassung",
  "kfz",
  "fahrzeug",
  "auto",
  "pkw",
  "lkw",
  "fahrzeugschein",
  "fahrzeugbrief",
  "zulassungsbescheinigung",
  "amtliches kennzeichen",
] as const;

export function validateResult(_patternText: string): boolean | null { return null; }

export function findAll(text: string): Array<{ value: string; start: number; end: number; score: number }> {
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  const seen = new Set<string>();
  for (const pat of PATTERNS) {
    const re = new RegExp(`(?<![\\w-])${pat.regex}(?!\\w)`, "g");
    for (const m of text.matchAll(re)) {
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
    const re = new RegExp(`(?<![\\w-])${pat.regex}(?!\\w)`, "g");
    for (const m of text.matchAll(re)) {
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
        recognitionMetadata: { recognizerName: "DeKfzRecognizer" },
        analysisExplanation: {
          recognizer: "DeKfzRecognizer",
          patternName: pat.name,
          pattern: pat.regex,
          originalScore: pat.score,
          validationResult: null,
          textualExplanation: `Detected by \`DeKfzRecognizer\` using pattern \`${pat.name}\``,
        },
      });
    }
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class DeKfzRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "DeKfzRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  validateResult(patternText: string): boolean | null { return validateResult(patternText); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string): RecognizerResult[] { return analyze(text); }
}
