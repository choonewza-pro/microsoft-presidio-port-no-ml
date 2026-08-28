/**
 * CA_SIN - Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/canada/ca_sin_recognizer.py
 * Strict Luhn checksum + first digit 1-7,9 (not 0/8) + delimiter consistency
 */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "CA_SIN" as const;
export const COUNTRY_CODE = "ca" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.5;

export const PATTERNS = [
  { name: "SIN (weak)", regex: "\\b[1-79]\\d{8}\\b", score: 0.05 },
  { name: "SIN (medium)", regex: "\\b[1-79]\\d{2}([- ])\\d{3}\\1\\d{3}\\b", score: 0.5 },
] as const;

export const CONTEXT = ["sin", "sin number", "social insurance", "social insurance number", "canada", "nas", "numéro nas", "numéro d'assurance sociale", "assurance sociale"] as const;

export const REGEXES = PATTERNS.map((p) => ({
  name: p.name,
  regex: new RegExp(p.regex, "gims"),
  score: p.score,
  source: p.regex,
}));

export const PATTERN_SOURCE = PATTERNS[1]!.regex;
export const REGEX = new RegExp(PATTERN_SOURCE, "gims");

export function luhnValid(digits: string): boolean {
  let total = 0;
  const reversed = digits.split("").reverse();
  for (let i = 0; i < reversed.length; i++) {
    let n = parseInt(reversed[i]!, 10);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    total += n;
  }
  return total % 10 === 0;
}

export function validateResult(patternText: string): boolean {
  const onlyDigits = patternText.replace(/\D/g, "");
  if (onlyDigits.length !== 9) return false;
  if (!/^[1-79]\d{8}$/.test(onlyDigits)) return false;
  // All same digit would fail Luhn except maybe 000... but covered
  return luhnValid(onlyDigits);
}

export function invalidateResult(patternText: string): boolean {
  return !validateResult(patternText);
}

export function findAll(text: string): Array<{ value: string; start: number; end: number; score: number }> {
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
      if (!validateResult(value)) continue;
      seen.add(key);
      const score = p.score === 0.5 ? MAX_SCORE : p.score;
      results.push({ value, start, end, score });
    }
  }
  return results.sort((a, b) => a.start - b.start);
}

export function analyze(text: string): RecognizerResult[] {
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
      if (!validateResult(value)) continue;
      seen.add(key);
      const score = p.score === 0.5 ? MAX_SCORE : p.score;
      results.push({
        entityType: ENTITY_TYPE,
        start,
        end,
        score,
        value,
        recognitionMetadata: { recognizerName: ENTITY_TYPE },
        analysisExplanation: {
          recognizer: ENTITY_TYPE,
          patternName: p.name,
          pattern: p.regex.source,
          originalScore: p.score,
          validationResult: true,
          textualExplanation: `Detected by ${ENTITY_TYPE} using pattern ${p.name}`,
        },
      });
    }
  }
  return results.sort((a, b) => a.start - b.start);
}

export class CaSinRecognizer {
  findAll(t: string) { return findAll(t); }
  analyze(t: string) { return analyze(t); }
  validateResult(t: string) { return validateResult(t); }
  invalidateResult(t: string) { return invalidateResult(t); }
}
