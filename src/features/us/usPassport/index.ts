/**
 * US_PASSPORT - Ported from country_specific/us/us_passport_recognizer.py
 * 2 patterns
 */
import type { ReplacementPair } from "../../../core/sanitize.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "US_PASSPORT" as const;
export const COUNTRY_CODE = "us" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.1;

export const PATTERNS = [
  { name: "Passport (very weak)", regex: "\\b[0-9]{9}\\b", score: 0.05 },
  { name: "Passport Next Generation (very weak)", regex: "\\b[A-Z][0-9]{8}\\b", score: 0.1 },
] as const;

export const CONTEXT = ["us", "united", "states", "passport", "passport#", "travel", "document"] as const;

export const REGEXES = PATTERNS.map((p) => ({
  name: p.name,
  regex: new RegExp(p.regex, "gims"),
  score: p.score,
  source: p.regex,
}));

export const REGEX = new RegExp(PATTERNS[1]!.regex, "gims");
export const PASSPORT_REGEX = REGEX;

export function validateResult(_patternText: string, _replacementPairs: ReplacementPair[] = []): boolean {
  return true;
}
export function invalidateResult(_patternText: string, _replacementPairs: ReplacementPair[] = []): boolean {
  return false;
}

export function findAll(
  text: string,
  _replacementPairs: ReplacementPair[] = [],
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
      seen.add(key);
      results.push({ value, start, end, score: p.score });
    }
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export function analyze(
  text: string,
  replacementPairs: ReplacementPair[] = [],
): RecognizerResult[] {
  return findAll(text, replacementPairs).map(({ value, start, end, score }) => {
    let patternName: string = PATTERNS[0]!.name;
    let patternSource: string = PATTERNS[0]!.regex;
    for (const p of PATTERNS) {
      const re = new RegExp(`^(?:${p.regex})$`, "ims");
      if (re.test(value)) { patternName = p.name; patternSource = p.regex; break; }
    }
    return {
      entityType: ENTITY_TYPE,
      start,
      end,
      score,
      value,
      recognitionMetadata: { recognizerName: "UsPassportRecognizer" },
      analysisExplanation: {
        recognizer: "UsPassportRecognizer",
        patternName,
        pattern: patternSource,
        originalScore: score,
        validationResult: null,
        textualExplanation: `Detected by \`UsPassportRecognizer\` using pattern \`${patternName}\``,
      },
    };
  });
}

export class UsPassportRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  replacementPairs: ReplacementPair[];
  constructor(replacementPairs: ReplacementPair[] = []) { this.replacementPairs = replacementPairs; }
  validateResult(t: string) { return validateResult(t, this.replacementPairs); }
  invalidateResult(t: string) { return invalidateResult(t, this.replacementPairs); }
  findAll(text: string) { return findAll(text, this.replacementPairs); }
  analyze(text: string) { return analyze(text, this.replacementPairs); }
}
