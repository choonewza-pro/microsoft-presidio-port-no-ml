/**
 * ABA_ROUTING_NUMBER - Ported from country_specific/us/aba_routing_recognizer.py
 * 2 patterns + checksum [3,7,1...] + replacementPairs
 */
import { sanitizeValue, type ReplacementPair } from "../../../core/sanitize.ts";
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "ABA_ROUTING_NUMBER" as const;
export const COUNTRY_CODE = "us" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.3;

export const PATTERNS = [
  { name: "ABA routing number (weak)", regex: "\\b[0123678]\\d{8}\\b", score: 0.05 },
  { name: "ABA routing number", regex: "\\b[0123678]\\d{3}-\\d{4}-\\d\\b", score: 0.3 },
] as const;

export const CONTEXT = ["aba", "routing", "abarouting", "association", "bankrouting"] as const;

export const DEFAULT_REPLACEMENT_PAIRS: ReplacementPair[] = [["-", ""]];

export const REGEXES = PATTERNS.map((p) => ({
  name: p.name,
  regex: new RegExp(p.regex, "gims"),
  score: p.score,
  source: p.regex,
}));

export const REGEX = new RegExp(PATTERNS[0]!.regex, "gims");

const CHECKSUM_WEIGHTS = [3, 7, 1, 3, 7, 1, 3, 7, 1] as const;

export function abaChecksum(sanitizedValue: string): boolean {
  if (!/^\d{9}$/.test(sanitizedValue)) return false;
  let s = 0;
  for (let idx = 0; idx < CHECKSUM_WEIGHTS.length; idx++) {
    s += parseInt(sanitizedValue[idx]!, 10) * CHECKSUM_WEIGHTS[idx]!;
  }
  return s % 10 === 0;
}

export function validateResult(
  patternText: string,
  replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS,
): boolean {
  const sanitized = sanitizeValue(patternText, replacementPairs);
  return abaChecksum(sanitized);
}

export function invalidateResult(
  patternText: string,
  replacementPairs: ReplacementPair[] = DEFAULT_REPLACEMENT_PAIRS,
): boolean {
  return !validateResult(patternText, replacementPairs);
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
      if (!validateResult(value, replacementPairs)) continue;
      seen.add(key);
      results.push({ value, start, end, score: p.score === BASE_SCORE ? MAX_SCORE : p.score > 0 ? MAX_SCORE : p.score });
      // Mirror pattern_recognizer: valid -> MAX_SCORE; but keep originalScore in explanation
    }
  }
  // Filter already validates, so score is MAX_SCORE for valid
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
      const isValid = validateResult(value, replacementPairs);
      if (!isValid) continue;
      seen.add(key);
      results.push({
        entityType: ENTITY_TYPE,
        start,
        end,
        score: MAX_SCORE,
        value,
        recognitionMetadata: { recognizerName: "AbaRoutingRecognizer" },
        analysisExplanation: {
          recognizer: "AbaRoutingRecognizer",
          patternName: p.name,
          pattern: p.regex,
          originalScore: p.score,
          validationResult: isValid,
          textualExplanation: `Detected by \`AbaRoutingRecognizer\` using pattern \`${p.name}\``,
        },
      });
    }
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class AbaRoutingRecognizer {
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
