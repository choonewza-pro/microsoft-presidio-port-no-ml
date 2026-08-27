import { describe, it, expect } from "bun:test";
import * as mod from "../../src/features/ca/caSin/index.ts";
describe("ca/caSin", () => {
  it("findAll valid weak (no delimiter) 130692544", () => { expect(mod.findAll("130692544").length).toBe(1); });
  it("findAll valid medium space 130 692 544", () => { expect(mod.findAll("130 692 544").length).toBe(1); });
  it("findAll valid medium hyphen 130-692-544", () => { expect(mod.findAll("130-692-544").length).toBe(1); });
  it("findAll valid second example 948 584 792", () => { expect(mod.findAll("948 584 792").length).toBe(1); });
  it("findAll invalid checksum 130 692 545", () => { expect(mod.findAll("130 692 545").length).toBe(0); });
  it("findAll invalid reserved first digit 0 -> 046 454 286", () => { expect(mod.findAll("046 454 286").length).toBe(0); });
  it("findAll invalid reserved first digit 8 -> 812 345 678", () => { expect(mod.findAll("812 345 678").length).toBe(0); });
  it("findAll invalid all same 111 111 111", () => { expect(mod.findAll("111 111 111").length).toBe(0); });
  it("findAll invalid mismatched delimiters 046-454 286", () => { expect(mod.findAll("046-454 286").length).toBe(0); });
  it("validateResult valid", () => { expect(mod.validateResult("130 692 544")).toBe(true); expect(mod.validateResult("130692544")).toBe(true); });
  it("validateResult invalid", () => { expect(mod.validateResult("130 692 545")).toBe(false); expect(mod.validateResult("046 454 286")).toBe(false); });
  it("analyze", () => { const r=mod.analyze("test 130-692-544 end"); expect(r.length).toBe(1); expect(r[0]!.value).toBe("130-692-544"); });
  it("meta", () => { expect(mod.ENTITY_TYPE).toBe("CA_SIN"); });
});
