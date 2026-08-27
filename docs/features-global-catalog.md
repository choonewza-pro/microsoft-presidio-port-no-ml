# Features Catalog - Global

Source: `src/features/global/*/index.ts:1` + `presidio-analyzer/.../global/*.py`

Total: **10 features**

| Entity | Regex | Score | Validate | Context | File | ใช้ทำอะไร | ตัวอย่าง |
|---|---|---|---|---|---|---|---|
| CREDIT_CARD | `(?!1\\d{12}(?!\\d))((4\\d{3})\|(5[0-5]\\d{2})\|(6\\d{3})\|(1\\d...` | 0.3 | checksum | credit, card, visa | `src/features/global/creditCard/index.ts:1` | Credit Card | `4111111111111111` |
| CRYPTO | `(bc1\|[13])[a-zA-HJ-NP-Z0-9]{25,59}` | 0.5 | checksum | wallet, btc, bitcoin | `src/features/global/crypto/index.ts:1` | Crypto | `1A1zP1eP5Qg...` |
| DATE_TIME | `` | 0.5 | regex | date, birthday | `src/features/global/dateTime/index.ts:1` | Date Time | `2023-01-15` |
| EMAIL_ADDRESS | `((([!#$%&'*+\\-/=?^_`{\|}~\\w])\|([!#$%&'*+\\-/=?^_`{\|}~\\w][!...` | 0.5 | checksum | email | `src/features/global/email/index.ts:1` | Email Address | `test@example.com` |
| IBAN_CODE | `(?<![A-Z0-9])([A-Z]{2}[0-9]{2}(?:[ -]?[A-Z0-9]{4}){2,6})((?:...` | 0.5 | checksum | iban, bank, transaction | `src/features/global/iban/index.ts:1` | Iban Code | `DE89370400440532013000` |
| IP_ADDRESS | `` | 0.5 | regex | ip, ipv4, ipv6 | `src/features/global/ipAddress/index.ts:1` | Ip Address | `192.168.1.1` |
| MAC_ADDRESS | `` | 0.6 | checksum | mac, mac address, hardware address | `src/features/global/macAddress/index.ts:1` | Mac Address | `00:1A:2B:3C:4D:5E` |
| PHONE_NUMBER | `` | 0.4 | regex | phone, number, telephone | `src/features/global/phone/index.ts:1` | Phone Number | `+1-212-555-1234` |
| URL | `` | 0.5 | regex | url, website, link | `src/features/global/url/index.ts:1` | Url | `https://example.com` |
| UUID | `[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-...` | 0.5 | checksum | uuid, guid, unique identifier | `src/features/global/uuid/index.ts:1` | Uuid | `550e8400-e29b...` |

See also: `src/features/global/*/index.ts:1` and `presidio-analyzer/.../predefined_recognizers/country_specific/global/*.py`