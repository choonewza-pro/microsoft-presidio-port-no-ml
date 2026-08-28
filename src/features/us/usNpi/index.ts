/**
 * US_NPI - Ported from country_specific/us/us_npi_recognizer.py
 * NPI 10 digits Luhn with 80840 prefix, replacementPairs, invalidate degenerate
 */
import { sanitizeValue, type ReplacementPair } from "../../../core/sanitize.ts";
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "US_NPI" as const;
export const COUNTRY_CODE = "us" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.4;

export const PATTERNS = [
  { name: "NPI (weak)", regex: "\\b[12]\\d{9}\\b", score: 0.1 },
  { name: "NPI (medium)", regex: "\\b[12]\\d{3}[ -]\\d{3}[ -]\\d{3}\\b", score: 0.4 },
] as const;

export const CONTEXT = ["npi", "national provider", "provider", "npi number", "provider id", "provider identifier", "taxonomy"] as const;

export const DEFAULT_REPLACEMENT_PAIRS: ReplacementPair[] = [["-", ""], [" ", ""]];

export const REGEXES = PATTERNS.map((p) => ({
  name: p.name,
  regex: new RegExp(p.regex, "gims"),
  score: p.score,
  source: p.regex,
}));

export const REGEX = new RegExp(PATTERNS[0]!.regex, "gims");

export function npiLuhnChecksum(sanitizedValue: string): boolean {
  const prefixed = "80840" + sanitizedValue;
  const digits = [...prefixed].map((d) => parseInt(d, 10));
  let checksum = 0;
  const reversed = [...digits].reverse();
  for (let i = 0; i < reversed.length; i++) {
    const d = reversed[i]!;
    if (i % 2 === 1) {
      const doubled = d * 2;
      checksum += doubled > 9 ? doubled - 9 : doubled;
    } else {
      checksum += d;
    }
  }
  return checksum % 10 === 0;
}

export function validateResult(
  patternText: string,
  replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS,
): boolean {
  const sanitized = sanitizeValue(patternText, replacementPairs);
  if (!/^\d{10}$/.test(sanitized)) return false;
  if (!/^[12]/.test(sanitized)) return false;
  return npiLuhnChecksum(sanitized);
}

export function invalidateResult(
  patternText: string,
  replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS,
): boolean {
  const sanitized = sanitizeValue(patternText, replacementPairs);
  if (sanitized) {
    const body = sanitized.length > 1 ? sanitized.slice(0, -1) : sanitized;
    if (body && new Set(body).size === 1) return true;
  }
  return false;
}

export function findAll(
  text: string,
  replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS,
): Array<{ value: string; start: number; end: number; score: number }> {
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  const seen = new Set<string>();
  for (const p of REGEXES) {
    const re = new RegExp(p.regex, "gims");
    for (const m of text.matchAll(re)) {
      const value = m[0];
      if (!value) continue;
      const start = m.index ?? 0;
      const end = start + value.length;
      const key = `${start}-${end}`;
      if (seen.has(key)) continue;
      if (invalidateResult(value, replacementPairs)) continue;
      if (!validateResult(value, replacementPairs)) continue;
      seen.add(key);
      results.push({ value, start, end, score: MAX_SCORE });
    }
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export function analyze(
  text: string,
  replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS,
): RecognizerResult[] {
  const results: RecognizerResult[] = [];
  const seen = new Set<string>();
  for (const p of REGEXES) {
    const re = new RegExp(p.regex, "gims");
    for (const m of text.matchAll(re)) {
      const value = m[0];
      if (!value) continue;
      const start = m.index ?? 0;
      const end = start + value.length;
      const key = `${start}-${end}`;
      if (seen.has(key)) continue;
      if (invalidateResult(value, replacementPairs)) continue;
      const isValid = validateResult(value, replacementPairs);
      if (!isValid) continue;
      seen.add(key);
      results.push({
        entityType: ENTITY_TYPE,
        start,
        end,
        score: MAX_SCORE,
        value,
        recognitionMetadata: { recognizerName: "UsNpiRecognizer" },
        analysisExplanation: {
          recognizer: "UsNpiRecognizer",
          patternName: p.name,
          pattern: p.regex.source,
          originalScore: p.score,
          validationResult: isValid,
          textualExplanation: `Detected by \`UsNpiRecognizer\` using pattern \`${p.name}\``,
        },
      });
    }
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class UsNpiRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  replacementPairs: ReplacementPair[];
  constructor(replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS) {
    this.replacementPairs = replacementPairs;
  }
  validateResult(t: string) { return validateResult(t, this.replacementPairs); }
  invalidateResult(t: string) { return invalidateResult(t, this.replacementPairs); }
  findAll(text: string) { return findAll(text, this.replacementPairs); }
  analyze(text: string) { return analyze(text, this.replacementPairs); }
}
