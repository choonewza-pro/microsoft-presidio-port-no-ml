/**
 * IN_GSTIN - Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/india/in_gstin_recognizer.py
 * 15 chars: state 01-37 + PAN + regNo + Z + checksum + PAN format validation
 */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "IN_GSTIN" as const;
export const COUNTRY_CODE = "in" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.8;

export const PATTERNS = [
  { name: "GSTIN (High)", regex: "\\b((?:0[1-9]|[1-3][0-7])[A-Za-z0-9]{10}[A-Za-z0-9]{1}Z[A-Za-z0-9]{1})\\b", score: 0.8 },
  { name: "GSTIN (Medium)", regex: "\\b((?:0[1-9]|[1-3][0-7])[A-Za-z0-9]{11}Z[A-Za-z0-9]{1})\\b", score: 0.4 },
  { name: "GSTIN (Low)", regex: "\\b([0-9]{2}[A-Za-z0-9]{11}Z[A-Za-z0-9]{1})\\b", score: 0.1 },
] as const;

export const CONTEXT = ["gstin", "gst", "goods and services tax", "tax identification", "gst number", "gst registration"] as const;

export const REPLACEMENT_PAIRS: Array<[string, string]> = [["-", ""], [" ", ""]];

export const REGEXES = PATTERNS.map((p) => ({
  name: p.name,
  regex: new RegExp(p.regex, "gims"),
  score: p.score,
  source: p.regex,
}));

export const PATTERN_SOURCE = PATTERNS[0]!.regex;
export const REGEX = new RegExp(PATTERN_SOURCE, "gims");

export function sanitizeValue(text: string, replacementPairs: Array<[string, string]> = REPLACEMENT_PAIRS): string {
  // Try to extract GSTIN pattern uppercased
  const gstinPattern = /(?:0[1-9]|[1-3][0-7])[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[0-9A-Za-z]{1}Z[0-9A-Za-z]{1}/;
  const m = gstinPattern.exec(text.toUpperCase());
  if (m && m[0]) return m[0];
  let sanitized = text.toUpperCase();
  for (const [old, nw] of replacementPairs) sanitized = sanitized.split(old).join(nw);
  return sanitized;
}

export function validatePanFormat(pan: string): boolean {
  if (pan.length !== 10) return false;
  const firstFive = pan.slice(0, 5);
  const letterCount = [...firstFive].filter((c) => /[A-Za-z]/.test(c)).length;
  if (letterCount < 3) return false;
  if (!/^\d{4}$/.test(pan.slice(5, 9))) return false;
  if (!/^[A-Za-z]$/.test(pan[9]!)) return false;
  return true;
}

export function validateGstin(gstin: string): boolean {
  if (gstin.length !== 15) return false;
  const stateCode = gstin.slice(0, 2);
  if (!/^\d{2}$/.test(stateCode)) return false;
  const sc = parseInt(stateCode, 10);
  if (sc < 1 || sc > 37) return false;
  const panPart = gstin.slice(2, 12);
  if (!validatePanFormat(panPart)) return false;
  const regNumber = gstin[12]!;
  if (!/[A-Za-z0-9]/.test(regNumber)) return false;
  if (gstin[13] !== "Z") return false;
  const checksum = gstin[14]!;
  if (!/[A-Za-z0-9]/.test(checksum)) return false;
  return true;
}

export function validateResult(patternText: string): boolean {
  const sanitized = sanitizeValue(patternText);
  return validateGstin(sanitized);
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
      const score = p.score >= 0.8 ? MAX_SCORE : p.score;
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
      const score = p.score >= 0.8 ? MAX_SCORE : p.score;
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
          pattern: p.regex,
          originalScore: p.score,
          validationResult: true,
          textualExplanation: `Detected by ${ENTITY_TYPE} using pattern ${p.name}`,
        },
      });
    }
  }
  return results.sort((a, b) => a.start - b.start);
}

export class InGstinRecognizer {
  replacementPairs = REPLACEMENT_PAIRS;
  findAll(t: string) { return findAll(t); }
  analyze(t: string) { return analyze(t); }
  validateResult(t: string) { return validateResult(t); }
  sanitizeValue(t: string) { return sanitizeValue(t, this.replacementPairs); }
  validateGstin(t: string) { return validateGstin(t); }
  validatePanFormat(t: string) { return validatePanFormat(t); }
}
