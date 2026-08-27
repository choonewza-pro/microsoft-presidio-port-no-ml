/**
 * Germany BSNR (Betriebsstättennummer) Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/germany/de_bsnr_recognizer.py
 * 9 digits, no checksum (only drop all-zero)
 */
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "DE_BSNR" as const;
export const COUNTRY_CODE = "de" as const;
export const SUPPORTED_LANGUAGE = "de" as const;
export const BASE_SCORE = 0.2;

export const PATTERN_SOURCE = "\\d{9}";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "g");
export const REGEX_SINGLE = new RegExp(`^${PATTERN_SOURCE}$`);
export const PATTERNS = [{ name: "Betriebsstättennummer BSNR (9 digits)", regex: PATTERN_SOURCE, score: BASE_SCORE }];

export const VALID_KV_CODES: ReadonlySet<string> = new Set([
  "01", "02", "03", "17", "20", "35", "38", "46", "51", "52", "71", "72", "73", "74", "78", "83", "88", "93", "98",
]);

export const CONTEXT: readonly string[] = [
  "betriebsstättennummer",
  "betriebsstätten-nummer",
  "bsnr",
  "betriebsstätte",
  "praxisnummer",
  "arztpraxis",
  "praxis",
  "kassenärztliche vereinigung",
  "kv-nummer",
  "kv nummer",
  "praxisadresse",
  "praxisstandort",
  "nebenbetriebsstätte",
  "hauptbetriebsstätte",
  "behandlungsort",
  "vertragsarztpraxis",
] as const;

export function validateResult(patternText: string): boolean | null {
  const t = patternText.trim();
  if (!/^\d{9}$/.test(t)) return false;
  if (t === "000000000") return false;
  return null;
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
    results.push({ value, start, end, score: BASE_SCORE });
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
    results.push({
      entityType: ENTITY_TYPE,
      start, end, score: BASE_SCORE, value,
      recognitionMetadata: { recognizerName: "DeBsnrRecognizer" },
      analysisExplanation: {
        recognizer: "DeBsnrRecognizer",
        patternName: "Betriebsstättennummer BSNR (9 digits)",
        pattern: REGEX.source,
        originalScore: BASE_SCORE,
        validationResult: vr,
        textualExplanation: "Detected by `DeBsnrRecognizer` using pattern `Betriebsstättennummer BSNR (9 digits)`",
      },
    });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class DeBsnrRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "DeBsnrRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  validateResult(patternText: string): boolean | null { return validateResult(patternText); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string): RecognizerResult[] { return analyze(text); }
}
