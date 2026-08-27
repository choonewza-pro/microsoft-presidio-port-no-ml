/**
 * PL_PESEL - Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/poland/pl_pesel_recognizer.py
 * Regex validates encoded DOB + checksum weights [1,3,7,9,1,3,7,9,1,3]
 */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "PL_PESEL" as const;
export const COUNTRY_CODE = "pl" as const;
export const SUPPORTED_LANGUAGE = "pl" as const;
export const BASE_SCORE = 0.4;

export const PATTERNS = [
  { name: "PESEL", regex: "\\b[0-9]{2}([02468][1-9]|[13579][012])(0[1-9]|1[0-9]|2[0-9]|3[01])[0-9]{5}\\b", score: 0.4 },
] as const;

export const CONTEXT = ["pesel"] as const;

export const REGEXES = PATTERNS.map((p) => ({
  name: p.name,
  regex: new RegExp(p.regex, "gims"),
  score: p.score,
  source: p.regex,
}));

export const PATTERN_SOURCE = PATTERNS[0]!.regex;
export const REGEX = new RegExp(PATTERN_SOURCE, "gims");

const WEIGHTS = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3] as const;

export function validateResult(patternText: string): boolean {
  if (patternText.length !== 11 || !/^\d{11}$/.test(patternText)) return false;
  // regex pre-check for DOB encoding
  if (!new RegExp(`^${PATTERNS[0]!.regex.slice(2, -2)}$`).test(patternText)) {
    // slice removes \b ; simpler: test without word boundaries
    if (!/^[0-9]{2}([02468][1-9]|[13579][012])(0[1-9]|1[0-9]|2[0-9]|3[01])[0-9]{5}$/.test(patternText)) return false;
  }
  const digits = patternText.split("").map((c) => parseInt(c, 10));
  let weightedSum = 0;
  for (let i = 0; i < 10; i++) {
    weightedSum += digits[i]! * WEIGHTS[i]!;
  }
  const check = (10 - (weightedSum % 10)) % 10;
  return check === digits[10];
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
      results.push({ value, start, end, score: MAX_SCORE });
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
      results.push({
        entityType: ENTITY_TYPE,
        start,
        end,
        score: MAX_SCORE,
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

export class PlPeselRecognizer {
  findAll(t: string) { return findAll(t); }
  analyze(t: string) { return analyze(t); }
  validateResult(t: string) { return validateResult(t); }
}
