# Features Catalog - UK

Source: `src/features/uk/*/index.ts:1` + `presidio-analyzer/.../uk/*.py`

Total: **6 features**

| Entity | Regex | Score | Validate | Context | File | ใช้ทำอะไร | ตัวอย่าง |
|---|---|---|---|---|---|---|---|
| UK_NHS | `([0-9]{3})[- ]?([0-9]{3})[- ]?([0-9]{4})` | 0.5 | checksum |  | `src/features/uk/nhs/index.ts:1` | Uk Nhs | `UK_NHS` |
| UK_NINO | `(?!bg\|gb\|nk\|kn\|nt\|tn\|zz\|BG\|GB\|NK\|KN\|NT\|TN\|ZZ)([a-ceghj-pr-tw...` | 0.5 | checksum |  | `src/features/uk/nino/index.ts:1` | Uk Nino | `UK_NINO` |
| UK_DRIVING_LICENCE | `[A-Z9]{5}[0-9](?:0[1-9]\|1[0-2]\|5[1-9]\|6[0-2])(?:0[1-9]\|[12][...` | 0.5 | checksum |  | `src/features/uk/ukDrivingLicence/index.ts:1` | Uk Driving Licence | `UK_DRIVI` |
| UK_PASSPORT | `[A-Z]{2}\\d{7}` | 0.1 | checksum |  | `src/features/uk/ukPassport/index.ts:1` | Uk Passport | `UK_PASSP` |
| UK_POSTCODE | `(` | 0.1 | checksum |  | `src/features/uk/ukPostcode/index.ts:1` | Uk Postcode | `UK_POSTC` |
| UK_VEHICLE_REGISTRATION | `` | 0.3 | checksum |  | `src/features/uk/ukVehicleRegistration/index.ts:1` | Uk Vehicle Registration | `UK_VEHIC` |

See also: `src/features/uk/*/index.ts:1` and `presidio-analyzer/.../predefined_recognizers/country_specific/uk/*.py`