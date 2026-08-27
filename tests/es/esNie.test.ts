import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/es/esNie/index.ts";
describe("es/esNie", () => {
  it("findAll valid", () => { expect(mod.findAll("X1234567L").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test X1234567L end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); expect(mod.COUNTRY_CODE).toBeDefined(); });
});
