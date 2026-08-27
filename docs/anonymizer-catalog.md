# Anonymizer Catalog

Source: `src/anonymizer/operators/*/index.ts:1` + `src/anonymizer/engine.ts:1` (ported from `presidio-anonymizer/.../operators/*.py` and `anonymizer_engine.py:21`)

Total: **8 operators + 1 engine** - Pure TS, no python/CV/AI/LLM

| Operator | Params | Score/File | ใช้ทำอะไร | ตัวอย่าง |
|---|---|---|---|---|
| `replace` | `new_value?: string, entity_type?: string` | `src/anonymizer/operators/replace/index.ts:1` `replace.py:9` | แทนที่ด้วยค่าที่กำหนด, fallback `<ENTITY>` | `operate("secret", {new_value:"REPLACED"})` → `"REPLACED"` |
| `redact` | - | `src/anonymizer/operators/redact/index.ts:1` `redact.py:8` | ลบออกเป็น `""` | `operate("secret")` → `""` |
| `keep` | - | `src/anonymizer/operators/keep/index.ts:1` `keep.py:25` | เก็บค่าเดิม (no-op) | `operate("secret")` → `"secret"` |
| `mask` | `masking_char?: string, chars_to_mask?: number, from_end?: boolean` | `src/anonymizer/operators/mask/index.ts:1` `mask.py:10` | มาสก์ด้วย `*` จากหน้าหรือท้าย | `mask("secret", {masking_char:"*", chars_to_mask:3})` → `"***ret"` |
| `hash` | `hash_type?: "sha256"/"sha512", salt?: string/Uint8Array` | `src/anonymizer/operators/hash/index.ts:1` `hash.py:12` | `sha256(salted_text).hexdigest()` `salt>=16 bytes`, random salt 32 ถ้าไม่ให้ | `await hash.operate("test", {salt:"1234567890123456"})` → `64 hex` |
| `encrypt` | `key: string/Uint8Array (128/192/256 bits)` | `src/anonymizer/operators/encrypt/index.ts:1` `encrypt.py:9` + `aes_cipher.py:12` | `AES-CBC PKCS7 iv16 + base64url(iv+ct)` ตรง Python | `await encrypt.operate("secret", {key:"0123456789abcdef"})` → `base64url` |
| `decrypt` | `key` | `src/anonymizer/operators/encrypt/index.ts:1` `aes_cipher.py:33` | ถอดรหัส `AES-CBC` | `await decryptOperate(enc, {key})` → `"secret"` |
| `custom` | `lambda: (text, params)=>string` | `src/anonymizer/operators/custom/index.ts:1` `custom.py:1` | lambda ใดๆ | `operate("hi", {lambda:(x)=>x.toUpperCase()})` → `"HI"` |

## Engine

`src/anonymizer/engine.ts:1` `class AnonymizerEngine` (ported `anonymizer_engine.py:21`)

```ts
import { AnonymizerEngine } from "./src/anonymizer/engine.ts";
const engine = new AnonymizerEngine();
engine.anonymize("My name is Bond, James Bond", [
  {entity_type:"PERSON", start:11, end:15, score:0.8},
  {entity_type:"PERSON", start:17, end:27, score:0.8},
], {PERSON:{operator_name:"replace", params:{new_value:"BIP"}}})
// → {text:"My name is BIP, BIP", items:[{start:11,end:14,entity_type:"PERSON",text:"BIP",operator:"replace"}]}
```

* Conflict: merge same entity_type overlapping, drop lower score (`anonymizer_engine.py:133`), merge with spaces (`anonymizer_engine.py:220`)
* Default operator: `replace` → `<ENTITY>` if no operators (`anonymizer_engine.py:248`)

See: `src/anonymizer/operators/*/index.ts:1` and `src/anonymizer/engine.ts:1`
