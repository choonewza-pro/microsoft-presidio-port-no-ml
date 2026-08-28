/**
 * CA_POSTAL_CODE - Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/canada/ca_postal_code_recognizer.py
 * Strict pattern excluding D,F,I,O,Q,U in any position and W,Z in first position
 */
import { MAX_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "CA_POSTAL_CODE" as const;
export const COUNTRY_CODE = "ca" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.3;

export const PATTERNS = [
  { name: "CA Postal Code (strict, with space)", regex: "\\b[ABCEGHJ-NPRSTVXY]\\d[ABCEGHJ-NPRSTV-Z] \\d[ABCEGHJ-NPRSTV-Z]\\d\\b", score: 0.3 },
  { name: "CA Postal Code (weak, no space)", regex: "\\b[ABCEGHJ-NPRSTVXY]\\d[ABCEGHJ-NPRSTV-Z]\\d[ABCEGHJ-NPRSTV-Z]\\d\\b", score: 0.1 },
] as const;

export const CONTEXT = ["postal code", "postcode", "zip", "canada", "ontario", "quebec", "alberta", "british columbia", "code postal"] as const;

export const REGEXES = PATTERNS.map((p) => ({
  name: p.name,
  regex: new RegExp(p.regex, "gims"),
  score: p.score,
  source: p.regex,
}));

export const PATTERN_SOURCE = PATTERNS[0]!.regex;
export const REGEX = new RegExp(PATTERN_SOURCE, "gims");

export function validateResult(patternText: string): boolean {
  const t = patternText.toUpperCase();
  // Test against either pattern exactly
  return PATTERNS.some((p) => new RegExp(`^${p.regex}$`, "ims").test(t));
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
      // regex already validates; no additional checksum
      seen.add(key);
      results.push({ value, start, end, score: p.score });
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
      seen.add(key);
      results.push({
        entityType: ENTITY_TYPE,
        start,
        end,
        score: p.score,
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

export class CaPostalCodeRecognizer {
  findAll(t: string) { return findAll(t); }
  analyze(t: string) { return analyze(t); }
  validateResult(t: string) { return validateResult(t); }
}
