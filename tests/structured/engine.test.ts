import { describe, it, expect } from "bun:test";
import { StructuredEngine } from "../../src/structured/engine.ts";

describe("structured engine", () => {
  it("anonymize dict", () => {
    const engine = new StructuredEngine();
    const res = engine.anonymize({name:"Bond", city:"London"}, {entity_mapping:{name:"PERSON"}}, {PERSON:{operator_name:"replace", params:{new_value:"BIP"}}}) as any;
    expect(res.name).toBe("BIP");
    expect(res.city).toBe("London");
  });
  it("anonymize nested", () => {
    const engine = new StructuredEngine();
    const res = engine.anonymize({person:{name:"Alice"}}, {entity_mapping:{"person.name":"PERSON"}}, {PERSON:{operator_name:"redact", params:{}}}) as any;
    expect(res.person.name).toBe("");
  });
  it("anonymize array", () => {
    const engine = new StructuredEngine();
    const res = engine.anonymize([{name:"Bob"}, {name:"Alice"}], {entity_mapping:{name:"PERSON"}}, {PERSON:{operator_name:"replace", params:{new_value:"X"}}}) as any[];
    expect(res[0].name).toBe("X");
  });
});
