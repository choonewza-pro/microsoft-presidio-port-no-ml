import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/se/sePersonnummer/index.ts";
describe("se/sePersonnummer", () => {
  it("findAll valid", () => { expect(mod.findAll("871220-2384").length).toBe(1); expect(mod.findAll("189004119807").length).toBe(1); expect(mod.findAll("9201232387").length).toBe(1); expect(mod.findAll("199109242397").length).toBe(1); });
  it("findAll invalid Luhn filtered", () => { expect(mod.findAll("900101-1234").length).toBe(0); expect(mod.findAll("19000309-3393").length).toBe(0); });
  it("validateResult", () => { expect(mod.validateResult("871220-2384")).toBe(true); expect(mod.validateResult("900101-1234")).toBe(false); });
  it("analyze", () => { const r=mod.analyze("test 871220-2384 end"); expect(r.length).toBe(1); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
