/**
 * Italy Identity Card Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/italy/it_identity_card_recognizer.py
 * 3 patterns with score 0.01 (very weak)
 */
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "IT_IDENTITY_CARD" as const;
export const COUNTRY_CODE = "it" as const;
export const SUPPORTED_LANGUAGE = "it" as const;
export const BASE_SCORE = 0.01;

export const PATTERN_PAPER = "[A-Z]{2}\\s?\\d{7}";
export const PATTERN_CIE_20 = "\\d{7}[A-Z]{2}";
export const PATTERN_CIE_30 = "[A-Z]{2}\\d{5}[A-Z]{2}";

export const PATTERNS = [
  { name: "Paper-based Identity Card (very weak)", regex: PATTERN_PAPER, score: BASE_SCORE },
  { name: "Electronic Identity Card (CIE) 2.0 (very weak)", regex: PATTERN_CIE_20, score: BASE_SCORE },
  { name: "Electronic Identity Card (CIE) 3.0 (very weak)", regex: PATTERN_CIE_30, score: BASE_SCORE },
];

export const REGEX_PAPER = new RegExp(`\\b${PATTERN_PAPER}\\b`, "gi");
export const REGEX_CIE20 = new RegExp(`\\b${PATTERN_CIE_20}\\b`, "gi");
export const REGEX_CIE30 = new RegExp(`\\b${PATTERN_CIE_30}\\b`, "gi");
export const REGEX = new RegExp(`\\b(?:${PATTERN_PAPER}|${PATTERN_CIE_20}|${PATTERN_CIE_30})\\b`, "gi");

export const CONTEXT: readonly string[] = [
  "carta",
  "identità",
  "elettronica",
  "cie",
  "documento",
  "riconoscimento",
  "espatrio",
] as const;

export function validateResult(_patternText: string): boolean { return true; }

export function findAll(text: string): Array<{ value: string; start: number; end: number; score: number }> {
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  const seen = new Set<string>();
  for (const pat of PATTERNS) {
    const re = new RegExp(`\\b${pat.regex}\\b`, "gi");
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
  const all = findAll(text);
  return all.map(({ value, start, end, score }) => {
    let patternName = PATTERNS[0]!.name;
    let pattern = PATTERNS[0]!.regex;
    for (const pat of PATTERNS) {
      if (new RegExp(`^${pat.regex}$`, "i").test(value)) { patternName = pat.name; pattern = pat.regex; break; }
    }
    return {
      entityType: ENTITY_TYPE,
      start, end, score, value,
      recognitionMetadata: { recognizerName: "ItIdentityCardRecognizer" },
      analysisExplanation: {
        recognizer: "ItIdentityCardRecognizer",
        patternName,
        pattern,
        originalScore: BASE_SCORE,
        validationResult: null,
        textualExplanation: `Detected by \`ItIdentityCardRecognizer\` using pattern \`${patternName}\``,
      },
    } as RecognizerResult;
  }).sort((a, b) => b.score - a.score || a.start - b.start);
}

export class ItIdentityCardRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "ItIdentityCardRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  validateResult(patternText: string): boolean { return validateResult(patternText); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string): RecognizerResult[] { return analyze(text); }
}
