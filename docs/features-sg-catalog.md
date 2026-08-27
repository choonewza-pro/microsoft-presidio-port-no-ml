# Features Catalog - Singapore (SG)

Source: `src/features/sg/*/index.ts:1` + `presidio-analyzer/.../sg/*.py`

Total: **2 features**

| Entity | Regex | Score | Validate | Context | File | ใช้ทำอะไร | ตัวอย่าง |
|---|---|---|---|---|---|---|---|
| SG_NRIC_FIN | `` | 0.5 | checksum | fin, fin#, nric | `src/features/sg/sgFin/index.ts:1` | Sg Nric Fin | `SG_NRIC_` |
| SG_UEN | `` | 0.3 | checksum | uen, unique entity number, business regi... | `src/features/sg/sgUen/index.ts:1` | Sg Uen | `SG_UEN` |

See also: `src/features/sg/*/index.ts:1` and `presidio-analyzer/.../predefined_recognizers/country_specific/sg/*.py`