# Features Catalog - USA (US)

Source: `src/features/us/*/index.ts:1` + `presidio-analyzer/.../us/*.py`

Total: **15 features**

| Entity | Regex | Score | Validate | Context | File | ใช้ทำอะไร | ตัวอย่าง |
|---|---|---|---|---|---|---|---|
| ABA_ROUTING_NUMBER | `` | 0.3 | checksum | aba, routing, abarouting | `src/features/us/abaRouting/index.ts:1` | Aba Routing Number | `ABA_ROUT` |
| MEDICAL_LICENSE | `[abcdefghjklmprstuxABCDEFGHJKLMPRSTUX]{1}[a-zA-Z]{1}\\d{7}\|[...` | 0.4 | checksum | medical, certificate, DEA | `src/features/us/medicalLicense/index.ts:1` | Medical License | `MEDICAL_` |
| US_BANK_NUMBER | `` | 0.05 | checksum | check, account, account# | `src/features/us/usBank/index.ts:1` | Us Bank Number | `US_BANK_` |
| US_CLAIM_NUMBER | `` | 0.35 | regex | claim, billing | `src/features/us/usClaimNumber/index.ts:1` | Us Claim Number | `US_CLAIM` |
| US_DRIVER_LICENSE | `` | 0.3 | checksum | driver, license, permit | `src/features/us/usDriverLicense/index.ts:1` | Us Driver License | `US_DRIVE` |
| US_HEALTH_INSURANCE_MEMBER_ID | `(?=[A-Z0-9-]{6,20}\\b)(?=[A-Z0-9-]*[A-Z])(?=[A-Z0-9-]*\\d)[A...` | 0.1 | regex | member, subscriber, insurance | `src/features/us/usHealthInsuranceMemberId/index.ts:1` | Us Health Insurance Member Id | `US_HEALT` |
| US_ITIN | `` | 0.5 | checksum | individual, taxpayer, itin | `src/features/us/usItin/index.ts:1` | Us Itin | `US_ITIN` |
| US_MBI | `` | 0.5 | checksum | medicare, mbi, beneficiary | `src/features/us/usMbi/index.ts:1` | Us Mbi | `US_MBI` |
| US_NPI | `` | 0.4 | checksum | npi, national provider, provider | `src/features/us/usNpi/index.ts:1` | Us Npi | `US_NPI` |
| US_PASSPORT | `` | 0.1 | checksum | us, united, states | `src/features/us/usPassport/index.ts:1` | Us Passport | `US_PASSP` |
| US_PRESCRIPTION_NUMBER | `` | 0.5 | regex | prescription, pharmacy, medication | `src/features/us/usPrescription/index.ts:1` | Us Prescription Number | `US_PRESC` |
| US_PRIOR_AUTHORIZATION_NUMBER | `` | 0.35 | regex | authorization, auth, preauthorization | `src/features/us/usPriorAuthorization/index.ts:1` | Us Prior Authorization Number | `US_PRIOR` |
| US_PROVIDER_TAX_ID | `` | 0.5 | checksum | tax, tin, ein | `src/features/us/usProviderTaxId/index.ts:1` | Us Provider Tax Id | `US_PROVI` |
| US_REFERRAL_NUMBER | `` | 0.5 | regex | referral, infusion, specialty | `src/features/us/usReferral/index.ts:1` | Us Referral Number | `US_REFER` |
| US_SSN | `` | 0.5 | checksum | social, security, ssn | `src/features/us/usSsn/index.ts:1` | Us Ssn | `US_SSN` |

See also: `src/features/us/*/index.ts:1` and `presidio-analyzer/.../predefined_recognizers/country_specific/us/*.py`