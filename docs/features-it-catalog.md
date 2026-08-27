# Features Catalog - Italy (IT)

Source: `src/features/it/*/index.ts:1` + `presidio-analyzer/.../it/*.py`

Total: **5 features**

| Entity | Regex | Score | Validate | Context | File | ใช้ทำอะไร | ตัวอย่าง |
|---|---|---|---|---|---|---|---|
| IT_DRIVER_LICENSE | `(([A-Z]{2}\\d{7}[A-Z])\|(U1[BCDEFGHLJKMNPRSTUWYXZ0-9]{7}[A-Z]...` | 0.2 | checksum |  | `src/features/it/itDriverLicense/index.ts:1` | It Driver License | `IT_DRIVE` |
| IT_FISCAL_CODE | `((?:[A-Z][AEIOU][AEIOUX]\|[AEIOU]X{2}\|[B-DF-HJ-NP-TV-Z]{2}[A-...` | 0.3 | checksum |  | `src/features/it/itFiscalCode/index.ts:1` | It Fiscal Code | `IT_FISCA` |
| IT_IDENTITY_CARD | `` | 0.01 | checksum |  | `src/features/it/itIdentityCard/index.ts:1` | It Identity Card | `IT_IDENT` |
| IT_PASSPORT | `[A-Z]{2}\\d{7}` | 0.01 | checksum |  | `src/features/it/itPassport/index.ts:1` | It Passport | `IT_PASSP` |
| IT_VAT_CODE | `([0-9][ _]?){11}` | 0.1 | checksum |  | `src/features/it/itVatCode/index.ts:1` | It Vat Code | `IT_VAT_C` |

See also: `src/features/it/*/index.ts:1` and `presidio-analyzer/.../predefined_recognizers/country_specific/it/*.py`