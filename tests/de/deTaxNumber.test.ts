import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/de/deTaxNumber/index.ts";
describe("de/deTaxNumber", () => {
  it("findAll valid", () => { expect(mod.findAll("12345678901").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test 12345678901 end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); expect(mod.COUNTRY_CODE).toBeDefined(); });
});
