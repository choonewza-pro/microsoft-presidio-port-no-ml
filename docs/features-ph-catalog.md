# Features Catalog - Philippines (PH)

Source: `src/features/ph/*/index.ts:1` + `presidio-analyzer/.../ph/*.py`

Total: **3 features**

| Entity | Regex | Score | Validate | Context | File | ใช้ทำอะไร | ตัวอย่าง |
|---|---|---|---|---|---|---|---|
| PH_PASSPORT | `(?:[A-Z]\\d{7}[A-Z]\|[A-Z]{2}\\d{7})` | 0.1 | checksum | passport | `src/features/ph/phPassport/index.ts:1` | Ph Passport | `PH_PASSP` |
| PH_TIN | `\\d{3}-\\d{3}-\\d{3}(?:-\\d{3})?\|\\d{9}\|\\d{12}` | 0.05 | checksum | tin | `src/features/ph/phTin/index.ts:1` | Ph Tin | `PH_TIN` |
| PH_UMID | `\\d{4}-\\d{7}-\\d\|\\d{12}` | 0.5 | checksum | umid | `src/features/ph/phUmid/index.ts:1` | Ph Umid | `PH_UMID` |

See also: `src/features/ph/*/index.ts:1` and `presidio-analyzer/.../predefined_recognizers/country_specific/ph/*.py`