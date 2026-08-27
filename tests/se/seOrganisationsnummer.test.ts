import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/se/seOrganisationsnummer/index.ts";
describe("se/seOrganisationsnummer", () => {
  it("findAll valid", () => { expect(mod.findAll("212000-0142").length).toBe(1); expect(mod.findAll("556703-7485").length).toBe(1); expect(mod.findAll("2120000142").length).toBe(1); });
  it("findAll invalid filtered", () => { expect(mod.findAll("556000-0000").length).toBe(0); expect(mod.findAll("19000309-3393").length).toBe(0); });
  it("validateResult", () => { expect(mod.validateResult("212000-0142")).toBe(true); expect(mod.validateResult("556000-0000")).toBe(false); });
  it("analyze", () => { const r=mod.analyze("test 212000-0142 end"); expect(r.length).toBe(1); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBeDefined(); });
});
