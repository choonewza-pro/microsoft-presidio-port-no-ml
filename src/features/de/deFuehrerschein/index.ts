/**
 * Germany Führerschein (Driving License) Recognizer
 * Ported from presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/germany/de_fuehrerschein_recognizer.py
 * Post-2013 EU format: [A-Z]{2}\d{8}[A-Z0-9] (11 chars), no published checksum
 */
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "DE_FUEHRERSCHEIN" as const;
export const COUNTRY_CODE = "de" as const;
export const SUPPORTED_LANGUAGE = "de" as const;
export const BASE_SCORE = 0.35;

export const PATTERN_SOURCE = "[A-Z]{2}\\d{8}[A-Z0-9]";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "g");
export const REGEX_SINGLE = new RegExp(`^${PATTERN_SOURCE}$`);
export const PATTERNS = [{ name: "Führerscheinnummer (Post-2013 EU-Format, 11 Zeichen)", regex: PATTERN_SOURCE, score: BASE_SCORE }];

export const CONTEXT: readonly string[] = [
  "führerscheinnummer",
  "führerschein",
  "fahrerlaubnis",
  "fahrerlaubnisnummer",
  "fahrerlaubnisklasse",
  "führerscheininhaber",
  "fev",
  "kba",
  "kraftfahrt-bundesamt",
  "driving licence",
  "driving license",
  "driver's license",
  "licence number",
  "license number",
  "dokument nr",
  "dokument-nr",
  "feld 5",
] as const;

export function validateResult(_patternText: string): boolean | null { return null; }

export function findAll(text: string): Array<{ value: string; start: number; end: number; score: number }> {
  const re = new RegExp(REGEX.source, REGEX.flags);
  const results: Array<{ value: string; start: number; end: number; score: number }> = [];
  for (const m of text.matchAll(re)) {
    const value = m[0];
    const start = m.index ?? 0;
    const end = start + value.length;
    if (!value) continue;
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
    results.push({
      entityType: ENTITY_TYPE,
      start, end, score: BASE_SCORE, value,
      recognitionMetadata: { recognizerName: "DeFuehrerscheinRecognizer" },
      analysisExplanation: {
        recognizer: "DeFuehrerscheinRecognizer",
        patternName: "Führerscheinnummer (Post-2013 EU-Format, 11 Zeichen)",
        pattern: REGEX.source,
        originalScore: BASE_SCORE,
        validationResult: null,
        textualExplanation: "Detected by `DeFuehrerscheinRecognizer` using pattern `Führerscheinnummer (Post-2013 EU-Format, 11 Zeichen)`",
      },
    });
  }
  return results.sort((a, b) => b.score - a.score || a.start - b.start);
}

export class DeFuehrerscheinRecognizer {
  static readonly ENTITY_TYPE = ENTITY_TYPE;
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;
  static readonly PATTERNS = PATTERNS;
  static readonly CONTEXT = CONTEXT;
  name = "DeFuehrerscheinRecognizer";
  supportedEntities = [ENTITY_TYPE] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  validateResult(patternText: string): boolean | null { return validateResult(patternText); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string): RecognizerResult[] { return analyze(text); }
}
