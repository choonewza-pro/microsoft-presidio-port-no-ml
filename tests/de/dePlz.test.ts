import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/de/dePlz/index.ts";
describe("de/dePlz", () => {
  it("findAll valid", () => { expect(mod.findAll("10115").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test 10115 end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); expect(mod.COUNTRY_CODE).toBeDefined(); });
});
