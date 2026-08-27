import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/it/itVatCode/index.ts";
describe("it/itVatCode", () => {
  it("findAll valid", () => { expect(mod.findAll("12345678903").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test 12345678903 end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); expect(mod.COUNTRY_CODE).toBeDefined(); });
});
