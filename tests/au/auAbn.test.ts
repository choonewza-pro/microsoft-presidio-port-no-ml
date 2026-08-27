import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/au/auAbn/index.ts";
describe("au/auAbn", () => {
  it("findAll valid spaced", () => { expect(mod.findAll("51 824 753 556").length).toBe(1); });
  it("findAll valid compact", () => { expect(mod.findAll("51824753556").length).toBe(1); });
  it("findAll invalid checksum filtered", () => { expect(mod.findAll("52 824 753 556").length).toBe(0); expect(mod.findAll("12 345 678 901").length).toBe(0); expect(mod.findAll("00000000560").length).toBe(0); });
  it("analyze valid", () => { const r=mod.analyze("test 51 824 753 556 end"); expect(r.length).toBe(1); expect(r[0]!.score).toBe(1); });
  it("validateResult", () => { expect(mod.validateResult("51 824 753 556")).toBe(true); expect(mod.validateResult("52 824 753 556")).toBe(false); });
  it("replacementPairs dash", () => { expect(mod.validateResult("51-824-753-556")).toBe(true); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
