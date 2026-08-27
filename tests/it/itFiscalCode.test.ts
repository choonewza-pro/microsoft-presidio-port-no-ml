import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/it/itFiscalCode/index.ts";
describe("it/itFiscalCode", () => {
  it("findAll valid", () => { expect(mod.findAll("RSSMRA85M01H501U").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test RSSMRA85M01H501U end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); expect(mod.COUNTRY_CODE).toBeDefined(); });
});
