/**
 * Germany ID Card (Personalausweisnummer) Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/germany/de_id_card_recognizer.py:41
 * nPA ICAO Doc9303 + alt T\d{8}
 */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "DE_ID_CARD" as const;
export const COUNTRY_CODE = "de" as const;
export const SUPPORTED_LANGUAGE = "de" as const;
export const BASE_SCORE = 0.4;

export const PATTERN_NPA = "[CFGHJKLMNPRTVWXYZ][CFGHJKLMNPRTVWXYZ0-9]{7}[0-9]";
export const PATTERN_ALT = "T\\d{8}";

export const PATTERNS = [
  { name: "Personalausweisnummer nPA (ICAO charset + check digit)", regex: PATTERN_NPA, score: 0.4 },
  { name: "Personalausweisnummer alt (T + 8 Ziffern)", regex: PATTERN_ALT, score: 0.5 },
];

export const REGEX_NPA = new RegExp(`\\b${PATTERN_NPA}\\b`, "g");
export const REGEX_ALT = new RegExp(`\\b${PATTERN_ALT}\\b`, "g");
export const REGEX = new RegExp(`\\b(?:${PATTERN_NPA}|${PATTERN_ALT})\\b`, "g");

export const CONTEXT: readonly string[] = [
  "personalausweis",
  "ausweis",
  "personalausweisnummer",
  "ausweisnummer",
  "ausweisdokument",
  "dokumentennummer",
  "seriennummer",
  "npa",
  "neuer personalausweis",
  "personalausweisgesetz",
  "pauwsg",
  "bundespersonalausweis",
  "identity card",
  "national id",
] as const;

export function validateResult(patternText: string): boolean | null {
  const t = patternText.toUpperCase().trim();
  if (t.length !== 9) return false;
  // Legacy T + 8 digits: no ICAO validation, abstain
  if (t[0] === "T" && /^\d{8}$/.test(t.slice(1))) return null;
  if (!/\d$/.test(t)) return false;
  const weights = [7, 3, 1];
  let total = 0;
  for (let i = 0; i < 8; i++) {
    const c = t[i]!;
    let value: number;
    if (c >= "0" && c <= "9") value = parseInt(c, 10);
    else if (c >= "A" && c <= "Z") value = c.charCodeAt(0) - 65 + 10;
    else return false;
    total += value * weights[i % 3]!;
  }
  return (total % 10) === parseInt(t[8]!, 10);
}

function scoreForValidation(vr: boolean | null, base: number): number {
  if (vr === false) return MIN_SCORE;
  if (vr === true) return MAX_SCORE;
  return base; // null = keep pattern score (legacy T)
}

export function findAll(text: string): Array<{ value: string; start: number; end: number; score: number }> {
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
      const vr = validateResult(value);
      const score = scoreForValidation(vr, pat.score);
      if (score <= MIN_SCORE) continue;
      results.push({ value, start, end, score });
    }
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export function analyze(text: string): RecognizerResult[] {
  const results: RecognizerResult[] = [];
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
      const vr = validateResult(value);
      const score = scoreForValidation(vr, pat.score);
      if (score <= MIN_SCORE) continue;
      results.push({
        entityType: ENTITY_TYPE,
        start, end, score, value,
        recognitionMetadata: { recognizerName: "DeIdCardRecognizer" },
        analysisExplanation: {
          recognizer: "DeIdCardRecognizer",
          patternName: pat.name,
          pattern: pat.regex,
          originalScore: pat.score,
          validationResult: vr,
          textualExplanation: `Detected by \`DeIdCardRecognizer\` using pattern \`${pat.name}\``,
        },
      });
    }
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class DeIdCardRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "DeIdCardRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  validateResult(patternText: string): boolean | null { return validateResult(patternText); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string): RecognizerResult[] { return analyze(text); }
}
