# Features Catalog - South Africa (ZA)

Source: `src/features/za/*/index.ts:1` + `presidio-analyzer/.../za/*.py`

Total: **6 features**

| Entity | Regex | Score | Validate | Context | File | ใช้ทำอะไร | ตัวอย่าง |
|---|---|---|---|---|---|---|---|
| ZA_DRIVER_LICENSE | `\\d{6,10}[A-Z0-9]{2,5}` | 0.3 | checksum | driver | `src/features/za/zaDriverLicense/index.ts:1` | Za Driver License | `ZA_DRIVE` |
| ZA_ID_NUMBER | `\\d{10}[0-2][89]\\d` | 0.2 | checksum | id number | `src/features/za/zaIdNumber/index.ts:1` | Za Id Number | `ZA_ID_NU` |
| ZA_LICENSE_PLATE | `[A-Z]{2,3} \\d{3} \\d{3}` | 0.5 | checksum | license plate | `src/features/za/zaLicensePlate/index.ts:1` | Za License Plate | `ZA_LICEN` |
| ZA_MOBILE_NUMBER | `0[6-8]\\d{8}` | 0.3 | checksum | mobile | `src/features/za/zaMobile/index.ts:1` | Za Mobile Number | `ZA_MOBIL` |
| ZA_PASSPORT | `[ADMT]\\d{8}` | 0.2 | checksum | passport | `src/features/za/zaPassport/index.ts:1` | Za Passport | `ZA_PASSP` |
| ZA_VAT_NUMBER | `4\\d{9}` | 0.3 | checksum | vat | `src/features/za/zaVatNumber/index.ts:1` | Za Vat Number | `ZA_VAT_N` |

See also: `src/features/za/*/index.ts:1` and `presidio-analyzer/.../predefined_recognizers/country_specific/za/*.py`