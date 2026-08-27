import { describe, it, expect } from "bun:test";
import * as replace from "../../src/anonymizer/operators/replace/index.ts";
import * as redact from "../../src/anonymizer/operators/redact/index.ts";
import * as keep from "../../src/anonymizer/operators/keep/index.ts";
import * as mask from "../../src/anonymizer/operators/mask/index.ts";
import * as hash from "../../src/anonymizer/operators/hash/index.ts";
import * as encrypt from "../../src/anonymizer/operators/encrypt/index.ts";
import { AnonymizerEngine } from "../../src/anonymizer/engine.ts";

describe("anonymizer operators", () => {
  it("replace", () => {
    expect(replace.operate("secret", {new_value:"REPLACED"})).toBe("REPLACED");
    expect(replace.operate("secret", {entity_type:"PERSON"})).toBe("<PERSON>");
  });
  it("redact", () => {
    expect(redact.operate("secret", {})).toBe("");
  });
  it("keep", () => {
    expect(keep.operate("secret", {})).toBe("secret");
  });
  it("mask", () => {
    expect(mask.operate("secret", {masking_char:"*", chars_to_mask:3, from_end:false})).toBe("***ret");
    expect(mask.operate("secret", {masking_char:"*", chars_to_mask:2, from_end:true})).toBe("secr**");
  });
  it("hash sha256", async () => {
    const h = await hash.operate("test", {hash_type:"sha256", salt:"1234567890123456"});
    expect(h.length).toBe(64);
    const h2 = await hash.operate("test", {hash_type:"sha256", salt:"1234567890123456"});
    expect(h).toBe(h2);
  });
  it("encrypt/decrypt", async () => {
    const key = "0123456789abcdef"; // 128 bits
    const enc = await encrypt.operate("secret", {key});
    expect(enc.length).toBeGreaterThan(0);
    const dec = await encrypt.decryptOperate(enc, {key});
    expect(dec).toBe("secret");
  });
});

describe("AnonymizerEngine", () => {
  it("anonymize replace", () => {
    const engine = new AnonymizerEngine();
    const res = engine.anonymize("My name is Bond, James Bond", [
      {entity_type:"PERSON", start:11, end:15, score:0.8},
      {entity_type:"PERSON", start:17, end:27, score:0.8},
    ], {PERSON:{operator_name:"replace", params:{new_value:"BIP"}}});
    expect(res.text).toBe("My name is BIP, BIP");
    expect(res.items.length).toBe(2);
  });
  it("anonymize redact + mask", () => {
    const engine = new AnonymizerEngine();
    const res = engine.anonymize("Phone 212-555-1234", [{entity_type:"PHONE_NUMBER", start:6, end:18, score:0.5}], {PHONE_NUMBER:{operator_name:"mask", params:{masking_char:"*", chars_to_mask:8, from_end:false}}});
    expect(res.text).toContain("*");
  });
  it("default operator", () => {
    const engine = new AnonymizerEngine();
    const res = engine.anonymize("secret 123", [{entity_type:"UNKNOWN", start:7, end:10, score:0.5}], {});
    expect(res.text).toContain("<UNKNOWN>");
  });
});
