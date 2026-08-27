/**
 * Italy VAT Code Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/italy/it_vat_code.py
 * 11 digits checksum: x sum even positions, y sum doubled odds, t=(x+y)%10, c=(10-t)%10 == last digit
 */
import { sanitizeValue } from "../../../core/sanitize.ts";
import type { ReplacementPair } from "../../../core/sanitize.ts";
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "IT_VAT_CODE" as const;
export const COUNTRY_CODE = "it" as const;
export const SUPPORTED_LANGUAGE = "it" as const;
export const BASE_SCORE = 0.1;
export const REPLACEMENT_PAIRS: ReplacementPair[] = [["-", ""], [" ", ""], ["_", ""]];

export const PATTERN_SOURCE = "([0-9][ _]?){11}";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "g");
export const PATTERNS = [{ name: "IT Vat code (piva)", regex: PATTERN_SOURCE, score: BASE_SCORE }];

export const CONTEXT: readonly string[] = ["piva", "partita iva", "pi"] as const;

export function validateResult(patternText: string, replacementPairs: ReplacementPair[] = REPLACEMENT_PAIRS): boolean {
  const text = sanitizeValue(patternText, replacementPairs);
  if (!/^\d{11}$/.test(text)) return false;
  if (text === "00000000000") return false;
  let x = 0;
  let y = 0;
  for (let i = 0; i < 5; i++) {
    x += parseInt(text[2 * i]!, 10);
    let tmp = parseInt(text[2 * i + 1]!, 10) * 2;
    if (tmp > 9) tmp -= 9;
    y += tmp;
  }
  const t = (x + y) % 10;
  const c = (10 - t) % 10;
  return c === parseInt(text[10]!, 10);
}

export function findAll(text: string, replacementPairs: ReplacementPair[] = REPLACEMENT_PAIRS): Array<{ value: string; start: number; end: number; score: number }> {
  const re = new RegExp(REGEX.source, REGEX.flags);
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  for (const m of text.matchAll(re)) {
    const value = m[0];
    const start = m.index ?? 0;
    const end = start + value.length;
    if (!value) continue;
    // trim? regex includes trailing space via [ _]? need to ensure sanitized length 11; filter whitespace-only matches
    const trimmed = value.trim();
    if (!trimmed) continue;
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
    if (!value?.trim()) continue;
    const validationResult = validateResult(value, replacementPairs);
    const score = validationResult ? MAX_SCORE : MIN_SCORE;
    if (score <= MIN_SCORE) continue;
    results.push({
      entityType: ENTITY_TYPE,
      start, end, score, value,
      recognitionMetadata: { recognizerName: "ItVatCodeRecognizer" },
      analysisExplanation: {
        recognizer: "ItVatCodeRecognizer",
        patternName: "IT Vat code (piva)",
        pattern: REGEX.source,
        originalScore: BASE_SCORE,
        validationResult,
        textualExplanation: "Detected by `ItVatCodeRecognizer` using pattern `IT Vat code (piva)`",
      },
    });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class ItVatCodeRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "ItVatCodeRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  replacementPairs: ReplacementPair[];
  constructor(replacementPairs: ReplacementPair[] = REPLACEMENT_PAIRS) { this.replacementPairs = replacementPairs; }
  validateResult(patternText: string): boolean { return validateResult(patternText, this.replacementPairs); }
  findAll(text: string) { return findAll(text, this.replacementPairs); }
  analyze(text: string): RecognizerResult[] { return analyze(text, this.replacementPairs); }
}
