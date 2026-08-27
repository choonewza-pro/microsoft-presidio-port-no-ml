/**
 * Germany Social Security (Rentenversicherungsnummer RVNR) Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/germany/de_social_security_recognizer.py
 * 12 chars: 8 digits + letter + 3 digits, VKVV §4 checksum with cross-sum, weights [2,1,2,5,7,1,2,1,2,1,2,1]
 */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "DE_SOCIAL_SECURITY" as const;
export const COUNTRY_CODE = "de" as const;
export const SUPPORTED_LANGUAGE = "de" as const;
export const BASE_SCORE = 0.5;

export const PATTERN_STRICT = "\\d{2}(0[1-9]|[12]\\d|3[01]|5[1-9]|[67]\\d|8[01])(0[1-9]|1[0-2])\\d{2}[A-Z]\\d{2}[0-9]";
export const PATTERN_RELAXED = "\\d{8}[A-Z]\\d{3}";

export const PATTERNS = [
  { name: "Rentenversicherungsnummer (Strict, with birth date structure)", regex: PATTERN_STRICT, score: 0.5 },
  { name: "Rentenversicherungsnummer (Relaxed)", regex: PATTERN_RELAXED, score: 0.3 },
];

export const REGEX_STRICT = new RegExp(`\\b${PATTERN_STRICT}\\b`, "g");
export const REGEX_RELAXED = new RegExp(`\\b${PATTERN_RELAXED}\\b`, "g");
export const REGEX = new RegExp(`\\b(?:${PATTERN_STRICT}|${PATTERN_RELAXED})\\b`, "g");

export const CONTEXT: readonly string[] = [
  "rentenversicherungsnummer",
  "sozialversicherungsnummer",
  "versicherungsnummer",
  "rvnr",
  "svnr",
  "sv-nummer",
  "rente",
  "rentenversicherung",
  "deutsche rentenversicherung",
  "drv",
  "sozialversicherung",
  "sozialversicherungsausweis",
  "rentenausweis",
] as const;

export function validateResult(patternText: string): boolean {
  const t = patternText.toUpperCase().trim();
  if (t.length !== 12) return false;
  if (!/^\d{8}[A-Z]\d{3}$/.test(t)) return false;
  const day = parseInt(t.slice(2, 4), 10);
  const month = parseInt(t.slice(4, 6), 10);
  if (!((day >= 1 && day <= 31) || (day >= 51 && day <= 81))) return false;
  if (!(month >= 1 && month <= 12)) return false;
  const letter = t[8]!;
  const letterVal = String(letter.charCodeAt(0) - 65 + 1).padStart(2, "0");
  const effective = t.slice(0, 8) + letterVal + t.slice(9, 11);
  const checkDigit = parseInt(t[11]!, 10);
  const weights = [2, 1, 2, 5, 7, 1, 2, 1, 2, 1, 2, 1];
  let total = 0;
  for (let i = 0; i < 12; i++) {
    const product = parseInt(effective[i]!, 10) * weights[i]!;
    total += Math.floor(product / 10) + (product % 10);
  }
  return (total % 10) === checkDigit;
}

export function findAll(text: string): Array<{ value: string; start: number; end: number; score: number }> {
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  const seen = new Set<string>();
  for (const pat of PATTERNS) {
    const re = new RegExp(`\\b${pat.regex}\\b`, "g");
    for (const m of text.matchAll(re)) {
      const value = m[0];
      const start = m.index ?? 0;
      const end = start + value.length;
      if (!value) continue;
      const key = `${start}-${end}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const ok = validateResult(value);
      const score = ok ? MAX_SCORE : MIN_SCORE;
      if (score <= MIN_SCORE) continue;
      results.push({ value, start, end, score });
    }
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export function analyze(text: string): RecognizerResult[] {
  const results: RecognizerResult[] = [];
  const seen = new Set<string>();
  for (const pat of PATTERNS) {
    const re = new RegExp(`\\b${pat.regex}\\b`, "g");
    for (const m of text.matchAll(re)) {
      const value = m[0];
      const start = m.index ?? 0;
      const end = start + value.length;
      if (!value) continue;
      const key = `${start}-${end}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const validationResult = validateResult(value);
      const score = validationResult ? MAX_SCORE : MIN_SCORE;
      if (score <= MIN_SCORE) continue;
      results.push({
        entityType: ENTITY_TYPE,
        start, end, score, value,
        recognitionMetadata: { recognizerName: "DeSocialSecurityRecognizer" },
        analysisExplanation: {
          recognizer: "DeSocialSecurityRecognizer",
          patternName: pat.name,
          pattern: pat.regex,
          originalScore: pat.score,
          validationResult,
          textualExplanation: `Detected by \`DeSocialSecurityRecognizer\` using pattern \`${pat.name}\``,
        },
      });
    }
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class DeSocialSecurityRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "DeSocialSecurityRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  validateResult(patternText: string): boolean { return validateResult(patternText); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string): RecognizerResult[] { return analyze(text); }
}
