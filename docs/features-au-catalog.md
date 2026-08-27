# Features Catalog - Australia (AU)

Source: `src/features/au/*/index.ts:1` + `presidio-analyzer/.../au/*.py`

Total: **4 features**

| Entity | Regex | Score | Validate | Context | File | ใช้ทำอะไร | ตัวอย่าง |
|---|---|---|---|---|---|---|---|
| AU_ABN | `` | 0.5 | checksum | australian business number, abn | `src/features/au/auAbn/index.ts:1` | Au Abn | `AU_ABN` |
| AU_ACN | `` | 0.5 | checksum | australian company number, acn | `src/features/au/auAcn/index.ts:1` | Au Acn | `AU_ACN` |
| AU_MEDICARE | `` | 0.5 | checksum | medicare | `src/features/au/auMedicare/index.ts:1` | Au Medicare | `AU_MEDIC` |
| AU_TFN | `` | 0.5 | checksum | tax file number, tfn | `src/features/au/auTfn/index.ts:1` | Au Tfn | `AU_TFN` |

See also: `src/features/au/*/index.ts:1` and `presidio-analyzer/.../predefined_recognizers/country_specific/au/*.py`