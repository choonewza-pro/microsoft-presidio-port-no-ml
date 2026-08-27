import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/za/zaIdNumber/index.ts";
describe("za/zaIdNumber", () => {
  it("findAll valid", () => { expect(mod.findAll("8001015009087").length).toBe(1); expect(mod.findAll("8001015000086").length).toBe(1); expect(mod.findAll("9202201234088").length).toBe(1); });
  it("findAll invalid Luhn/date filtered", () => { expect(mod.findAll("8001015009086").length).toBe(0); expect(mod.findAll("9913326789285").length).toBe(0); });
  it("validateResult", () => { expect(mod.validateResult("8001015009087")).toBe(true); expect(mod.validateResult("8001015009086")).toBe(false); });
  it("analyze", () => { const r=mod.analyze("test 8001015009087 end"); expect(r.length).toBe(1); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
