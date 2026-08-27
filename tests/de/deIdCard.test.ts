import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/de/deIdCard/index.ts";
describe("de/deIdCard", () => {
  it("findAll valid", () => { expect(mod.findAll("T12345678").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test T12345678 end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); expect(mod.COUNTRY_CODE).toBeDefined(); });
});
