/**
 * UK Vehicle Registration Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/uk/uk_vehicle_registration_recognizer.py
 */
import { sanitizeValue } from "../../../core/sanitize.ts";
import type { ReplacementPair } from "../../../core/sanitize.ts";
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "UK_VEHICLE_REGISTRATION" as const;
export const COUNTRY_CODE = "uk" as const;
export const SUPPORTED_LANGUAGE = "en" as const;
export const REPLACEMENT_PAIRS: ReplacementPair[] = [["-", ""], [" ", ""]];

export const PATTERN_CURRENT = "[A-HJ-PR-Y][A-HJ-PR-Y](?:0[1-9]|[1-7][0-9])[- ]?[A-HJ-PR-Z]{3}";
export const PATTERN_PREFIX = "[A-HJ-NPR-TV-Y]\\d{1,3}[- ]?[A-HJ-PR-Y][A-HJ-PR-Z]{2}";
export const PATTERN_SUFFIX = "[A-HJ-PR-Z]{3}[- ]?\\d{1,3}[- ]?[A-HJ-NPR-TV-Y]";

export const PATTERNS = [
  { name: "UK Vehicle Registration (current)", regex: PATTERN_CURRENT, score: 0.3 },
  { name: "UK Vehicle Registration (prefix)", regex: PATTERN_PREFIX, score: 0.2 },
  { name: "UK Vehicle Registration (suffix)", regex: PATTERN_SUFFIX, score: 0.15 },
];

export const REGEX_CURRENT = new RegExp(`\\b${PATTERN_CURRENT}\\b`, "g");
export const REGEX_PREFIX = new RegExp(`\\b${PATTERN_PREFIX}\\b`, "g");
export const REGEX_SUFFIX = new RegExp(`\\b${PATTERN_SUFFIX}\\b`, "g");
// Combined for convenience
export const REGEX = new RegExp(`\\b(?:${PATTERN_CURRENT}|${PATTERN_PREFIX}|${PATTERN_SUFFIX})\\b`, "g");

export const BASE_SCORE = 0.3;

export const CONTEXT: readonly string[] = [
  "vehicle",
  "registration",
  "number plate",
  "licence plate",
  "license plate",
  "reg",
  "vrn",
  "dvla",
  "v5c",
  "logbook",
  "mot",
  "car",
  "insured vehicle",
] as const;

export function validateResult(patternText: string, replacementPairs: ReplacementPair[] = REPLACEMENT_PAIRS): boolean | null {
  const sanitized = sanitizeValue(patternText, replacementPairs);
  if (sanitized.length === 7 && /^[A-Za-z]{2}/.test(sanitized)) {
    const ageIdStr = sanitized.slice(2, 4);
    if (/^\d{2}$/.test(ageIdStr)) {
      const ageId = parseInt(ageIdStr, 10);
      return (ageId >= 2 && ageId <= 29) || (ageId >= 51 && ageId <= 79);
    }
  }
  return null;
}

function scoreForValidation(vr: boolean | null, patternScore: number): number {
  if (vr === false) return MIN_SCORE;
  if (vr === true) return MAX_SCORE;
  return patternScore;
}

export function findAll(text: string, replacementPairs: ReplacementPair[] = REPLACEMENT_PAIRS): Array<{ value: string; start: number; end: number; score: number }> {
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  const seen = new Set<string>();
  for (const pat of PATTERNS) {
    const re = new RegExp(`\\b${pat.regex}\\b`, "g");
    for (const m of text.matchAll(re)) {
      const value = m[0];
      const start = m.index ?? 0;
      const end = start + value.length;
      if (!value) continue;
      const key = `${start}-${end}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const vr = validateResult(value, replacementPairs);
      const score = scoreForValidation(vr, pat.score);
      if (score <= MIN_SCORE) continue;
      results.push({ value, start, end, score });
    }
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export function analyze(text: string, replacementPairs: ReplacementPair[] = REPLACEMENT_PAIRS): RecognizerResult[] {
  const all = findAll(text, replacementPairs);
  // Need to map back to pattern name; re-derive by testing each pattern
  return all.map(({ value, start, end, score }) => {
    let patternName = "UK Vehicle Registration";
    let pattern = REGEX.source;
    for (const pat of PATTERNS) {
      const re = new RegExp(`^${pat.regex}$`);
      if (re.test(value)) { patternName = pat.name; pattern = pat.regex; break; }
    }
    const vr = validateResult(value, replacementPairs);
    return {
      entityType: ENTITY_TYPE,
      start, end, score, value,
      recognitionMetadata: { recognizerName: "UkVehicleRegistrationRecognizer" },
      analysisExplanation: {
        recognizer: "UkVehicleRegistrationRecognizer",
        patternName,
        pattern,
        originalScore: PATTERNS.find(p => p.name === patternName)?.score ?? BASE_SCORE,
        validationResult: vr,
        textualExplanation: `Detected by \`UkVehicleRegistrationRecognizer\` using pattern \`${patternName}\``,
      },
    } as RecognizerResult;
  }).sort((a, b) => b.score - a.score || a.start - b.start);
}

export class UkVehicleRegistrationRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "UkVehicleRegistrationRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  replacementPairs: ReplacementPair[];
  constructor(replacementPairs: ReplacementPair[] = REPLACEMENT_PAIRS) { this.replacementPairs = replacementPairs; }
  validateResult(patternText: string): boolean | null { return validateResult(patternText, this.replacementPairs); }
  findAll(text: string) { return findAll(text, this.replacementPairs); }
  analyze(text: string): RecognizerResult[] { return analyze(text, this.replacementPairs); }
}
