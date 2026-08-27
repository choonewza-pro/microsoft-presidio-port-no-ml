/**
 * US_DRIVER_LICENSE - Ported from country_specific/us/us_driver_license_recognizer.py
 * Approx - just patterns weak/strong, can simplify
 * Original PATTERNS contain a very large alternation for alphanumeric formats.
 * We port 1:1 with a fix for typo "[A-Z]{2}" (was "A-Z]{2}").
 */
import type { ReplacementPair } from "../../../core/sanitize.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "US_DRIVER_LICENSE" as const;
export const COUNTRY_CODE = "us" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.3;

// Fixed original regex: changed "A-Z]{2}" -> "[A-Z]{2}" to make valid regex
const ALPHANUM_SOURCE =
  "([A-Z][0-9]{3,6}|[A-Z][0-9]{5,9}|[A-Z][0-9]{6,8}|[A-Z][0-9]{4,8}|[A-Z][0-9]{9,11}|[A-Z]{1,2}[0-9]{5,6}|H[0-9]{8}|V[0-9]{6}|X[0-9]{8}|[A-Z]{2}[0-9]{2,5}|[A-Z]{2}[0-9]{3,7}|[0-9]{2}[A-Z]{3}[0-9]{5,6}|[A-Z][0-9]{13,14}|[A-Z][0-9]{18}|[A-Z][0-9]{6}R|[A-Z][0-9]{9}|[A-Z][0-9]{1,12}|[0-9]{9}[A-Z]|[A-Z]{2}[0-9]{6}[A-Z]|[0-9]{8}[A-Z]{2}|[0-9]{3}[A-Z]{2}[0-9]{4}|[A-Z][0-9][A-Z][0-9][A-Z]|[0-9]{7,8}[A-Z])";

export const PATTERNS = [
  { name: "Driver License - Alphanumeric (weak)", regex: `\\b${ALPHANUM_SOURCE}\\b`, score: 0.3 },
  { name: "Driver License - Digits (very weak)", regex: "\\b([0-9]{6,14}|[0-9]{16})\\b", score: 0.01 },
] as const;

export const CONTEXT = ["driver", "license", "permit", "lic", "identification", "dls", "cdls", "lic#", "driving"] as const;

export const REGEXES = PATTERNS.map((p) => ({
  name: p.name,
  regex: new RegExp(p.regex, "gims"),
  score: p.score,
  source: p.regex,
}));

export const REGEX = new RegExp(PATTERNS[0]!.regex, "gims");

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
    let patternName = PATTERNS[0]!.name;
    let patternSource = PATTERNS[0]!.regex;
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
      recognitionMetadata: { recognizerName: "UsLicenseRecognizer" },
      analysisExplanation: {
        recognizer: "UsLicenseRecognizer",
        patternName,
        pattern: patternSource,
        originalScore: score,
        validationResult: null,
        textualExplanation: `Detected by \`UsLicenseRecognizer\` using pattern \`${patternName}\``,
      },
    };
  });
}

export class UsLicenseRecognizer {
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
