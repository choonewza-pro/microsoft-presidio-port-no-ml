import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/sg/sgUen/index.ts";
describe("sg/sgUen", () => {
  it("findAll valid format A", () => { expect(mod.findAll("53125226D").length).toBe(1); });
  it("findAll valid format B", () => { expect(mod.findAll("201434292D").length).toBe(1); });
  it("findAll valid format C T", () => { expect(mod.findAll("T16RF0037C").length).toBe(1); });
  it("findAll valid format C S", () => { expect(mod.findAll("S57TU0392K").length).toBe(1); });
  it("findAll valid lower case", () => { expect(mod.findAll("53125226d").length).toBe(1); expect(mod.findAll("t16rf0037c").length).toBe(1); });
  it("findAll invalid checksum filtered", () => { expect(mod.findAll("53125226A").length).toBe(0); expect(mod.findAll("12345678A").length).toBe(0); });
  it("analyze", () => { const r=mod.analyze("test 53125226D end"); expect(r.length).toBe(1); expect(r[0]!.score).toBe(1); });
  it("validateResult", () => { expect(mod.validateResult("53125226D")).toBe(true); expect(mod.validateResult("53125226A")).toBe(false); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
