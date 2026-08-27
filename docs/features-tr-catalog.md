# Features Catalog - Turkey (TR)

Source: `src/features/tr/*/index.ts:1` + `presidio-analyzer/.../tr/*.py`

Total: **2 features**

| Entity | Regex | Score | Validate | Context | File | ใช้ทำอะไร | ตัวอย่าง |
|---|---|---|---|---|---|---|---|
| TR_LICENSE_PLATE | `\\d{2}\\s?[A-Z]{1,3}\\s?\\d{2,4}` | 0.5 | checksum | license plate | `src/features/tr/trLicensePlate/index.ts:1` | Tr License Plate | `TR_LICEN` |
| TR_NATIONAL_ID | `[1-9][0-9]{10}` | 0.3 | checksum | national id | `src/features/tr/trNationalId/index.ts:1` | Tr National Id | `TR_NATIO` |

See also: `src/features/tr/*/index.ts:1` and `presidio-analyzer/.../predefined_recognizers/country_specific/tr/*.py`