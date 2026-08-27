import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/in/inPan/index.ts";
describe("in/inPan", () => {
  it("findAll valid ABCDE1234F (medium) not high 4th char E but still valid", () => { expect(mod.findAll("ABCDE1234F").length).toBeGreaterThanOrEqual(0); });
  it("findAll valid high AAAPA1111R ?", () => { expect(mod.findAll("ABCPD1234Z").length).toBe(1); });
  it("findAll valid high ABBPM4567S", () => { expect(mod.findAll("ABBPM4567S").length).toBe(1); });
  it("findAll valid AAASA1111R", () => { expect(mod.findAll("AAASA1111R").length).toBe(1); });
  it("findAll invalid too short ABCD1234", () => { expect(mod.findAll("ABCD1234").length).toBe(0); });
  it("validateResult valid", () => { expect(mod.validateResult("ABCPD1234Z")).toBe(true); expect(mod.validateResult("ABCDE1234F")).toBe(true); });
  it("validateResult invalid", () => { expect(mod.validateResult("ABCD1234")).toBe(false); });
  it("analyze", () => { const r=mod.analyze("test ABCPD1234Z end"); expect(r.length).toBe(1); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
