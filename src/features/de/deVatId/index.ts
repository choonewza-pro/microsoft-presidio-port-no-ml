/**
 * Germany VAT ID (USt-IdNr.) Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/germany/de_vat_id_recognizer.py:74
 * DE + 9 digits, ISO7064 Mod11,10 heuristic, strict flag
 */
import { sanitizeValue } from "../../../core/sanitize.ts";
import type { ReplacementPair } from "../../../core/sanitize.ts";
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "DE_VAT_ID" as const;
export const COUNTRY_CODE = "de" as const;
export const SUPPORTED_LANGUAGE = "de" as const;
export const BASE_SCORE = 0.5;

export const REPLACEMENT_PAIRS: ReplacementPair[] = [[" ", ""], [".", ""], ["-", ""]];

export const PATTERN_SOURCE = "DE\\d{9}";
export const PATTERN_WITH_SEP = "DE[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}";

export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "gi");
export const REGEX_SEP = new RegExp(`\\b${PATTERN_WITH_SEP}\\b`, "gi");

export const PATTERNS = [
  { name: "Umsatzsteuer-Identifikationsnummer USt-IdNr. (DE + 9 digits)", regex: PATTERN_SOURCE, score: 0.5 },
  { name: "Umsatzsteuer-Identifikationsnummer USt-IdNr. (with separators)", regex: PATTERN_WITH_SEP, score: 0.4 },
];

export const CONTEXT: readonly string[] = [
  "umsatzsteuer-identifikationsnummer",
  "umsatzsteueridentifikationsnummer",
  "ust-idnr",
  "ust-id",
  "ustidnr",
  "umsatzsteuer-id",
  "mehrwertsteuer",
  "vat",
  "vat-id",
  "vat id",
  "steueridentifikation",
  "bzst",
  "bundeszentralamt für steuern",
  "finanzamt",
  "invoice",
  "rechnung",
] as const;

export function validateResult(patternText: string, strictChecksum = false): boolean | null {
  const normalized = sanitizeValue(patternText.toUpperCase(), REPLACEMENT_PAIRS);
  if (normalized.length !== 11 || !normalized.startsWith("DE")) return false;
  const digits = normalized.slice(2);
  if (!/^\d{9}$/.test(digits)) return false;
  let product = 10;
  for (let i = 0; i < 8; i++) {
    let total = (parseInt(digits[i]!, 10) + product) % 10;
    if (total === 0) total = 10;
    product = (total * 2) % 11;
  }
  let check = 11 - product;
  if (check === 10) check = 0;
  if (check === parseInt(digits[8]!, 10)) return true;
  return strictChecksum ? false : null;
}

export function findAll(text: string, strictChecksum = false): Array<{ value: string; start: number; end: number; score: number }> {
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
      const vr = validateResult(value, strictChecksum);
      if (vr === false) continue;
      const score = vr === true ? MAX_SCORE : pat.score;
      if (score <= MIN_SCORE) continue;
      results.push({ value, start, end, score });
    }
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export function analyze(text: string, strictChecksum = false): RecognizerResult[] {
  const results: RecognizerResult[] = [];
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
      const vr = validateResult(value, strictChecksum);
      if (vr === false) continue;
      const score = vr === true ? MAX_SCORE : pat.score;
      results.push({
        entityType: ENTITY_TYPE,
        start, end, score, value,
        recognitionMetadata: { recognizerName: "DeVatIdRecognizer" },
        analysisExplanation: {
          recognizer: "DeVatIdRecognizer",
          patternName: pat.name,
          pattern: pat.regex,
          originalScore: pat.score,
          validationResult: vr,
          textualExplanation: `Detected by \`DeVatIdRecognizer\` using pattern \`${pat.name}\``,
        },
      });
    }
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class DeVatIdRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  strictChecksum: boolean;
  constructor(strictChecksum = false) { this.strictChecksum = strictChecksum; }
  validateResult(patternText: string): boolean | null { return validateResult(patternText, this.strictChecksum); }
  findAll(text: string) { return findAll(text, this.strictChecksum); }
  analyze(text: string): RecognizerResult[] { return analyze(text, this.strictChecksum); }
}
