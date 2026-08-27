/**
 * Tests ported 1:1 from presidio-analyzer/tests/test_th_tnin_recognizer.py
 * Run with: bun test
 */
import { describe, it, expect } from "bun:test";
import {
  TH_TNIN_CONTEXT,
  TH_TNIN_ENTITY,
  SUPPORTED_LANGUAGE,
  COUNTRY_CODE,
  TH_TNIN_REGEX,
  sanitizeValue,
  validateChecksum,
  validateResult,
  isValidThaiNationalId,
  findThaiNationalIds,
  analyze,
  ThTninRecognizer,
} from "../../src/features/th/thTnin/thTninRecognizer.ts";

describe("sanitizeValue - ตรง entity_recognizer.py:310", () => {
  it("ไม่มี replacementPairs คืนค่าเดิม", () => {
    expect(sanitizeValue("1234567890121")).toBe("1234567890121");
  });
  it("ตัดขีดด้วย replacementPairs", () => {
    expect(sanitizeValue("1-2345-67890-12-1", [["-", ""]])).toBe("1234567890121");
  });
  it("หลายคู่", () => {
    expect(
      sanitizeValue("1-2345 67890 12-1", [
        ["-", ""],
        [" ", ""],
      ]),
    ).toBe("1234567890121");
  });
});

describe("validateChecksum - ตรง th_tnin_recognizer.py:111", () => {
  it("เลขถูกต้อง", () => {
    expect(validateChecksum("1234567890121")).toBe(true);
    expect(validateChecksum("2345678901234")).toBe(true);
    expect(validateChecksum("3456789012347")).toBe(true);
  });
  it("checksum ผิด", () => {
    expect(validateChecksum("1234567890123")).toBe(false); // ควรเป็น 1 ไม่ใช่ 3
    expect(validateChecksum("1111111111111")).toBe(false);
  });
});

describe("validateResult - ตรง th_tnin_recognizer.py:87", () => {
  it("valid TNINs", () => {
    expect(validateResult("1234567890121")).toBe(true);
    expect(validateResult("2345678901234")).toBe(true);
    expect(validateResult("3456789012347")).toBe(true);
  });
  it("wrong length", () => {
    expect(validateResult("123456789012")).toBe(false); // 12
    expect(validateResult("12345678901234")).toBe(false); // 14
  });
  it("non-digits", () => {
    expect(validateResult("123456789012a")).toBe(false);
    expect(validateResult("123456789012 ")).toBe(false);
  });
  it("starts with 0 / second digit 0", () => {
    expect(validateResult("0234567890124")).toBe(false);
    expect(validateResult("1034567890124")).toBe(false);
  });
  it("forbidden provinces 28/29 - validateResult ยัง true ถ้า checksum ผ่าน (format กรองด้วย regex)", () => {
    // ตรง th_tnin_recognizer.py:108 comment "format validation is handled by regex"
    // ดังนั้น validateResult จะเช็คแค่ length+digit+checksum เท่านั้น
    // 128/129 checksum ผิดอยู่แล้ว -> false, แต่ 199 checksum ถูก -> true (จะถูกกรองที่ regex ชั้นนอก)
    expect(validateResult("1284567890124")).toBe(false);
    expect(validateResult("1294567890124")).toBe(false);
    expect(validateResult("1994567890124")).toBe(true); // checksum ถูก แต่ regex จะกรองทิ้ง
    expect(isValidThaiNationalId("1994567890124")).toBe(false); // isValid เช็ค regex ด้วย -> false
    expect(findThaiNationalIds("1994567890124")).toHaveLength(0);
  });
  it("checksum fail", () => {
    expect(validateResult("1234567890123")).toBe(false);
  });
  it("รองรับ replacementPairs", () => {
    expect(validateResult("1-234-5678901-21", [["-", ""]])).toBe(true);
    expect(validateResult("1-234-5678901-23", [["-", ""]])).toBe(false);
  });
});

describe("isValidThaiNationalId", () => {
  it("valid", () => {
    expect(isValidThaiNationalId("1234567890121")).toBe(true);
    expect(isValidThaiNationalId("1220000000007")).toBe(true); // province 22
    expect(isValidThaiNationalId("1520000000004")).toBe(true); // 52
    expect(isValidThaiNationalId("1580000000004")).toBe(true); // 58
  });
  it("invalid", () => {
    expect(isValidThaiNationalId("1234567890123")).toBe(false);
    expect(isValidThaiNationalId("0234567890124")).toBe(false);
    expect(isValidThaiNationalId("")).toBe(false);
    expect(isValidThaiNationalId("123456789012")).toBe(false);
  });
  it("replacementPairs", () => {
    expect(isValidThaiNationalId("1-2345-67890-12-1", [["-", ""]])).toBe(true);
  });
});

describe("findThaiNationalIds / analyze - ตรง test_th_tnin_recognizer.py parametrized", () => {
  const cases: Array<{
    text: string;
    expectedLen: number;
    expectedPositions?: Array<[number, number]>;
  }> = [
    // Valid TNINs
    { text: "1234567890121", expectedLen: 1, expectedPositions: [[0, 13]] },
    { text: "2345678901234", expectedLen: 1, expectedPositions: [[0, 13]] },
    { text: "3456789012347", expectedLen: 1, expectedPositions: [[0, 13]] },
    { text: "4567890123459", expectedLen: 1, expectedPositions: [[0, 13]] },
    { text: "5678901234560", expectedLen: 1, expectedPositions: [[0, 13]] },
    // regression provinces 22,52,58
    { text: "1220000000007", expectedLen: 1, expectedPositions: [[0, 13]] },
    { text: "1520000000004", expectedLen: 1, expectedPositions: [[0, 13]] },
    { text: "1580000000004", expectedLen: 1, expectedPositions: [[0, 13]] },
    // in sentences
    { text: "My Thai ID is 1234567890121", expectedLen: 1, expectedPositions: [[14, 27]] },
    { text: "TNIN: 2345678901234", expectedLen: 1, expectedPositions: [[6, 19]] },
    { text: "เลขประจำตัวประชาชน: 3456789012347", expectedLen: 1, expectedPositions: [[20, 33]] },
    { text: "Thai National ID 1234567890121", expectedLen: 1, expectedPositions: [[17, 30]] },
    { text: "เลขบัตรประชาชน 2345678901234", expectedLen: 1, expectedPositions: [[15, 28]] },
    // Invalid length
    { text: "123456789012", expectedLen: 0 },
    { text: "12345678901234", expectedLen: 0 },
    // non-digits
    { text: "123456789012a", expectedLen: 0 },
    // format violations
    { text: "0234567890124", expectedLen: 0 },
    { text: "1034567890124", expectedLen: 0 },
    // forbidden
    { text: "1284567890124", expectedLen: 0 },
    { text: "1294567890124", expectedLen: 0 },
    { text: "1594567890124", expectedLen: 0 },
    { text: "1684567890124", expectedLen: 0 },
    { text: "1694567890124", expectedLen: 0 },
    { text: "1784567890124", expectedLen: 0 },
    { text: "1794567890124", expectedLen: 0 },
    { text: "1874567890124", expectedLen: 0 },
    { text: "1884567890124", expectedLen: 0 },
    { text: "1894567890124", expectedLen: 0 },
    { text: "1974567890124", expectedLen: 0 },
    { text: "1984567890124", expectedLen: 0 },
    { text: "1994567890124", expectedLen: 0 },
    // checksum fail
    { text: "1234567890123", expectedLen: 0 },
    { text: "2345678901235", expectedLen: 0 },
    { text: "3456789012346", expectedLen: 0 },
    // edge
    { text: "0000000000000", expectedLen: 0 },
    { text: "1111111111111", expectedLen: 0 },
  ];

  for (const { text, expectedLen, expectedPositions } of cases) {
    it(`"${text}" -> len ${expectedLen}`, () => {
      const results = findThaiNationalIds(text);
      expect(results.length).toBe(expectedLen);
      if (expectedPositions) {
        for (let i = 0; i < expectedPositions.length; i++) {
          expect(results[i]!.start).toBe(expectedPositions[i]![0]);
          expect(results[i]!.end).toBe(expectedPositions[i]![1]);
          expect(results[i]!.score).toBe(1);
        }
      }
      // analyze() ต้องได้ผลเหมือนกัน
      const analyzed = analyze(text);
      expect(analyzed.length).toBe(expectedLen);
      if (expectedLen > 0) {
        expect(analyzed[0]!.entityType).toBe(TH_TNIN_ENTITY);
      }
    });
  }
});

describe("ThTninRecognizer class", () => {
  it("supported info", () => {
    const r = new ThTninRecognizer();
    expect(r.supportedEntities).toEqual([TH_TNIN_ENTITY]);
    expect(r.supportedLanguage).toBe(SUPPORTED_LANGUAGE);
    expect(r.context).toEqual([...TH_TNIN_CONTEXT]);
    expect(ThTninRecognizer.COUNTRY_CODE).toBe(COUNTRY_CODE);
    expect(ThTninRecognizer.SUPPORTED_ENTITY).toBe(TH_TNIN_ENTITY);
  });
  it("replacementPairs ผ่าน constructor", () => {
    const r = new ThTninRecognizer([["-", ""]]);
    expect(r.validateResult("1-234-5678901-21")).toBe(true);
    expect(r.isValid("1-2345-67890-12-1")).toBe(true);
    expect(r.findAll("บัตร 1-234-5678901-21").length).toBe(0); // regex หาแบบไม่มีขีด ไม่เจอขีด - ต้อง sanitize text ก่อน? แต่นี่คือพฤติกรรมตรง Python: regex หาเลขล้วน
  });
  it("TH_TNIN_REGEX มี global flag", () => {
    expect(TH_TNIN_REGEX.flags).toContain("g");
  });
});
