import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/in/inGstin/index.ts";
describe("in/inGstin", () => {
  it("findAll valid 27ABCDE1234F1Z5", () => { expect(mod.findAll("27ABCDE1234F1Z5").length).toBe(1); });
  it("findAll valid 07PQRST6789K1Z2", () => { expect(mod.findAll("07PQRST6789K1Z2").length).toBe(1); });
  it("findAll valid 22ABCDE1234F1Z5", () => { expect(mod.findAll("22ABCDE1234F1Z5").length).toBe(1); });
  it("findAll valid 01ABCDE1234F1Z5", () => { expect(mod.findAll("01ABCDE1234F1Z5").length).toBe(1); });
  it("findAll invalid state 00ABCDE1234F1Z5", () => { expect(mod.findAll("00ABCDE1234F1Z5").length).toBe(0); });
  it("findAll invalid state 38ABCDE1234F1Z5", () => { expect(mod.findAll("38ABCDE1234F1Z5").length).toBe(0); });
  it("findAll invalid missing Z 27ABCDE1234F1Y5", () => { expect(mod.findAll("27ABCDE1234F1Y5").length).toBe(0); });
  it("findAll invalid short 27ABCDE1234F1Z", () => { expect(mod.findAll("27ABCDE1234F1Z").length).toBe(0); });
  it("validateResult valid", () => { expect(mod.validateResult("27ABCDE1234F1Z5")).toBe(true); });
  it("validateResult invalid", () => { expect(mod.validateResult("00ABCDE1234F1Z5")).toBe(false); });
  it("validatePanFormat", () => { expect(mod.validatePanFormat("ABCDE1234F")).toBe(true); expect(mod.validatePanFormat("ABCD1234F")).toBe(false); });
  it("analyze", () => { const r=mod.analyze("test 27ABCDE1234F1Z5 end"); expect(r.length).toBe(1); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
