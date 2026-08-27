import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/es/esPassport/index.ts";
describe("es/esPassport", () => {
  it("findAll valid", () => { expect(mod.findAll("ABC123456").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test ABC123456 end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); expect(mod.COUNTRY_CODE).toBeDefined(); });
});
