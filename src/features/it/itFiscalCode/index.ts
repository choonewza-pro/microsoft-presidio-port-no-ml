/**
 * Italy Fiscal Code Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/italy/it_fiscal_code_recognizer.py
 * Validation odd/even map + mod26 (True if matches, None otherwise)
 */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "IT_FISCAL_CODE" as const;
export const COUNTRY_CODE = "it" as const;
export const SUPPORTED_LANGUAGE = "it" as const;
export const BASE_SCORE = 0.3;

// Original Python PATTERNS[0] is ((?:[A-Z][AEIOU][AEIOUX]|[AEIOU]X{2}|[B-DF-HJ-NP-TV-Z]{2}[A-Z]){2}...) -> strip  and use flag i
export const PATTERN_SOURCE =
  "((?:[A-Z][AEIOU][AEIOUX]|[AEIOU]X{2}|[B-DF-HJ-NP-TV-Z]{2}[A-Z]){2}" +
  "(?:[\\dLMNP-V]{2}(?:[A-EHLMPR-T](?:[04LQ][1-9MNP-V]|[15MR][\\dLMNP-V]|[26NS][0-8LMNP-U])|[DHPS][37PT][0L]|[ACELMRT][37PT][01LM]|[AC-EHLMPR-T][26NS][9V])|(?:[02468LNQSU][048LQU]|[13579MPRTV][26NS])B[26NS][9V])(?:[A-MZ][1-9MNP-V][\\dLMNP-V]{2}|[A-M][0L](?:[1-9MNP-V][\\dLMNP-V]|[0L][1-9MNP-V]))[A-Z])";

export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "gi");
export const REGEX_SINGLE = new RegExp(`^${PATTERN_SOURCE}$`, "i");
export const PATTERNS = [{ name: "Fiscal Code", regex: PATTERN_SOURCE, score: BASE_SCORE }];

export const CONTEXT: readonly string[] = ["codice fiscale", "cf"] as const;

const MAP_ODD: Record<string, number> = {
  "0": 1, "1": 0, "2": 5, "3": 7, "4": 9, "5": 13, "6": 15, "7": 17, "8": 19, "9": 21,
  A: 1, B: 0, C: 5, D: 7, E: 9, F: 13, G: 15, H: 17, I: 19, J: 21, K: 2, L: 4, M: 18, N: 20, O: 11, P: 3, Q: 6, R: 8, S: 12, T: 14, U: 16, V: 10, W: 22, X: 25, Y: 24, Z: 23,
};
const MAP_EVEN: Record<string, number> = {
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
  A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, J: 9, K: 10, L: 11, M: 12, N: 13, O: 14, P: 15, Q: 16, R: 17, S: 18, T: 19, U: 20, V: 21, W: 22, X: 23, Y: 24, Z: 25,
};
const MAP_MOD: Record<number, string> = {
  0: "A", 1: "B", 2: "C", 3: "D", 4: "E", 5: "F", 6: "G", 7: "H", 8: "I", 9: "J", 10: "K", 11: "L", 12: "M", 13: "N", 14: "O", 15: "P", 16: "Q", 17: "R", 18: "S", 19: "T", 20: "U", 21: "V", 22: "W", 23: "X", 24: "Y", 25: "Z",
};

export function validateResult(patternText: string): boolean | null {
  const text = patternText.toUpperCase();
  if (text.length < 2) return null;
  const control = text[text.length - 1]!;
  const toValidate = text.slice(0, -1);
  let oddSum = 0;
  let evenSum = 0;
  for (let i = 0; i < toValidate.length; i++) {
    const c = toValidate[i]!;
    if (i % 2 === 0) oddSum += MAP_ODD[c] ?? 0;
    else evenSum += MAP_EVEN[c] ?? 0;
  }
  const check = MAP_MOD[(oddSum + evenSum) % 26]!;
  return check === control ? true : null;
}

export function findAll(text: string): Array<{ value: string; start: number; end: number; score: number }> {
  const re = new RegExp(REGEX.source, REGEX.flags);
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  for (const m of text.matchAll(re)) {
    const value = m[0];
    const start = m.index ?? 0;
    const end = start + value.length;
    if (!value) continue;
    const vr = validateResult(value);
    if (vr === false) continue;
    const score = vr === true ? MAX_SCORE : BASE_SCORE;
    if (score <= MIN_SCORE) continue;
    results.push({ value, start, end, score });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export function analyze(text: string): RecognizerResult[] {
  const re = new RegExp(REGEX.source, REGEX.flags);
  const results: RecognizerResult[] = [];
  for (const m of text.matchAll(re)) {
    const value = m[0];
    const start = m.index ?? 0;
    const end = start + value.length;
    if (!value) continue;
    const vr = validateResult(value);
    if (vr === false) continue;
    const score = vr === true ? MAX_SCORE : BASE_SCORE;
    results.push({
      entityType: ENTITY_TYPE,
      start, end, score, value,
      recognitionMetadata: { recognizerName: "ItFiscalCodeRecognizer" },
      analysisExplanation: {
        recognizer: "ItFiscalCodeRecognizer",
        patternName: "Fiscal Code",
        pattern: REGEX.source,
        originalScore: BASE_SCORE,
        validationResult: vr,
        textualExplanation: "Detected by `ItFiscalCodeRecognizer` using pattern `Fiscal Code`",
      },
    });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class ItFiscalCodeRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "ItFiscalCodeRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  validateResult(patternText: string): boolean | null { return validateResult(patternText); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string): RecognizerResult[] { return analyze(text); }
}
