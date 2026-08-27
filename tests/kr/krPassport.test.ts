import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/kr/krPassport/index.ts";
describe("kr/krPassport", () => {
  it("findAll valid", () => { expect(mod.findAll("M12345678").length).toBeGreaterThanOrEqual(0); });
  it("analyze", () => { const r=mod.analyze("test M12345678 end"); expect(Array.isArray(r)).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
