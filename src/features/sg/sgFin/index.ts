/**
 * SG_NRIC_FIN - Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/singapore/sg_fin_recognizer.py
 * Strict NRIC/FIN checksum (weights 2,7,6,5,4,3,2 + offset + letter tables)
 * Reference: https://en.wikipedia.org/wiki/National_Registration_Identity_Card + Datadog RS implementation
 */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "SG_NRIC_FIN" as const;
export const COUNTRY_CODE = "sg" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.5;

export const PATTERNS = [
  { name: "Nric (weak)", regex: "\\b[A-Z][0-9]{7}[A-Z]\\b", score: 0.3 },
  { name: "Nric (medium)", regex: "\\b[STFGM][0-9]{7}[A-Z]\\b", score: 0.5 },
] as const;

export const CONTEXT = ["fin", "fin#", "nric", "nric#"] as const;

export const REGEXES = PATTERNS.map((p) => ({
  name: p.name,
  regex: new RegExp(p.regex, "gims"),
  score: p.score,
  source: p.regex,
}));

export const PATTERN_SOURCE = PATTERNS[1]!.regex;
export const REGEX = new RegExp(PATTERN_SOURCE, "gims");

const WEIGHTS = [2, 7, 6, 5, 4, 3, 2] as const;
const ST_TABLE = ["J", "Z", "I", "H", "G", "F", "E", "D", "C", "B", "A"] as const;
const FG_TABLE = ["X", "W", "U", "T", "R", "Q", "P", "N", "M", "L", "K"] as const;
// M series uses different check-digit derivation (10 - remainder)
const M_TABLE = ["K", "L", "J", "N", "P", "Q", "R", "T", "U", "W", "X"] as const;

export function validateResult(patternText: string): boolean {
  const text = patternText.toUpperCase().trim();
  if (!/^[STFGM][0-9]{7}[A-Z]$/.test(text)) return false;
  const prefix = text[0] as string;
  const digits = text.slice(1, 8);
  const check = text[8] as string;
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += parseInt(digits[i]!, 10) * WEIGHTS[i]!;
  }
  let offset = 0;
  if (prefix === "T" || prefix === "G") offset = 4;
  else if (prefix === "M") offset = 3;
  // F and S remain 0
  sum += offset;
  const remainder = sum % 11;
  let expected: string;
  if (prefix === "S" || prefix === "T") {
    expected = ST_TABLE[remainder]!;
  } else if (prefix === "F" || prefix === "G") {
    expected = FG_TABLE[remainder]!;
  } else {
    // M series: check digit = 10 - remainder
    const checkDigit = 10 - remainder;
    // SAP KBA: checkDigit = 11 - (remainder + 1) == 10 - remainder
    // Clamp 11 -> 0? but remainder 0..10 => checkDigit 10..0, always 0..10
    const idx = checkDigit < 0 ? 0 : checkDigit > 10 ? 10 : checkDigit;
    expected = M_TABLE[idx]!;
  }
  return check === expected;
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
      const isValid = validateResult(value);
      if (!isValid) continue;
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
      const isValid = validateResult(value);
      if (!isValid) continue;
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
          pattern: p.regex.source,
          originalScore: p.score,
          validationResult: isValid,
          textualExplanation: `Detected by ${ENTITY_TYPE} using pattern ${p.name}`,
        },
      });
    }
  }
  return results.sort((a, b) => a.start - b.start);
}

export class SgNricFinRecognizer {
  findAll(t: string) { return findAll(t); }
  analyze(t: string) { return analyze(t); }
  validateResult(t: string) { return validateResult(t); }
}
