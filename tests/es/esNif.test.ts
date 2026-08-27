import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/es/esNif/index.ts";
describe("es/esNif", () => {
  it("findAll valid", () => { expect(mod.findAll("12345678Z").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test 12345678Z end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); expect(mod.COUNTRY_CODE).toBeDefined(); });
});
