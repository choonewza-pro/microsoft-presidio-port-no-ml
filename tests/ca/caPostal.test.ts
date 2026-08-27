import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/ca/caPostal/index.ts";
describe("ca/caPostal", () => {
  it("findAll valid with space K1A 0A1", () => { expect(mod.findAll("K1A 0A1").length).toBe(1); });
  it("findAll valid no space K1A0A1", () => { expect(mod.findAll("K1A0A1").length).toBe(1); });
  it("findAll valid lowercase k1a 0a1", () => { expect(mod.findAll("k1a 0a1").length).toBe(1); });
  it("findAll valid K1A 0B1", () => { expect(mod.findAll("K1A 0B1").length).toBe(1); });
  it("findAll valid K0A 0A1 rural", () => { expect(mod.findAll("K0A 0A1").length).toBe(1); });
  it("findAll invalid D first letter", () => { expect(mod.findAll("D1A 1A1").length).toBe(0); });
  it("findAll invalid W first letter", () => { expect(mod.findAll("W1A 1A1").length).toBe(0); });
  it("findAll invalid Z first letter", () => { expect(mod.findAll("Z1A 1A1").length).toBe(0); });
  it("findAll invalid D in third pos K1D 1A1", () => { expect(mod.findAll("K1D 1A1").length).toBe(0); });
  it("validateResult", () => { expect(mod.validateResult("K1A 0A1")).toBe(true); expect(mod.validateResult("D1A 1A1")).toBe(false); });
  it("analyze", () => { const r=mod.analyze("test K1A 0A1 end"); expect(Array.isArray(r)).toBe(true); expect(r.length).toBe(1); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
