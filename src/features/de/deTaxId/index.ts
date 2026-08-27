/**
 * Germany Tax ID (Steueridentifikationsnummer) Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/germany/de_tax_id_recognizer.py:38
 * Format: 11 digits, first 1-9, no digit >3 times in pos1-10, ISO7064 Mod11,10 check at pos11
 */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "DE_TAX_ID" as const;
export const COUNTRY_CODE = "de" as const;
export const SUPPORTED_LANGUAGE = "de" as const;
export const BASE_SCORE = 0.5;

export const PATTERN_SOURCE = "[1-9]\\d{10}";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "g");
export const REGEX_SINGLE = new RegExp(`^${PATTERN_SOURCE}$`);
export const PATTERNS = [{ name: "Steueridentifikationsnummer (High)", regex: PATTERN_SOURCE, score: BASE_SCORE }];

export const CONTEXT: readonly string[] = [
  "steueridentifikationsnummer",
  "steuer-id",
  "steuerid",
  "steuerliche identifikationsnummer",
  "steuerliche identifikation",
  "persönliche identifikationsnummer",
  "steuer identifikation",
  "idnr",
  "steuer-idnr",
  "steuernummer",
  "bzst",
] as const;

export function validateResult(patternText: string): boolean {
  const t = patternText.trim();
  if (t.length !== 11 || !/^\d{11}$/.test(t)) return false;
  if (t[0] === "0") return false;
  const digits = t.split("").map((c) => parseInt(c, 10));
  // Post-2016 BZSt rule: no digit may appear more than three times in positions 1-10
  const counter: Record<string, number> = {};
  for (let i = 0; i < 10; i++) {
    const d = t[i]!;
    counter[d] = (counter[d] ?? 0) + 1;
    if (counter[d]! > 3) return false;
  }
  // ISO 7064 Mod 11,10
  let product = 10;
  for (let i = 0; i < 10; i++) {
    let total = (digits[i]! + product) % 10;
    if (total === 0) total = 10;
    product = (total * 2) % 11;
  }
  let check = 11 - product;
  if (check === 10) check = 0;
  return check === digits[10];
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
      recognitionMetadata: { recognizerName: "DeTaxIdRecognizer" },
      analysisExplanation: {
        recognizer: "DeTaxIdRecognizer",
        patternName: "Steueridentifikationsnummer (High)",
        pattern: REGEX.source,
        originalScore: BASE_SCORE,
        validationResult,
        textualExplanation: "Detected by `DeTaxIdRecognizer` using pattern `Steueridentifikationsnummer (High)`",
      },
    });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class DeTaxIdRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "DeTaxIdRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  validateResult(patternText: string): boolean { return validateResult(patternText); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string): RecognizerResult[] { return analyze(text); }
}
