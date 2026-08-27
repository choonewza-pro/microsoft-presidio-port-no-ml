/**
 * US_SSN - Ported from country_specific/us/us_ssn_recognizer.py
 *
 * Patterns 5, CONTEXT, invalidateResult with delimiter check, all-same, group 00/0000, 000/666, sample
 */
import { sanitizeValue, type ReplacementPair } from "../../../core/sanitize.ts";
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "US_SSN" as const;
export const COUNTRY_CODE = "us" as const;
export const SUPPORTED_LANGUAGE = "en" as const;

/** Base score for strongest pattern (medium) - others are 0.05 */
export const BASE_SCORE = 0.5;

export const PATTERNS = [
  { name: "SSN1 (very weak)", regex: "\\b([0-9]{5})-([0-9]{4})\\b", score: 0.05 },
  { name: "SSN2 (very weak)", regex: "\\b([0-9]{3})-([0-9]{6})\\b", score: 0.05 },
  { name: "SSN3 (very weak)", regex: "\\b(([0-9]{3})-([0-9]{2})-([0-9]{4}))\\b", score: 0.05 },
  { name: "SSN4 (very weak)", regex: "\\b[0-9]{9}\\b", score: 0.05 },
  { name: "SSN5 (medium)", regex: "\\b([0-9]{3})[- .]([0-9]{2})[- .]([0-9]{4})\\b", score: 0.5 },
] as const;

export const CONTEXT = ["social", "security", "ssn", "ssns", "ssid"] as const;

export const REGEXES = PATTERNS.map((p) => ({
  name: p.name,
  regex: new RegExp(p.regex, "gims"),
  score: p.score,
  source: p.regex,
}));

/** Combined union regex - mainly for documentation; findAll uses individual patterns */
export const REGEX = new RegExp(PATTERNS[4]!.regex, "gims");

/**
 * invalidateResult - ported 1:1 from us_ssn_recognizer.py:55 invalidate_result
 * Returns true if invalidated (should be filtered out)
 */
export function invalidateResult(
  patternText: string,
  _replacementPairs: ReplacementPair[] = [],
): boolean {
  // delimiter check: mixed delimiters invalidate
  const delimiterCounts = new Map<string, number>();
  for (const c of patternText) {
    if (c === "." || c === "-" || c === " ") {
      delimiterCounts.set(c, (delimiterCounts.get(c) ?? 0) + 1);
    }
  }
  if (delimiterCounts.size > 1) return true;

  const onlyDigits = patternText.replace(/\D/g, "");
  if (onlyDigits.length === 0) return true;
  if ([...onlyDigits].every((c) => c === onlyDigits[0])) return true;
  if (onlyDigits.slice(3, 5) === "00" || onlyDigits.slice(5) === "0000") return true;
  if (onlyDigits.slice(0, 3) === "000" || onlyDigits.slice(0, 3) === "666") return true;
  if (onlyDigits === "123456789" || onlyDigits === "987654320" || onlyDigits === "078051120") return true;
  return false;
}

/** validateResult is inverse of invalidateResult */
export function validateResult(
  patternText: string,
  replacementPairs: ReplacementPair[] = [],
): boolean {
  // sanitize not strictly needed but keep signature consistent; validation uses raw delimiters check
  // Use sanitizeValue to handle replacementPairs if caller passes them, but delimiter logic needs original
  void sanitizeValue(patternText, replacementPairs);
  return !invalidateResult(patternText, replacementPairs);
}

export function findAll(
  text: string,
  replacementPairs: ReplacementPair[] = [],
): Array<{ value: string; start: number; end: number; score: number }> {
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  const seen = new Set<string>();
  for (const p of REGEXES) {
    const re = new RegExp(p.regex, "gims");
    for (const m of text.matchAll(re)) {
      const value = m[0];
      const start = m.index ?? 0;
      const end = start + value.length;
      if (!value) continue;
      const key = `${start}-${end}`;
      if (seen.has(key)) continue;
      if (invalidateResult(value, replacementPairs)) continue;
      const score = p.score === BASE_SCORE ? MAX_SCORE : p.score;
      // Medium pattern maps to 1.0 after validation (MAX_SCORE), weak stays as-is but still returned
      // For consistency with PatternRecognizer: if invalidated score=0 filtered, else use pattern score or MAX if medium
      // Here we use MAX_SCORE for medium pattern, pattern score for others
      results.push({ value, start, end, score });
      seen.add(key);
    }
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export function analyze(
  text: string,
  replacementPairs: ReplacementPair[] = [],
): RecognizerResult[] {
  return findAll(text, replacementPairs).map(({ value, start, end, score }) => {
    // determine pattern name
    let patternName = "SSN5 (medium)";
    let patternSource = PATTERNS[4]!.regex;
    for (const p of PATTERNS) {
      const re = new RegExp(`^${p.regex}$`, "ims");
      if (re.test(value)) { patternName = p.name; patternSource = p.regex; break; }
    }
    return {
      entityType: ENTITY_TYPE,
      start,
      end,
      score,
      value,
      recognitionMetadata: { recognizerName: "UsSsnRecognizer" },
      analysisExplanation: {
        recognizer: "UsSsnRecognizer",
        patternName,
        pattern: patternSource,
        originalScore: score,
        validationResult: true,
        textualExplanation: `Detected by \`UsSsnRecognizer\` using pattern \`${patternName}\``,
      },
    };
  });
}

export class UsSsnRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  replacementPairs: ReplacementPair[];
  constructor(replacementPairs: ReplacementPair[] = []) { this.replacementPairs = replacementPairs; }
  invalidateResult(text: string) { return invalidateResult(text, this.replacementPairs); }
  validateResult(text: string) { return validateResult(text, this.replacementPairs); }
  findAll(text: string) { return findAll(text, this.replacementPairs); }
  analyze(text: string) { return analyze(text, this.replacementPairs); }
}
