import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/pl/plPesel/index.ts";
describe("pl/plPesel", () => {
  it("findAll valid 44051401458", () => { expect(mod.findAll("44051401458").length).toBe(1); });
  it("findAll valid 02070803628", () => { expect(mod.findAll("02070803628").length).toBe(1); });
  it("findAll valid 11111111116", () => { expect(mod.findAll("11111111116").length).toBe(1); });
  it("findAll valid also 44051401359", () => { expect(mod.findAll("44051401359").length).toBe(1); });
  it("findAll invalid check digit 44051401459", () => { expect(mod.findAll("44051401459").length).toBe(0); });
  it("findAll invalid 85040812345", () => { expect(mod.findAll("85040812345").length).toBe(0); });
  it("validateResult valid", () => { expect(mod.validateResult("44051401458")).toBe(true); expect(mod.validateResult("02070803628")).toBe(true); });
  it("validateResult invalid checksum", () => { expect(mod.validateResult("44051401459")).toBe(false); });
  it("validateResult invalid length", () => { expect(mod.validateResult("4405140145")).toBe(false); });
  it("analyze", () => { const r=mod.analyze("test 44051401458 end"); expect(r.length).toBe(1); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBe("PL_PESEL"); });
});
