/**
 * FI_PERSONAL_IDENTITY_CODE - Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/finland/fi_personal_identity_code_recognizer.py
 * Control character = valid_chars[ int(DDMMYY+NNN) %31 ] + century/date validation
 */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "FI_PERSONAL_IDENTITY_CODE" as const;
export const COUNTRY_CODE = "fi" as const;
export const SUPPORTED_LANGUAGE = "fi" as const;
export const BASE_SCORE = 0.5;

export const PATTERNS = [
  { name: "Finnish Personal Identity Code (Medium)", regex: "\\b(\\d{6})([-+ABCDEFYXWVU])(\\d{3})([0123456789ABCDEFHJKLMNPRSTUVWXY])\\b", score: 0.5 },
  { name: "Finnish Personal Identity Code (Very Weak)", regex: "(\\d{6})([-+ABCDEFYXWVU])(\\d{3})([0123456789ABCDEFHJKLMNPRSTUVWXY])", score: 0.1 },
] as const;

export const CONTEXT = ["hetu", "henkilötunnus", "personbeteckningen", "personal identity code"] as const;

export const REGEXES = PATTERNS.map((p) => ({
  name: p.name,
  regex: new RegExp(p.regex, "gims"),
  score: p.score,
  source: p.regex,
}));

export const PATTERN_SOURCE = PATTERNS[0]!.regex;
export const REGEX = new RegExp(PATTERN_SOURCE, "gims");

const VALID_CONTROL = "0123456789ABCDEFHJKLMNPRSTUVWXY";
const CENTURY_BY_SEPARATOR: Record<string, number> = {
  "+": 1800,
  "-": 1900, "Y": 1900, "X": 1900, "W": 1900, "V": 1900, "U": 1900,
  "A": 2000, "B": 2000, "C": 2000, "D": 2000, "E": 2000, "F": 2000,
};

function isValidDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

export function validateResult(patternText: string): boolean {
  if (patternText.length !== 11) return false;
  const datePart = patternText.slice(0, 6);
  const sep = patternText[6] ?? "";
  const individual = patternText.slice(7, 10);
  const control = patternText[10]?.toUpperCase() ?? "";
  if (!/^\d{6}$/.test(datePart)) return false;
  if (!/^[+\-ABCDEFYXWVU]$/.test(sep)) return false;
  if (!/^\d{3}$/.test(individual)) return false;
  if (!/^[0123456789ABCDEFHJKLMNPRSTUVWXY]$/i.test(control)) return false;

  const century = CENTURY_BY_SEPARATOR[sep] ?? 2000;
  const day = parseInt(datePart.slice(0, 2), 10);
  const month = parseInt(datePart.slice(2, 4), 10);
  const year2 = parseInt(datePart.slice(4, 6), 10);
  const fullYear = century + year2;
  if (!isValidDate(fullYear, month, day)) return false;

  const numberToCheck = parseInt(datePart + individual, 10);
  const expected = VALID_CONTROL[numberToCheck % 31]!;
  return expected === control.toUpperCase();
}

export function findAll(text: string): Array<{ value: string; start: number; end: number; score: number }> {
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  const seen = new Set<string>();
  // only use Medium pattern with boundaries for findAll to avoid overlapping false positives; but include both and deduplicate
  for (const p of REGEXES) {
    // skip Very Weak if it is subset of Medium already handled - but we validate anyway
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
  // deduplicate overlapping and prefer higher score
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

export class FiPersonalIdentityCodeRecognizer {
  findAll(t: string) { return findAll(t); }
  analyze(t: string) { return analyze(t); }
  validateResult(t: string) { return validateResult(t); }
}
