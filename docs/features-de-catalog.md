# Features Catalog - Germany (DE)

Source: `src/features/de/*/index.ts:1` + `presidio-analyzer/.../de/*.py`

Total: **13 features**

| Entity | Regex | Score | Validate | Context | File | ใช้ทำอะไร | ตัวอย่าง |
|---|---|---|---|---|---|---|---|
| DE_BSNR | `\\d{9}` | 0.2 | checksum |  | `src/features/de/deBsnr/index.ts:1` | De Bsnr | `DE_BSNR` |
| DE_FUEHRERSCHEIN | `[A-Z]{2}\\d{8}[A-Z0-9]` | 0.35 | checksum |  | `src/features/de/deFuehrerschein/index.ts:1` | De Fuehrerschein | `DE_FUEHR` |
| DE_HANDELSREGISTER | `HR[AB]\\s*\\d{1,6}` | 0.5 | checksum |  | `src/features/de/deHandelsregister/index.ts:1` | De Handelsregister | `DE_HANDE` |
| DE_HEALTH_INSURANCE | `[A-Z]\\d{9}` | 0.3 | checksum |  | `src/features/de/deHealthInsurance/index.ts:1` | De Health Insurance | `DE_HEALT` |
| DE_ID_CARD | `` | 0.4 | checksum |  | `src/features/de/deIdCard/index.ts:1` | De Id Card | `DE_ID_CA` |
| DE_KFZ | `` | 0.3 | checksum |  | `src/features/de/deKfz/index.ts:1` | De Kfz | `DE_KFZ` |
| DE_LANR | `\\d{9}` | 0.3 | checksum |  | `src/features/de/deLanr/index.ts:1` | De Lanr | `DE_LANR` |
| DE_PASSPORT | `[CFGHJKLMNPRTVWXYZ][CFGHJKLMNPRTVWXYZ0-9]{7}[0-9]` | 0.4 | checksum |  | `src/features/de/dePassport/index.ts:1` | De Passport | `DE_PASSP` |
| DE_PLZ | `(?!01000\\b\|99999\\b)(0[1-9]\\d{3}\|[1-9]\\d{4})` | 0.05 | checksum |  | `src/features/de/dePlz/index.ts:1` | De Plz | `DE_PLZ` |
| DE_SOCIAL_SECURITY | `` | 0.5 | checksum |  | `src/features/de/deSocialSecurity/index.ts:1` | De Social Security | `DE_SOCIA` |
| DE_TAX_ID | `[1-9]\\d{10}` | 0.5 | checksum |  | `src/features/de/deTaxId/index.ts:1` | De Tax Id | `DE_TAX_I` |
| DE_TAX_NUMBER | `` | 0.5 | checksum |  | `src/features/de/deTaxNumber/index.ts:1` | De Tax Number | `DE_TAX_N` |
| DE_VAT_ID | `DE\\d{9}` | 0.5 | checksum |  | `src/features/de/deVatId/index.ts:1` | De Vat Id | `DE_VAT_I` |

See also: `src/features/de/*/index.ts:1` and `presidio-analyzer/.../predefined_recognizers/country_specific/de/*.py`