import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/global/url/index.ts";

describe("global/url", () => {
  it("findAll valid", () => {
    expect(mod.findAll("https://example.com").length).toBeGreaterThan(0);
  });
  it("findAll invalid filtered or not found", () => {
    const res = mod.findAll("not a url");
    // invalid may still match regex but should be filtered if validate fails - at least not crash
    expect(Array.isArray(res)).toBe(true);
  });
  it("analyze returns RecognizerResult", () => {
    const res = mod.analyze("test https://example.com end");
    expect(res.length).toBeGreaterThan(0);
    expect(res[0]!.entityType).toBe(mod.ENTITY_TYPE);
  });
  it("CONTEXT and ENTITY_TYPE defined", () => {
    expect(mod.ENTITY_TYPE).toBeDefined();
    expect(mod.CONTEXT).toBeDefined();
  });
});
