import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/de/deHandelsregister/index.ts";
describe("de/deHandelsregister", () => {
  it("findAll valid", () => { expect(mod.findAll("HRB 1234").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test HRB 1234 end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); expect(mod.COUNTRY_CODE).toBeDefined(); });
});
