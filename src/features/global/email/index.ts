/**
 * EMAIL_ADDRESS - Ported from generic/email_recognizer.py:24
 * Regex 0.5 + TLD validate (tldextract -> fqdn != "")
 */
import { MAX_SCORE, MIN_SCORE } from "../../../core/scores.ts";
import type { RecognizerResult } from "../../../core/types.ts";

export const ENTITY_TYPE = "EMAIL_ADDRESS" as const;
export const COUNTRY_CODE = null;
export const SUPPORTED_LANGUAGE = "en" as const;
export const BASE_SCORE = 0.5;
export const PATTERN_SOURCE =
  "((([!#$%&'*+\\-/=?^_`{|}~\\w])|([!#$%&'*+\\-/=?^_`{|}~\\w][!#$%&'*+\\-/=?^_`{|}~\\.\\w]{0,}[!#$%&'*+\\-/=?^_`{|}~\\w]))[@]\\w+(?:-+\\w+)*(?:\\.\\w+(?:-+\\w+)*)+)";
export const REGEX = new RegExp(`\\b${PATTERN_SOURCE}\\b`, "gims");
export const CONTEXT = ["email"] as const;

/** ตรง validate_result - tldextract fqdn != "" -> port แบบง่าย: ต้องมี dot และ TLD >=2 */
export function validateResult(patternText: string): boolean {
  const at = patternText.lastIndexOf("@");
  if (at < 1) return false;
  const domain = patternText.slice(at + 1);
  if (!domain.includes(".")) return false;
  const tld = domain.split(".").pop()!;
  if (tld.length < 2) return false;
  // fqdn check แบบง่าย: domain ต้องมีอย่างน้อย 1 dot และไม่ขึ้นต้น/ลงท้ายด้วย -
  if (/^-|-$/.test(domain)) return false;
  return true;
}

export function isValidEmail(text: string): boolean {
  if (!new RegExp(`^${PATTERN_SOURCE}$`, "ims").test(text)) return false;
  return validateResult(text);
}

export function findAll(text: string) {
  const re = new RegExp(REGEX.source, REGEX.flags);
  const res: Array<{ value: string; start: number; end: number; score: number }> = [];
  for (const m of text.matchAll(re)) {
    const value = m[0];
    const start = m.index ?? 0;
    const end = start + value.length;
    if (!value) continue;
    const ok = validateResult(value);
    const score = ok ? MAX_SCORE : MIN_SCORE;
    if (score > MIN_SCORE) res.push({ value, start, end, score });
  }
  return res.sort((a, b) => b.score - a.score || a.start - b.start);
}

export function analyze(text: string): RecognizerResult[] {
  return findAll(text).map(({ value, start, end, score }) => ({
    entityType: ENTITY_TYPE,
    start, end, score, value,
    recognitionMetadata: { recognizerName: "EmailRecognizer" },
    analysisExplanation: {
      recognizer: "EmailRecognizer",
      patternName: "Email (Medium)",
      pattern: REGEX.source,
      originalScore: BASE_SCORE,
      validationResult: true,
      textualExplanation: "Detected by `EmailRecognizer` using pattern `Email (Medium)`",
    },
  }));
}

export class EmailRecognizer {
  static ENTITY_TYPE = ENTITY_TYPE;
  static CONTEXT = CONTEXT;
  validateResult(t: string) { return validateResult(t); }
  findAll(text: string) { return findAll(text); }
  analyze(text: string) { return analyze(text); }
}
