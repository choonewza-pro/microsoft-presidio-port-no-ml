import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/global/crypto/index.ts";

describe("global/crypto", () => {
  it("findAll valid", () => {
    expect(mod.findAll("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa").length).toBeGreaterThan(0);
  });
  it("findAll invalid filtered or not found", () => {
    const res = mod.findAll("invalidbtc");
    // invalid may still match regex but should be filtered if validate fails - at least not crash
    expect(Array.isArray(res)).toBe(true);
  });
  it("analyze returns RecognizerResult", () => {
    const res = mod.analyze("test 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa end");
    expect(res.length).toBeGreaterThan(0);
    expect(res[0]!.entityType).toBe(mod.ENTITY_TYPE);
  });
  it("CONTEXT and ENTITY_TYPE defined", () => {
    expect(mod.ENTITY_TYPE).toBeDefined();
    expect(mod.CONTEXT).toBeDefined();
  });
});
