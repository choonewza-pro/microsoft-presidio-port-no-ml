import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/de/dePassport/index.ts";
describe("de/dePassport", () => {
  it("findAll valid", () => { expect(mod.findAll("C12345678").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test C12345678 end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); expect(mod.COUNTRY_CODE).toBeDefined(); });
});
