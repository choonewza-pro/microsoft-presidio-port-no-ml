/**
 * SG_UEN - Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/singapore/sg_uen_recognizer.py
 * Checksum validation for UEN format A/B/C (1:1 copy)
 */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "SG_UEN" as const;
export const COUNTRY_CODE = "sg" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.3;

export const PATTERNS = [
  { name: "UEN (low)", regex: "\\b\\d{8}[A-Z]\\b|\\b\\d{9}[A-Z]\\b|\\b[TSR]\\d{2}[A-Z]{2}\\d{4}[A-Z]\\b", score: 0.3 },
] as const;

export const CONTEXT = ["uen", "unique entity number", "business registration", "ACRA"] as const;

export const PATTERN_SOURCE = PATTERNS[0]!.regex;
export const REGEX = new RegExp(PATTERNS[0]!.regex, "gims");

export const REGEXES = PATTERNS.map((p) => ({
  name: p.name,
  regex: new RegExp(p.regex, "gims"),
  score: p.score,
  source: p.regex,
}));

export const UEN_FORMAT_A_WEIGHT = [10, 4, 9, 3, 8, 2, 7, 1] as const;
export const UEN_FORMAT_A_ALPHABET = "XMKECAWLJDB";
export const UEN_FORMAT_B_WEIGHT = [10, 8, 6, 4, 9, 7, 5, 3, 1] as const;
export const UEN_FORMAT_B_ALPHABET = "ZKCMDNERGWH";
export const UEN_FORMAT_C_WEIGHT = [4, 3, 5, 3, 10, 2, 2, 5, 7] as const;
export const UEN_FORMAT_C_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWX0123456789";
export const UEN_FORMAT_C_PREFIX = new Set(["T", "S", "R"]);
export const UEN_FORMAT_C_ENTITY_TYPE = new Set([
  "LP","LL","FC","PF","RF","MQ","MM","NB","CC","CS","MB","FM","GS","DP","CP","NR","CM","CD","MD","HS","VH","CH","MH","CL","XL","CX","HC","RP","TU","TC","FB","FN","PA","PB","SS","MC","SM","GA","GB",
]);

export function validateUenFormatA(uen: string): boolean {
  const checkDigit = uen[uen.length - 1] as string;
  let weightedSum = 0;
  for (let i = 0; i < UEN_FORMAT_A_WEIGHT.length; i++) {
    weightedSum += parseInt(uen[i]!, 10) * UEN_FORMAT_A_WEIGHT[i]!;
  }
  const checksum = UEN_FORMAT_A_ALPHABET[weightedSum % 11] as string;
  return checkDigit === checksum;
}

export function validateUenFormatB(uen: string): boolean {
  const checkDigit = uen[uen.length - 1] as string;
  const yearOfRegistration = parseInt(uen.slice(0, 4), 10);
  const currentYear = new Date().getFullYear();
  if (yearOfRegistration > currentYear) return false;
  let weightedSum = 0;
  for (let i = 0; i < UEN_FORMAT_B_WEIGHT.length; i++) {
    weightedSum += parseInt(uen[i]!, 10) * UEN_FORMAT_B_WEIGHT[i]!;
  }
  const checksum = UEN_FORMAT_B_ALPHABET[weightedSum % 11] as string;
  return checkDigit === checksum;
}

export function validateUenFormatC(uen: string): boolean {
  const checkDigit = uen[uen.length - 1] as string;
  if (!UEN_FORMAT_C_PREFIX.has(uen[0] as string)) return false;
  const entityType = uen.slice(3, 5);
  if (!UEN_FORMAT_C_ENTITY_TYPE.has(entityType)) return false;
  let weightedSum = 0;
  for (let i = 0; i < UEN_FORMAT_C_WEIGHT.length; i++) {
    const ch = uen[i] as string;
    const idx = UEN_FORMAT_C_ALPHABET.indexOf(ch);
    if (idx === -1) return false;
    weightedSum += idx * UEN_FORMAT_C_WEIGHT[i]!;
  }
  const mod = ((weightedSum - 5) % 11 + 11) % 11;
  const checksum = UEN_FORMAT_C_ALPHABET[mod] as string;
  return checkDigit === checksum;
}

export function validateResult(patternText: string): boolean {
  const text = patternText.toUpperCase();
  if (text.length === 9) {
    return validateUenFormatA(text);
  } else if (text.length === 10 && /^[A-Z]/.test(text)) {
    return validateUenFormatC(text);
  } else if (text.length === 10) {
    return validateUenFormatB(text);
  }
  return false;
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
          pattern: p.regex,
          originalScore: p.score,
          validationResult: isValid,
          textualExplanation: `Detected by ${ENTITY_TYPE} using pattern ${p.name}`,
        },
      });
    }
  }
  return results.sort((a, b) => a.start - b.start);
}

export class SgUenRecognizer {
  findAll(t: string) { return findAll(t); }
  analyze(t: string) { return analyze(t); }
  validateResult(t: string) { return validateResult(t); }
}
