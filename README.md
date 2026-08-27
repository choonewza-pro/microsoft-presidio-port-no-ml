# Microsoft Presidio Port (TypeScript / Bun)

[![Bun](https://img.shields.io/badge/Bun-1.4+-000000?style=flat&logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Tests](https://img.shields.io/badge/Tests-479%20passed-brightgreen?style=flat&logo=checkmarx)](https://github.com)
[![Features](https://img.shields.io/badge/Recognizers-89%20Features-blue?style=flat)](docs/architecture.md)
[![Countries](https://img.shields.io/badge/Coverage-19%20Countries%20+%20Global-orange?style=flat)](docs/architecture.md)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

> **Pure TypeScript port of [Microsoft Presidio](https://github.com/microsoft/presidio)**  
> พอร์ตความสามารถ PII Detection & Anonymization จาก Microsoft Presidio เป็น Pure TypeScript ทำงานบน Bun / Node.js / Browser โดย**ไม่พึ่งพา Python, spaCy, PyTorch, Transformers, LLM หรือโมเดล AI ขนาดใหญ่** อาศัยความเร็วสูงของ Optimized Regex, Checksum Algorithms (Luhn, Mod 11, etc.), Web Crypto และ Context Window Recognition

---

## 🌟 จุดเด่น (Key Features)

* ⚡ **High Performance & Zero-Python**: เริ่มต้นทำงานได้ทันที ไม่ต้องติดตั้ง Python environment หรือดาวน์โหลดโมเดล NLP หลาย GB
* 🎯 **1:1 Presidio Accuracy**: พอร์ต Regex, Logic, Context Words และ Checksum Algorithm (Mod11, Luhn, Verhoeff ฯลฯ) ตรงตามต้นฉบับ
* 🇹🇭 **Full Thai Support**: รองรับเลขบัตรประจำตัวประชาชนไทย (TH_TNIN) พร้อมระบบตรวจสอบ Checksum Mod 11 และรหัสจังหวัด
* 🌍 **Global & Country-Specific**: รองรับ 89 PII Recognizers ครอบคลุม Global และ 19 ประเทศ
* 🔒 **8 Anonymizer Operators**: รองรับ `replace`, `redact`, `mask`, `hash` (SHA-256 with salt), `encrypt` (AES-CBC), `decrypt`, `keep`, `custom`
* 🧩 **Structured Data Anonymization**: ปิดบังข้อมูลใน JSON Object / Array (Nested path เช่น `user.profile.idcard`) ได้โดยตรง

---

## 📦 การติดตั้งและการใช้งาน (Installation & Quick Start)

### ข้อกำหนดเบื้องต้น
* [Bun](https://bun.sh) (แนะนำ v1.1+) หรือ Node.js

```bash
# ติดตั้ง dependencies
bun install
```

---

## 🚀 ตัวอย่างการใช้งาน (Usage Examples)

### 1. ตรวจจับข้อมูล PII ด้วย AnalyzerEngine

```ts
import { AnalyzerEngine } from "./src/analyzer/engine.ts";

const analyzer = new AnalyzerEngine({ supportedLanguages: ["en", "th"] });

// วิเคราะห์ข้อความที่มี PII หลากหลายรูปแบบ
const text = "คุณสมชาย เลขบัตร 1234567890121 อีเมล somchai@example.com เบอร์โทร 081-234-5678";
const results = analyzer.analyze(text, { language: "th" });

console.log(results);
// [
//   { entityType: "TH_TNIN", start: 17, end: 30, score: 1 },
//   { entityType: "EMAIL_ADDRESS", start: 37, end: 56, score: 1 },
//   { entityType: "PHONE_NUMBER", start: 66, end: 78, score: 0.85 }
// ]
```

### 2. ปิดบังข้อมูล (Anonymization) ด้วย AnonymizerEngine

```ts
import { AnonymizerEngine } from "./src/anonymizer/engine.ts";

const anonymizer = new AnonymizerEngine();

const anonymized = anonymizer.anonymize(
  text,
  results, // ผลลัพธ์จาก AnalyzerEngine
  {
    TH_TNIN: {
      operator_name: "replace",
      params: { new_value: "<THAI_ID>" }
    },
    EMAIL_ADDRESS: {
      operator_name: "mask",
      params: { masking_char: "*", chars_to_mask: 5, from_end: false }
    },
    PHONE_NUMBER: {
      operator_name: "redact",
      params: {}
    }
  }
);

console.log(anonymized.text);
// "คุณสมชาย เลขบัตร <THAI_ID> อีเมล *****ai@example.com เบอร์โทร "
```

### 3. จัดการข้อมูลโครงสร้าง JSON ด้วย StructuredEngine

```ts
import { StructuredEngine } from "./src/structured/engine.ts";

const structuredEngine = new StructuredEngine();

const userData = {
  id: 101,
  profile: {
    fullName: "John Doe",
    nationalId: "1234567890121",
    contact: {
      email: "john.doe@company.org"
    }
  }
};

const sanitized = structuredEngine.anonymize(
  userData,
  {
    entity_mapping: {
      "profile.nationalId": "TH_TNIN",
      "profile.contact.email": "EMAIL_ADDRESS"
    }
  },
  {
    TH_TNIN: { operator_name: "replace", params: { new_value: "[ID_REDACTED]" } },
    EMAIL_ADDRESS: { operator_name: "mask", params: { masking_char: "*", chars_to_mask: 4 } }
  }
);

console.log(sanitized);
/*
{
  id: 101,
  profile: {
    fullName: "John Doe",
    nationalId: "[ID_REDACTED]",
    contact: {
      email: "****.doe@company.org"
    }
  }
}
*/
```

### 4. ใช้งาน Recognizer เฉพาะทางแบบ Standalone (เช่น บัตรประชาชนไทย)

```ts
import { isValidThaiNationalId, findThaiNationalIds } from "./src/features/th/thTnin/thTninRecognizer.ts";

// ตรวจสอบความถูกต้องของเลขบัตร (Format + Checksum Mod 11 + รหัสจังหวัด)
const isValid = isValidThaiNationalId("1234567890121"); // true

// ค้นหาเลขบัตรประชาชนทั้งหมดในข้อความ
const matches = findThaiNationalIds("เอกสารอ้างอิง: 1234567890121 และ 9876543210123");
// matches -> [{ value: "1234567890121", start: 16, end: 29, score: 1 }]
```

---

## 🛠 Operators ที่รองรับใน Anonymizer

| Operator | การทำงาน | พารามิเตอร์ตัวอย่าง |
| :--- | :--- | :--- |
| `replace` | แทนที่ข้อความด้วยค่าที่กำหนด | `{ new_value: "<REDACTED>" }` |
| `redact` | ลบข้อความ PII ออกทั้งหมด | `{}` |
| `mask` | ซ่อนตัวอักษรบางส่วนด้วยสัญลักษณ์ | `{ masking_char: "*", chars_to_mask: 4, from_end: true }` |
| `hash` | แฮชข้อความด้วย SHA-256 | `{ hash_type: "sha256", salt: "my-salt" }` |
| `encrypt` | เข้ารหัสแบบ AES-CBC (PKCS7, Base64) | `{ key: "16-or-32-byte-key" }` |
| `decrypt` | ถอดรหัสข้อความที่ถูกเข้ารหัสด้วย AES-CBC | `{ key: "16-or-32-byte-key" }` |
| `keep` | คงค่าเดิมไว้ ไม่ทำการเปลี่ยนแปลง | `{}` |
| `custom` | ปรับแต่งการแปลงค่าด้วยฟังก์ชัน JavaScript | `{ lambda: (text) => text.toUpperCase() }` |

---

## 🗺️ ตารางความครอบคลุม Recognizers (89 Features)

| ขอบเขต / ประเทศ | รหัส | จำนวน Features | ตัวอย่าง PII ที่ตรวจจับ | เอกสารอ้างอิง |
| :--- | :--- | :---: | :--- | :--- |
| **Global** | `global` | 10 | Email, Credit Card, IBAN, IP Address, URL, Crypto, Phone, Date, MAC, UUID | [Catalog](docs/features-global-catalog.md) |
| **ไทย** | `th` | 1 | Thai National ID (TNIN) | [Catalog](docs/features-th-catalog.md) |
| **สหรัฐอเมริกา** | `us` | 15 | SSN, ITIN, Passport, Driver License, Bank Routing, DEA, EIN... | [Catalog](docs/features-us-catalog.md) |
| **เยอรมนี** | `de` | 13 | Tax ID, Driver License, Passport, Identity Card, Postal Code... | [Catalog](docs/features-de-catalog.md) |
| **สหราชอาณาจักร**| `uk` | 6 | NHS, NINO, Driver License, Postcode... | [Catalog](docs/features-uk-catalog.md) |
| **อิตาลี** | `it` | 5 | Codice Fiscale, Driver License, Passport, Identity Card... | [Catalog](docs/features-it-catalog.md) |
| **อินเดีย** | `in` | 5 | Aadhaar, PAN, Passport, Vehicle Registration... | [Catalog](docs/features-in-catalog.md) |
| **แอฟริกาใต้** | `za` | 5 | ID Number, Passport, Tax Number... | [Catalog](docs/features-za-catalog.md) |
| **สเปน** | `es` | 3 | DNI, NIE, NIF... | [Catalog](docs/features-es-catalog.md) |
| **ออสเตรเลีย** | `au` | 3 | TFN, Medicare, ABN... | [Catalog](docs/features-au-catalog.md) |
| **เกาหลีใต้** | `kr` | 3 | RRN, Driver License, Passport... | [Catalog](docs/features-kr-catalog.md) |
| **ฟิลิปปินส์** | `ph` | 3 | SSS, TIN, PhilHealth... | [Catalog](docs/features-ph-catalog.md) |
| **แคนาดา** | `ca` | 2 | SIN, Driver License | [Catalog](docs/features-ca-catalog.md) |
| **สิงคโปร์** | `sg` | 2 | NRIC/FIN, UEN | [Catalog](docs/features-sg-catalog.md) |
| **สวีเดน** | `se` | 2 | Personal Identity Number, Organization Number | [Catalog](docs/features-se-catalog.md) |
| **ตุรกี** | `tr` | 2 | Turkish Identity Number, License Plate | [Catalog](docs/features-tr-catalog.md) |
| **ไนจีเรีย** | `ng` | 2 | NIN, Bank Verification Number (BVN) | [Catalog](docs/features-ng-catalog.md) |
| **โปแลนด์** | `pl` | 1 | PESEL | [Catalog](docs/features-pl-catalog.md) |
| **ฟินแลนด์** | `fi` | 1 | Finnish Personal Identity Code (HETU) | [Catalog](docs/features-fi-catalog.md) |

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```text
microsoft-presidio-port/
├── src/
│   ├── core/                  # Utility กลาง: sanitize, scores, regex, types
│   ├── features/              # 89 Recognizers แยกตามหมวดหมู่ประเทศ (<country>/<feature>)
│   │   ├── global/            # creditCard, email, iban, ipAddress, phone ฯลฯ
│   │   ├── th/                # thTnin (เลขประจำตัวประชาชนไทย)
│   │   └── ... (18 ประเทศ)
│   ├── analyzer/              # AnalyzerEngine (Context Boost, Window Score, AllowList)
│   ├── anonymizer/            # AnonymizerEngine & Operators (replace, mask, encrypt ฯลฯ)
│   └── structured/            # StructuredEngine สำหรับ Nested JSON / Object / Array
├── docs/                      # แคตตาล็อกเอกสารแยกแต่ละประเทศและ Engine
├── tests/                     # Test suites ครบ 89 features และทุก Engine (479 tests)
├── package.json
└── tsconfig.json
```

---

## 🧪 การทดสอบ (Testing)

โปรเจกต์นี้มี Unit Test ครอบคลุม 479 รายการใน 92 Test Files:

```bash
# รันชุดทดสอบทั้งหมด
bun test

# รันเฉพาะฟีเจอร์ไทย (Thai National ID)
bun test tests/th/thTnin.test.ts

# รันโหมด Watch สำหรับพัฒนา
bun test --watch
```

---

## 📚 เอกสารเพิ่มเติม (Documentation)

* **Architecture Overview**: [docs/architecture.md](docs/architecture.md)
* **Analyzer Engine Specification**: [docs/analyzer-catalog.md](docs/analyzer-catalog.md)
* **Anonymizer Engine Specification**: [docs/anonymizer-catalog.md](docs/anonymizer-catalog.md)
* **Country Catalogs**: ดูรายละเอียด Recognizer แต่ละประเทศได้ในโฟลเดอร์ [`docs/`](docs/)

---

## 📄 ใบอนุญาต (License)

โปรเจกต์นี้เผยแพร่ภายใต้ใบอนุญาต **MIT License** ดูรายละเอียดเพิ่มเติมได้ที่ไฟล์ `LICENSE`
