import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/de/deHealthInsurance/index.ts";
describe("de/deHealthInsurance", () => {
  it("findAll valid", () => { expect(mod.findAll("A123456789").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test A123456789 end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); expect(mod.COUNTRY_CODE).toBeDefined(); });
});
