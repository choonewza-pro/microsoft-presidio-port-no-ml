# Features Catalog - Korea (KR)

Source: `src/features/kr/*/index.ts:1` + `presidio-analyzer/.../kr/*.py`

Total: **5 features**

| Entity | Regex | Score | Validate | Context | File | ใช้ทำอะไร | ตัวอย่าง |
|---|---|---|---|---|---|---|---|
| KR_BRN | `\\d{3}-\\d{2}-\\d{5}` | 0.1 | checksum | BRN | `src/features/kr/krBrn/index.ts:1` | Kr Brn | `KR_BRN` |
| KR_DRIVER_LICENSE | `\\d{2}[- ]?\\d{2}[- ]?\\d{6}[- ]?\\d{2}` | 0.05 | checksum | driver license | `src/features/kr/krDriverLicense/index.ts:1` | Kr Driver License | `KR_DRIVE` |
| KR_FRN | `\\d{2}(0[1-9]\|1[0-2])(0[1-9]\|[12]\\d\|3[01])(-?)[5-8]\\d{6}` | 0.5 | checksum | frn | `src/features/kr/krFrn/index.ts:1` | Kr Frn | `KR_FRN` |
| KR_PASSPORT | `[MmSsRrOoDd]\\d{3}[A-Za-z]\\d{4}\|[MmSsRrOoDd]\\d{8}` | 0.05 | checksum | passport | `src/features/kr/krPassport/index.ts:1` | Kr Passport | `KR_PASSP` |
| KR_RRN | `\\d{2}(0[1-9]\|1[0-2])(0[1-9]\|[12]\\d\|3[01])(-?)[1-4]\\d{6}` | 0.5 | checksum | Korean RRN, RRN | `src/features/kr/krRrn/index.ts:1` | Kr Rrn | `KR_RRN` |

See also: `src/features/kr/*/index.ts:1` and `presidio-analyzer/.../predefined_recognizers/country_specific/kr/*.py`