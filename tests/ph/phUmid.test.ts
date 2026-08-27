import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/ph/phUmid/index.ts";
describe("ph/phUmid", () => {
  it("findAll valid", () => { expect(mod.findAll("0111-1234567-8").length).toBe(1); expect(mod.findAll("001112345678").length).toBe(1); expect(mod.findAll("1234-1234567-1").length).toBe(1); });
  it("findAll invalid filtered", () => { expect(mod.findAll("0111-123456-8").length).toBe(0); expect(mod.findAll("0111 1234567 8").length).toBe(0); });
  it("analyze", () => { const r=mod.analyze("test 0111-1234567-8 end"); expect(r.length).toBe(1); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
