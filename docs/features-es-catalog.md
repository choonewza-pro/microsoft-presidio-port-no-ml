# Features Catalog - Spain (ES)

Source: `src/features/es/*/index.ts:1` + `presidio-analyzer/.../es/*.py`

Total: **3 features**

| Entity | Regex | Score | Validate | Context | File | ใช้ทำอะไร | ตัวอย่าง |
|---|---|---|---|---|---|---|---|
| ES_NIE | `[X-Z]?[0-9]?[0-9]{7}[-]?[A-Z]` | 0.5 | checksum |  | `src/features/es/esNie/index.ts:1` | Es Nie | `ES_NIE` |
| ES_NIF | `[0-9]?[0-9]{7}[-]?[A-Z]` | 0.5 | checksum |  | `src/features/es/esNif/index.ts:1` | Es Nif | `ES_NIF` |
| ES_PASSPORT | `[A-Z]{3}[0-9]{6}` | 0.05 | checksum |  | `src/features/es/esPassport/index.ts:1` | Es Passport | `ES_PASSP` |

See also: `src/features/es/*/index.ts:1` and `presidio-analyzer/.../predefined_recognizers/country_specific/es/*.py`