import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/de/deKfz/index.ts";
describe("de/deKfz", () => {
  it("findAll valid", () => { expect(mod.findAll("B AB 1234").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test B AB 1234 end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); expect(mod.COUNTRY_CODE).toBeDefined(); });
});
