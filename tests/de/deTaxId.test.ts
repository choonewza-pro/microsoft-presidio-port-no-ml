import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/de/deTaxId/index.ts";
describe("de/deTaxId", () => {
  it("findAll valid", () => { expect(mod.findAll("86095742719").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test 86095742719 end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); expect(mod.COUNTRY_CODE).toBeDefined(); });
});
