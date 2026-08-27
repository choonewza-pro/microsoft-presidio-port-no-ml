# Features Catalog - Nigeria (NG)

Source: `src/features/ng/*/index.ts:1` + `presidio-analyzer/.../ng/*.py`

Total: **2 features**

| Entity | Regex | Score | Validate | Context | File | ใช้ทำอะไร | ตัวอย่าง |
|---|---|---|---|---|---|---|---|
| NG_NIN | `\\d{11}` | 0.01 | checksum | nin | `src/features/ng/ngNin/index.ts:1` | Ng Nin | `NG_NIN` |
| NG_VEHICLE_REGISTRATION | `[A-Z]{3}[- ]?\\d{3}[A-Z]{2}` | 0.5 | checksum | vehicle | `src/features/ng/ngVehicleRegistration/index.ts:1` | Ng Vehicle Registration | `NG_VEHIC` |

See also: `src/features/ng/*/index.ts:1` and `presidio-analyzer/.../predefined_recognizers/country_specific/ng/*.py`