import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/kr/krDriverLicense/index.ts";
describe("kr/krDriverLicense", () => {
  it("findAll valid", () => { expect(mod.findAll("11-22-123456-12").length).toBe(1); expect(mod.findAll("112212345612").length).toBe(1); expect(mod.findAll("28 22 123456 12").length).toBe(1); });
  it("findAll invalid region filtered", () => { expect(mod.findAll("99-22-123456-12").length).toBe(0); });
  it("validateResult", () => { expect(mod.validateResult("11-22-123456-12")).toBe(true); expect(mod.validateResult("99-22-123456-12")).toBe(false); });
  it("analyze", () => { const r=mod.analyze("test 11-22-123456-12 end"); expect(r.length).toBe(1); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
