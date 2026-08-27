# Features Catalog - Thailand (TH)

Source: `src/features/th/thTnin/index.ts:1` + `src/features/th/thTnin/thTninRecognizer.ts:1` (ported `presidio-analyzer/.../thai/th_tnin_recognizer.py:50`)

Total: **1 feature** - **บัตรประชาชน 13 หลัก**

| Entity | Regex | Score | Validate | Context | File | ใช้ทำอะไร | ตัวอย่าง |
|---|---|---|---|---|---|---|---|
| `TH_TNIN` | `\b[1-9](?:[134][0-9]|2[0-7]|5[0-8]|[67][01234567]|[89][0123456])\d{10}\b` (จังหวัด filter `28,29,59,68,69,78,79,87-89,97-99` ห้าม) | `0.5` → `1.0` ถ้า checksum ผ่าน | `Mod11` `S=13*N1+...+2*N12` `x=S%11` `N13=(11-x)%10` (`th_tnin_recognizer.py:111`) + `sanitizeValue` `replacementPairs` | `Thai National ID, TNIN, เลขประจำตัวประชาชน, เลขบัตรประชาชน, รหัสปชช` (`th_tnin_recognizer.py:57`) | `src/features/th/thTnin/thTninRecognizer.ts:1` `th_tnin_recognizer.py:50` | บัตรประชาชนไทย 13 หลัก | `1234567890121` (valid) `1220000000007` (จันทบุรี 22) |

**Use (Bun):**
```ts
import { AnalyzerEngine } from "../src/analyzer/engine.ts";
new AnalyzerEngine({supportedLanguages:["th"]}).analyze("เลขบัตร 1234567890121", {language:"th"})
// → [{entityType:"TH_TNIN", start:8, end:21, score:1}]
import { isValidThaiNationalId } from "../src/features/th/thTnin/thTninRecognizer.ts";
isValidThaiNationalId("1234567890121") // true
```

See also: `src/features/th/thTnin/thTninRecognizer.ts:1`, `tests/th/thTnin.test.ts:1` 54 tests
