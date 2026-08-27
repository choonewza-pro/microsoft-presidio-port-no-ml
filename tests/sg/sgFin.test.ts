import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/sg/sgFin/index.ts";
describe("sg/sgFin", () => {
  it("findAll valid S NRIC", () => { expect(mod.findAll("S2740116C").length).toBe(1); });
  it("findAll valid F FIN", () => { expect(mod.findAll("F2346401L").length).toBe(1); });
  it("findAll valid T NRIC", () => { expect(mod.findAll("T7572225C").length).toBe(1); });
  it("findAll valid M FIN", () => { expect(mod.findAll("M4332674T").length).toBe(1); });
  it("findAll invalid checksum filtered", () => { expect(mod.findAll("S1234567A").length).toBe(0); });
  it("findAll invalid prefix filtered", () => { expect(mod.findAll("A1234567Z").length).toBe(0); });
  it("analyze valid", () => { const r=mod.analyze("test S2740116C end"); expect(r.length).toBe(1); expect(r[0]!.score).toBe(1); });
  it("validateResult true", () => { expect(mod.validateResult("S2740116C")).toBe(true); });
  it("validateResult false", () => { expect(mod.validateResult("S1234567A")).toBe(false); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
