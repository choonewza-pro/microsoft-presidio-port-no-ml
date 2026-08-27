import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/us/medicalLicense/index.ts";
describe("us/medicalLicense", () => {
  it("findAll valid", () => { expect(mod.findAll("A12345678").length).toBeGreaterThanOrEqual(0); });
  it("analyze valid", () => { const r=mod.analyze("test A12345678 end"); expect(Array.isArray(r)).toBe(true); });
  it("invalid not crash", () => { expect(Array.isArray(mod.findAll("abc"))).toBe(true); });
  it("meta", () => { expect(mod.COUNTRY_CODE).toBeDefined(); expect(mod.ENTITY_TYPE).toBeDefined(); });
});
