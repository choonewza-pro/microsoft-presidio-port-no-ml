/**
 * US_MBI - Ported from country_specific/us/us_mbi_recognizer.py
 * Medicare Beneficiary Identifier 11 chars, with/without dashes
 */
import type { ReplacementPair } from "../../../core/sanitize.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "US_MBI" as const;
export const COUNTRY_CODE = "us" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.5;

const VALID_LETTERS = "ACDEFGHJKMNPQRTUVWXY";
const VALID_ALPHANUMERIC = "0-9ACDEFGHJKMNPQRTUVWXY";
const _NUM = "[0-9]";
const _ALPHA = `[${VALID_LETTERS}]`;
const _ALPHANUM = `[${VALID_ALPHANUMERIC}]`;

const _MBI_NO_DASH = `${_NUM}${_ALPHA}${_ALPHANUM}${_NUM}${_ALPHA}${_ALPHANUM}${_NUM}${_ALPHA}${_ALPHA}${_NUM}${_NUM}`;
const _MBI_WITH_DASH = `${_NUM}${_ALPHA}${_ALPHANUM}${_NUM}-${_ALPHA}${_ALPHANUM}${_NUM}-${_ALPHA}${_ALPHA}${_NUM}${_NUM}`;

export const PATTERNS = [
  { name: "MBI (weak)", regex: `\\b${_MBI_NO_DASH}\\b`, score: 0.3 },
  { name: "MBI (medium)", regex: `\\b${_MBI_WITH_DASH}\\b`, score: 0.5 },
] as const;

export const CONTEXT = ["medicare", "mbi", "beneficiary", "cms", "medicaid", "hic", "hicn"] as const;

export const REGEXES = PATTERNS.map((p) => ({
  name: p.name,
  regex: new RegExp(p.regex, "gims"),
  score: p.score,
  source: p.regex,
}));

export const REGEX = new RegExp(PATTERNS[1]!.regex, "gims");

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
      recognitionMetadata: { recognizerName: "UsMbiRecognizer" },
      analysisExplanation: {
        recognizer: "UsMbiRecognizer",
        patternName,
        pattern: patternSource,
        originalScore: score,
        validationResult: null,
        textualExplanation: `Detected by \`UsMbiRecognizer\` using pattern \`${patternName}\``,
      },
    };
  });
}

export class UsMbiRecognizer {
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
