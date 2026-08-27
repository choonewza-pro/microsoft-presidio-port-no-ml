import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/in/inAadhaar/index.ts";
describe("in/inAadhaar", () => {
  it("findAll valid plain 312345678909", () => { expect(mod.findAll("312345678909").length).toBe(1); });
  it("findAll valid spaced 3123 4567 8909", () => { expect(mod.findAll("3123 4567 8909").length).toBe(1); });
  it("findAll valid dashed 3123-4567-8909", () => { expect(mod.findAll("3123-4567-8909").length).toBe(1); });
  it("findAll valid colon 3123:4567:8909", () => { expect(mod.findAll("3123:4567:8909").length).toBe(1); });
  it("findAll valid 399876543211", () => { expect(mod.findAll("399876543211").length).toBe(1); });
  it("findAll valid 400123456787", () => { expect(mod.findAll("400123456787").length).toBe(1); });
  it("findAll invalid starting with 1 123456789012", () => { expect(mod.findAll("123456789012").length).toBe(0); });
  it("findAll invalid checksum 1234 5678 9012", () => { expect(mod.findAll("1234 5678 9012").length).toBe(0); });
  it("validateResult valid", () => { expect(mod.validateResult("312345678909")).toBe(true); expect(mod.validateResult("3123 4567 8909")).toBe(true); });
  it("validateResult invalid", () => { expect(mod.validateResult("123456789012")).toBe(false); });
  it("isVerhoeff", () => { expect(mod.isVerhoeffNumber(312345678909)).toBe(true); expect(mod.isVerhoeffNumber(123456789012)).toBe(false); });
  it("analyze", () => { const r=mod.analyze("test 312345678909 end"); expect(r.length).toBe(1); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
