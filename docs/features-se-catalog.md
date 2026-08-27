# Features Catalog - Sweden (SE)

Source: `src/features/se/*/index.ts:1` + `presidio-analyzer/.../se/*.py`

Total: **2 features**

| Entity | Regex | Score | Validate | Context | File | ใช้ทำอะไร | ตัวอย่าง |
|---|---|---|---|---|---|---|---|
| SE_ORGANISATIONSNUMMER | `\\d{6}[-]?\\d{4}` | 0.6 | checksum | organisationsnummer | `src/features/se/seOrganisationsnummer/index.ts:1` | Se Organisationsnummer | `SE_ORGAN` |
| SE_PERSONNUMMER | `(\\d{6,8})([-+]?)\\d{4}` | 0.5 | checksum | personnummer | `src/features/se/sePersonnummer/index.ts:1` | Se Personnummer | `SE_PERSO` |

See also: `src/features/se/*/index.ts:1` and `presidio-analyzer/.../predefined_recognizers/country_specific/se/*.py`