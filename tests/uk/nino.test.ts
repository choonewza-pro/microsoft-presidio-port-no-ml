import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/uk/nino/index.ts";
describe("uk/nino", () => {
  it("findAll valid", () => { expect(mod.findAll("AB123456C").length).toBeGreaterThan(0); });
  it("analyze valid", () => { const r=mod.analyze("test AB123456C end"); expect(r.length).toBeGreaterThan(0); expect(r[0]!.entityType).toBe(mod.ENTITY_TYPE); });
  it("invalid not crash", () => { expect(Array.isArray(mod.findAll("BG123456A"))).toBe(true); });
  it("meta", () => { expect(mod.COUNTRY_CODE).toBeDefined(); expect(mod.ENTITY_TYPE).toBeDefined(); });
});
