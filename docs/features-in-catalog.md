# Features Catalog - India (IN)

Source: `src/features/in/*/index.ts:1` + `presidio-analyzer/.../in/*.py`

Total: **6 features**

| Entity | Regex | Score | Validate | Context | File | ใช้ทำอะไร | ตัวอย่าง |
|---|---|---|---|---|---|---|---|
| IN_AADHAAR | `\\b[2-9][0-9]{3} ?[0-9]{4} ?[0-9]{4}\\b` | 0.5 | checksum | aadhaar, uidai | `src/features/in/inAadhaar/index.ts:1` | In Aadhaar | `IN_AADHA` |
| IN_GSTIN | `` | 0.8 | checksum | gstin, gst, goods and services tax | `src/features/in/inGstin/index.ts:1` | In Gstin | `IN_GSTIN` |
| IN_PAN | `` | 0.5 | checksum | permanent account number, pan | `src/features/in/inPan/index.ts:1` | In Pan | `IN_PAN` |
| IN_PASSPORT | `\\b[A-Z][0-9]{7}\\b` | 0.5 | regex | passport | `src/features/in/inPassport/index.ts:1` | In Passport | `IN_PASSP` |
| IN_VEHICLE_REGISTRATION | `\\b[A-Z]{2}\\d{1,2}[A-Z]{1,3}\\d{1,4}\\b` | 0.5 | regex | vehicle | `src/features/in/inVehicleRegistration/index.ts:1` | In Vehicle Registration | `IN_VEHIC` |
| IN_VOTER | `\\b[A-Z]{3}[0-9]{7}\\b` | 0.5 | regex | voter | `src/features/in/inVoter/index.ts:1` | In Voter | `IN_VOTER` |

See also: `src/features/in/*/index.ts:1` and `presidio-analyzer/.../predefined_recognizers/country_specific/in/*.py`