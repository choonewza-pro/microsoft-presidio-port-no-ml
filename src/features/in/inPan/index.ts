/**
 * IN_PAN - Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/india/in_pan_recognizer.py
 * PAN is 10 chars: 5 letters +4 digits +1 letter, with 4th char restricted to ABCFGHLJPT (case-insensitive)
 */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "IN_PAN" as const;
export const COUNTRY_CODE = "in" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.5;

export const PATTERNS = [
  { name: "PAN (High)", regex: "\\b([A-Za-z]{3}[AaBbCcFfGgHhJjLlPpTt]{1}[A-Za-z]{1}[0-9]{4}[A-Za-z]{1})\\b", score: 0.5 },
  { name: "PAN (Medium)", regex: "\\b([A-Za-z]{5}[0-9]{4}[A-Za-z]{1})\\b", score: 0.1 },
  { name: "PAN (Low)", regex: "\\b((?=.*?[a-zA-Z])(?=.*?[0-9]{4})[\\w@#$%^?~-]{10})\\b", score: 0.01 },
] as const;

export const CONTEXT = ["permanent account number", "pan"] as const;

export const REGEXES = PATTERNS.map((p) => ({
  name: p.name,
  regex: new RegExp(p.regex, "gims"),
  score: p.score,
  source: p.regex,
}));

export const PATTERN_SOURCE = PATTERNS[0]!.regex;
export const REGEX = new RegExp(PATTERN_SOURCE, "gims");

export function validateResult(patternText: string): boolean {
  const t = patternText.trim();
  // High pattern is strict; Medium is looser. Both are considered valid, but High gets stronger score.
  // If matches High, definitely valid.
  if (new RegExp(`^${PATTERNS[0]!.regex}$`, "ims").test(t)) return true;
  if (new RegExp(`^${PATTERNS[1]!.regex}$`, "ims").test(t)) return true;
  // Low pattern is not validated for strong detection; reject unless medium/high matches
  return false;
}

export function findAll(text: string): Array<{ value: string; start: number; end: number; score: number }> {
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  const seen = new Set<string>();
  for (const p of REGEXES.slice(0, 2)) {
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
  for (const p of REGEXES.slice(0, 2)) {
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

export class InPanRecognizer {
  findAll(t: string) { return findAll(t); }
  analyze(t: string) { return analyze(t); }
  validateResult(t: string) { return validateResult(t); }
}
