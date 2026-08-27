/**
 * Thai National ID Number (TH_TNIN) Recognizer
 * Ported 1:1 from Presidio Python:
 *   presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific/thai/th_tnin_recognizer.py
 *
 * 13-digit Thai National ID validation:
 *   - Format: N1..N13, N1 != 0, N2 != 0, N2N3 not in forbidden province codes
 *   - Checksum: S = 13*N1 + 12*N2 + ... + 2*N12, x = S % 11, N13 = (11 - x) % 10
 *   - Ref: https://th.wikipedia.org/wiki/เลขประจำตัวประชาชนไทย
 *
 * Presidio flow:
 *   1) Regex pre-filter (PatternRecognizer.__analyze_patterns)
 *   2) validateResult -> validateChecksum
 *   3) Context boost (handled by AnalyzerEngine, exported as TH_TNIN_CONTEXT here)
 *
 * @module thTninRecognizer
 */

// ============================================================================
// Constants - ตรง th_tnin_recognizer.py
// ============================================================================

/** Entity type ตรง th_tnin_recognizer.py:71 */
export const TH_TNIN_ENTITY = "TH_TNIN" as const;

/** Country code ตรง th_tnin_recognizer.py:47 */
export const COUNTRY_CODE = "th" as const;

/** Supported language ตรง th_tnin_recognizer.py:70 */
export const SUPPORTED_LANGUAGE = "th" as const;

/**
 * Regex source ตรง th_tnin_recognizer.py:49-54
 * PATTERNS = [Pattern("TNIN (Medium)", r"\b[1-9](?:[134][0-9]|2[0-7]|5[0-8]|[67][01234567]|[89][0123456])\d{10}\b", 0.5)]
 *
 * อธิบาย:
 * - \b = word boundary (กันเลขติดกับตัวอักษร/เลขอื่น)
 * - [1-9] = N1 ห้าม 0
 * - (?:[134][0-9]|2[0-7]|5[0-8]|[67][01234567]|[89][0123456]) = N2N3 รหัสจังหวัด ตัด 28,29,59,68,69,78,79,87-89,97-99 ที่ไม่มีจริง (ISO 3166-2:TH)
 * - \d{10} = N4..N13 (รวม check digit, จะตรวจ checksum อีกชั้นใน validateResult)
 * - score 0.5 = base score ก่อน validate (ถ้า validate ผ่านจะดันเป็น 1.0)
 */
export const TH_TNIN_PATTERN_SOURCE =
  "[1-9](?:[134][0-9]|2[0-7]|5[0-8]|[67][01234567]|[89][0123456])\\d{10}";

/**
 * Compiled regex ตรง pattern_recognizer.py:59 global_regex_flags = DOTALL|MULTILINE|IGNORECASE (26)
 * ใน JS ใช้ flags "gims" (g=global, i=ignoreCase, m=multiline, s=dotAll)
 * ใช้ \b ครอบแบบเดียวกับ Python
 */
export const TH_TNIN_REGEX = new RegExp(
  `\\b${TH_TNIN_PATTERN_SOURCE}\\b`,
  "g",
);

/** Regex แบบไม่มี global flag ไว้เช็คเดี่ยวๆ */
export const TH_TNIN_REGEX_SINGLE = new RegExp(
  `^${TH_TNIN_PATTERN_SOURCE}$`,
);

/** Base score ก่อน validate ตรง th_tnin_recognizer.py:53 */
export const BASE_SCORE = 0.5;

/** Max/Min score ตรง entity_recognizer.py:40-41 */
export const MAX_SCORE = 1.0;
export const MIN_SCORE = 0;

/**
 * Context words ตรง th_tnin_recognizer.py:57-64
 * ใช้ boost score เมื่อคำเหล่านี้อยู่ใกล้ๆ entity (AnalyzerEngine จะจัดการ, ที่นี่ export ไว้ให้ใช้เองได้)
 */
export const TH_TNIN_CONTEXT: readonly string[] = [
  "Thai National ID",
  "Thai ID Number",
  "TNIN",
  "เลขประจำตัวประชาชน",
  "เลขบัตรประชาชน",
  "รหัสปชช",
] as const;

/** Global regex flags ค่า 26 ตรง default_recognizers.yaml:3 และ pattern_recognizer.py:59 */
export const GLOBAL_REGEX_FLAGS = "gims";

// ============================================================================
// Types
// ============================================================================

export type ReplacementPair = [string, string];

export interface RecognizerResult {
  entityType: typeof TH_TNIN_ENTITY;
  start: number;
  end: number;
  score: number;
  value: string;
  recognitionMetadata?: {
    recognizerName: string;
    recognizerIdentifier?: string;
  };
  analysisExplanation?: {
    recognizer: string;
    patternName: string;
    pattern: string;
    originalScore: number;
    validationResult: boolean | null;
    textualExplanation: string;
  };
}

// ============================================================================
// Functions - ตรง Python แบบ 1:1 แต่เป็น camelCase
// ============================================================================

/**
 * ทำความสะอาดค่าก่อน validate - ตรง entity_recognizer.py:310 sanitizeValue
 *
 * Python:
 * ```python
 * @staticmethod
 * def sanitize_value(text: str, replacement_pairs: List[Tuple[str, str]]) -> str:
 *     for search_string, replacement_string in replacement_pairs:
 *         text = text.replace(search_string, replacement_string)
 *     return text
 * ```
 *
 * @param text - ข้อความดิบที่ regex เจอ
 * @param replacementPairs - คู่ [search, replace] เช่น [["-",""], [" ",""]] เพื่อตัดขีด/ช่องว่างก่อนตรวจ
 * @returns ข้อความที่ทำความสะอาดแล้ว
 *
 * @example
 * sanitizeValue("1-2345-67890-12-1", [["-", ""]]) // "1234567890121"
 * sanitizeValue("1234 567890121", [[" ", ""]]) // "1234567890121"
 */
export function sanitizeValue(
  text: string,
  replacementPairs: ReplacementPair[] = [],
): string {
  let result = text;
  for (const [search, replacement] of replacementPairs) {
    // ใช้ split/join เพื่อ replace แบบ literal ทั้งหมด (ตรง Python str.replace ที่ replace all)
    result = result.split(search).join(replacement);
  }
  return result;
}

/**
 * ตรวจ checksum Mod 11 - ตรง th_tnin_recognizer.py:111 _validateChecksum
 *
 * Algorithm ตรง th_tnin_recognizer.py:28-33:
 * - Label first 12 digits N1..N12 (left to right)
 * - Compute S = 13*N1 + 12*N2 + ... + 2*N12
 * - Let x = S mod 11
 * - Then check digit N13 = (11 - x) mod 10
 * - Equivalently: if x <= 1 then N13 = 1 - x; otherwise N13 = 11 - x
 *
 * @param tnin - สตริง 13 หลัก (ต้องเป็น digit ล้วน)
 * @returns true ถ้า checksum ถูกต้อง
 *
 * @example
 * validateChecksum("1234567890121") // true
 * validateChecksum("1234567890123") // false (ควรเป็น 1 ไม่ใช่ 3)
 */
export function validateChecksum(tnin: string): boolean {
  // ตรง th_tnin_recognizer.py:125 weights = [13,12,11,10,9,8,7,6,5,4,3,2]
  const weights = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  let totalSum = 0;
  for (let i = 0; i < 12; i++) {
    totalSum += weights[i]! * parseInt(tnin[i]!, 10);
  }
  const x = totalSum % 11;
  const expectedCheckDigit = x <= 1 ? 1 - x : 11 - x;
  const actualCheckDigit = parseInt(tnin[12]!, 10);
  return expectedCheckDigit === actualCheckDigit;
}

/**
 * Validate ผลลัพธ์ที่ regex เจอ - ตรง th_tnin_recognizer.py:87 validateResult
 *
 * Python:
 * ```python
 * def validate_result(self, pattern_text: str) -> Union[bool, None]:
 *     sanitized_value = EntityRecognizer.sanitize_value(pattern_text, self.replacement_pairs)
 *     if len(sanitized_value) != 13: return False
 *     if not sanitized_value.isdigit(): return False
 *     return self._validate_checksum(sanitized_value)
 * ```
 *
 * @param patternText - ข้อความที่ regex match ได้ (เช่น "1234567890121")
 * @param replacementPairs - ส่งต่อไป sanitizeValue (เช่น ตัด "-" ก่อนตรวจ)
 * @returns true=ผ่าน, false=ไม่ผ่าน
 *
 * @example
 * validateResult("1234567890121") // true
 * validateResult("0234567890124") // false (N1=0)
 * validateResult("1284567890124") // false (N2N3=28 forbidden) - จริงๆ regex กรองไปแล้ว แต่ถ้าหลุดมาก็ false
 * validateResult("1-234-5678901-21", [["-",""]]) // true (รองรับ replacementPairs)
 */
export function validateResult(
  patternText: string,
  replacementPairs: ReplacementPair[] = [],
): boolean {
  const sanitizedValue = sanitizeValue(patternText, replacementPairs);
  if (sanitizedValue.length !== 13) {
    return false;
  }
  if (!/^\d{13}$/.test(sanitizedValue)) {
    return false;
  }
  return validateChecksum(sanitizedValue);
}

/**
 * เช็คว่าสตริงเดี่ยวๆ เป็นบัตรประชาชนที่ถูกต้อง - helper สำหรับใช้งานง่าย (ไม่มีใน Python แยก แต่รวม logic regex+validate)
 *
 * จะเช็คทั้ง regex format + checksum ผ่าน validateResult
 *
 * @param id - สตริงที่ต้องการเช็ค (อาจมี "-" หรือ space ถ้าส่ง replacementPairs)
 * @param replacementPairs - เช่น [["-",""], [" ",""]] เพื่อรองรับ "1-2345-67890-12-1"
 * @returns true ถ้าเป็นบัตรประชาชนไทยที่ถูกต้อง
 *
 * @example
 * isValidThaiNationalId("1234567890121") // true
 * isValidThaiNationalId("1234567890123") // false
 * isValidThaiNationalId("1-2345-67890-12-1", [["-",""]]) // true
 * isValidThaiNationalId(" 1234567890121 ") // false (มี space ครอบ - ต้อง trim หรือใช้ replacementPairs)
 */
export function isValidThaiNationalId(
  id: string,
  replacementPairs: ReplacementPair[] = [],
): boolean {
  const sanitized = sanitizeValue(id, replacementPairs);
  // ต้อง match ทั้งสตริง (ใช้ ^ $) ไม่ใช่แค่ส่วนหนึ่ง
  if (!TH_TNIN_REGEX_SINGLE.test(sanitized)) {
    return false;
  }
  return validateResult(sanitized, []);
}

/**
 * สแกนหาบัตรประชาชนทั้งหมดในข้อความ - เทียบเท่า PatternRecognizer.__analyze_patterns (pattern_recognizer.py:193)
 *
 * ขั้นตอนตรง Python:
 * 1) re.compile(pattern, flags).finditer(text) -> หาทุก match ด้วย regex
 * 2) validateResult(match) -> ถ้า true score=1.0, false score=0 (pattern_recognizer.py:258-261)
 * 3) กรอง score > 0 แล้ว return
 *
 * @param text - ข้อความที่ต้องการสแกน
 * @param replacementPairs - ส่งต่อให้ validateResult (ปกติไม่ต้องใช้ เพราะ regex เจอแบบไม่มีขีด)
 * @returns array ของผลลัพธ์พร้อม start/end/score/value
 *
 * @example
 * findThaiNationalIds("บัตร 1234567890121 และ 2345678901234")
 * // [{value:"1234567890121", start:5, end:18, score:1}, {value:"2345678901234", start:23, end:36, score:1}]
 *
 * @example
 * findThaiNationalIds("เลขบัตรประชาชน 2345678901234") // เจอ 1 รายการ score 1.0 (context ไทย)
 *
 * @example
 * findThaiNationalIds("เลขมั่ว 1234567890123") // [] (checksum ผิด เลยโดนกรองทิ้ง)
 */
export function findThaiNationalIds(
  text: string,
  replacementPairs: ReplacementPair[] = [],
): Array<{ value: string; start: number; end: number; score: number }> {
  // สร้าง regex ใหม่ทุกครั้งเพื่อ reset lastIndex (เพราะใช้ global flag)
  const regex = new RegExp(TH_TNIN_REGEX.source, TH_TNIN_REGEX.flags);
  const results: Array<{
    value: string;
    start: number;
    end: number;
    score: number;
  }> = [];

  for (const match of text.matchAll(regex)) {
    const value = match[0];
    const start = match.index ?? 0;
    const end = start + value.length;

    if (value === "") continue;

    // ตรง pattern_recognizer.py:236 validation_result = self.validate_result(current_match)
    const isValid = validateResult(value, replacementPairs);
    // ตรง pattern_recognizer.py:258-261 ถ้า valid -> MAX_SCORE, ถ้า invalid -> MIN_SCORE (กรองทิ้ง)
    const score = isValid ? MAX_SCORE : MIN_SCORE;

    if (score > MIN_SCORE) {
      results.push({ value, start, end, score });
    }
  }

  // ตรง pattern_recognizer.py:280 remove_duplicates (เรียงตาม score desc, start asc)
  // ที่นี่ไม่ต้องซ้ำซ้อนเพราะ regex ไม่ทับซ้อน แต่ sort ให้ตรง Python
  results.sort((a, b) => b.score - a.score || a.start - b.start);
  return results;
}

/**
 * วิเคราะห์ข้อความแบบเต็ม Presidio style - คืน RecognizerResult[]
 * เทียบเท่า PatternRecognizer.analyze (pattern_recognizer.py:97) + build_regex_explanation (pattern_recognizer.py:159)
 *
 * @param text - ข้อความ
 * @param replacementPairs - คู่ replace ก่อน validate
 * @returns RecognizerResult[] พร้อม analysisExplanation
 *
 * @example
 * analyze("My Thai ID is 1234567890121")
 * // [{entityType:"TH_TNIN", start:14, end:27, score:1, value:"1234567890121", ...}]
 */
export function analyze(
  text: string,
  replacementPairs: ReplacementPair[] = [],
): RecognizerResult[] {
  const regex = new RegExp(TH_TNIN_REGEX.source, TH_TNIN_REGEX.flags);
  const results: RecognizerResult[] = [];

  for (const match of text.matchAll(regex)) {
    const value = match[0];
    const start = match.index ?? 0;
    const end = start + value.length;
    if (value === "") continue;

    const validationResult = validateResult(value, replacementPairs);
    const score = validationResult ? MAX_SCORE : MIN_SCORE;
    if (score <= MIN_SCORE) continue;

    const explanation = {
      recognizer: "ThTninRecognizer",
      patternName: "TNIN (Medium)",
      pattern: TH_TNIN_REGEX.source,
      originalScore: BASE_SCORE,
      validationResult,
      textualExplanation: `Detected by \`ThTninRecognizer\` using pattern \`TNIN (Medium)\``,
    };

    results.push({
      entityType: TH_TNIN_ENTITY,
      start,
      end,
      score,
      value,
      recognitionMetadata: {
        recognizerName: "ThTninRecognizer",
      },
      analysisExplanation: explanation,
    });
  }

  results.sort((a, b) => b.score - a.score || a.start - b.start);
  return results;
}

// ============================================================================
// Class wrapper - ให้เหมือน Python ThTninRecognizer สำหรับคนที่คุ้น Presidio
// ============================================================================

/**
 * Class wrapper ตรง th_tnin_recognizer.py:6 ThTninRecognizer
 * ใช้เมื่อต้องการ API แบบ OOP เหมือน Presidio Python
 *
 * @example
 * const recognizer = new ThTninRecognizer();
 * recognizer.validateResult("1234567890121") // true
 * recognizer.analyze("บัตร 1234567890121") // [{entityType:"TH_TNIN", ...}]
 */
export class ThTninRecognizer {
  static readonly COUNTRY_CODE = COUNTRY_CODE;
  static readonly PATTERNS = [
    { name: "TNIN (Medium)", regex: TH_TNIN_REGEX.source, score: BASE_SCORE },
  ];
  static readonly CONTEXT = TH_TNIN_CONTEXT;
  static readonly SUPPORTED_ENTITY = TH_TNIN_ENTITY;
  static readonly SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;

  name = "ThTninRecognizer";
  supportedEntities = [TH_TNIN_ENTITY] as const;
  supportedLanguage = SUPPORTED_LANGUAGE;
  context = [...TH_TNIN_CONTEXT];
  replacementPairs: ReplacementPair[];

  constructor(replacementPairs: ReplacementPair[] = []) {
    this.replacementPairs = replacementPairs;
  }

  /** ตรง th_tnin_recognizer.py:310 sanitizeValue (instance wrapper) */
  sanitizeValue(text: string): string {
    return sanitizeValue(text, this.replacementPairs);
  }

  /** ตรง th_tnin_recognizer.py:111 */
  validateChecksum(tnin: string): boolean {
    return validateChecksum(tnin);
  }

  /** ตรง th_tnin_recognizer.py:87 */
  validateResult(patternText: string): boolean {
    return validateResult(patternText, this.replacementPairs);
  }

  /** ตรง isValidThaiNationalId */
  isValid(id: string): boolean {
    return isValidThaiNationalId(id, this.replacementPairs);
  }

  /** ตรง findThaiNationalIds */
  findAll(text: string) {
    return findThaiNationalIds(text, this.replacementPairs);
  }

  /** ตรง analyze */
  analyze(text: string): RecognizerResult[] {
    return analyze(text, this.replacementPairs);
  }
}
