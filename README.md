# microsoft-presidio-port

**Pure TypeScript (Bun) port of Microsoft Presidio** - ไม่ใช้ `python` / ไม่รวม `CV/AI/LLM/model` - `Bun` + `Web Crypto` + `Regex` ล้วน

![Bun](https://img.shields.io/badge/Bun-1.4-black) ![Tests](https://img.shields.io/badge/tests-479%20pass-brightgreen) ![Features](https://img.shields.io/badge/features-89%20regex-blue) ![License](https://img.shields.io/badge/license-MIT-green)

> จาก `presidio-analyzer` / `presidio-anonymizer` / `presidio-structured` → `src/features/<country>/<feature>` + `src/anonymizer` + `src/analyzer` + `src/structured` + `src/core`

## Quick Start (TH + EN)

```ts
// 1. Analyzer (89 regex) - ตรง presidio-analyzer/.../analyzer_engine.py:35
import { AnalyzerEngine } from "./src/analyzer/engine.ts";
const analyzer = new AnalyzerEngine({supportedLanguages:["en","th"]});
const results = analyzer.analyze("เลขบัตร 1234567890121 email test@example.com", {language:"th"});
// → [{entityType:"TH_TNIN", start:8, end:21, score:1}, {entityType:"EMAIL_ADDRESS", ...}]

// 2. Anonymizer (8 operators) - ตรง presidio-anonymizer/.../anonymizer_engine.py:21
import { AnonymizerEngine } from "./src/anonymizer/engine.ts";
new AnonymizerEngine().anonymize("เลขบัตร 1234567890121", results, {
  TH_TNIN:{operator_name:"replace", params:{new_value:"<ID>"}},
  EMAIL_ADDRESS:{operator_name:"mask", params:{masking_char:"*", chars_to_mask:5}}
});
// → {text:"เลขบัตร <ID> email *****@example.com", items:[...]}

// 3. Structured (JSON) - ตรง presidio-structured/.../structured_engine.py:16
import { StructuredEngine } from "./src/structured/engine.ts";
new StructuredEngine().anonymize({name:"Bond", city:"London"}, {entity_mapping:{name:"PERSON"}}, {PERSON:{operator_name:"replace", params:{new_value:"BIP"}}})
// → {name:"BIP", city:"London"}

// 4. Thai ID ตรงๆ
import { isValidThaiNationalId, findThaiNationalIds } from "./src/features/th/thTnin/thTninRecognizer.ts";
isValidThaiNationalId("1234567890121") // true (Mod11 th_tnin_recognizer.py:111)
findThaiNationalIds("บัตร 1234567890121") // [{value:"1234567890121", score:1}]
```

## โครงสร้าง

```
src/
  core/           # sanitize.ts:1 (entity_recognizer.py:310), scores.ts:1, types.ts:1, regex.ts:1 gims
  features/<country>/<feature>/index.ts:1  # 89 features <country>/<feature>
    global/creditCard, email, iban, ipAddress, url, crypto, dateTime, macAddress, uuid, phone (10)
    th/thTnin (th_tnin_recognizer.py:50)
    us/* (15) usSsn/usItin/abaRouting..., uk/* (6), es/* (3), it/* (5), de/* (13), sg/*, au/*, ca/*, kr/*, in/*, za/*, tr/*, se/*, ph/*, ng/*, pl/*, fi/*
  analyzer/engine.ts:1  # AnalyzerEngine (registry 95 conf/default_recognizers.yaml:1, window 50, allowList)
  anonymizer/operators/*/index.ts:1  # replace/redact/mask/hash/encrypt(AES-CBC iv16 aes_cipher.py:12)/keep/custom + engine.ts:1
  structured/engine.ts:1  # StructuredEngine Dict/Array nested person.name
docs/
  features-global-catalog.md (10)  features-th-catalog.md (1)  features-us-catalog.md (15) ... features-fi-catalog.md (1) (19 files)
  anonymizer-catalog.md  analyzer-catalog.md  architecture.md
tests/<country>/<feature>.test.ts:1  # 89 files + anonymizer/analyzer/structured = 367 tests
```

## Docs

* **Features:** [Global](docs/features-global-catalog.md) · [TH](docs/features-th-catalog.md) · [US](docs/features-us-catalog.md) · [UK](docs/features-uk-catalog.md) · [ES](docs/features-es-catalog.md) · [IT](docs/features-it-catalog.md) · [DE](docs/features-de-catalog.md) · [SG](docs/features-sg-catalog.md) · [AU](docs/features-au-catalog.md) · [CA](docs/features-ca-catalog.md) · [KR](docs/features-kr-catalog.md) · [IN](docs/features-in-catalog.md) · [ZA](docs/features-za-catalog.md) · [TR](docs/features-tr-catalog.md) · [SE](docs/features-se-catalog.md) · [PH](docs/features-ph-catalog.md) · [NG](docs/features-ng-catalog.md) · [PL](docs/features-pl-catalog.md) · [FI](docs/features-fi-catalog.md)
* **Engines:** [Anonymizer](docs/anonymizer-catalog.md) · [Analyzer](docs/analyzer-catalog.md) · [Architecture](docs/architecture.md) (Pure TS, no python/CV/AI/LLM)

## Test

```bash
bun test              # 367 pass 92 files (thTnin 54 baseline)
bun test tests/th/thTnin.test.ts  # Thai ID only
```

## Pure TS Policy

* ไม่ใช้ `python`, `spacy`, `transformers`, `tesseract`, `LLM`/`CV`/`model` - ใช้ `regex` + `crypto.subtle`/`node:crypto` + `window context` ล้วน
* `hash` `sha256(salted)` + `encrypt` `AES-CBC iv16 PKCS7 base64url` ตรง `presidio-anonymizer` byte-identical

See: `presidio-analyzer`, `presidio-anonymizer`, `presidio-structured` originals
