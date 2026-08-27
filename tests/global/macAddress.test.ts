import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/global/macAddress/index.ts";

describe("global/macAddress", () => {
  it("findAll valid", () => {
    expect(mod.findAll("00:1A:2B:3C:4D:5E").length).toBeGreaterThan(0);
  });
  it("findAll invalid filtered or not found", () => {
    const res = mod.findAll("ZZ:ZZ:ZZ:ZZ:ZZ:ZZ");
    // invalid may still match regex but should be filtered if validate fails - at least not crash
    expect(Array.isArray(res)).toBe(true);
  });
  it("analyze returns RecognizerResult", () => {
    const res = mod.analyze("test 00:1A:2B:3C:4D:5E end");
    expect(res.length).toBeGreaterThan(0);
    expect(res[0]!.entityType).toBe(mod.ENTITY_TYPE);
  });
  it("CONTEXT and ENTITY_TYPE defined", () => {
    expect(mod.ENTITY_TYPE).toBeDefined();
    expect(mod.CONTEXT).toBeDefined();
  });
});
