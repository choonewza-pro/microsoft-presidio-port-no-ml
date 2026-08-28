# Analyzer Catalog

Source: `src/analyzer/engine.ts:1` (ported `presidio-analyzer/.../analyzer_engine.py:35` simplified, no NlpEngine/model)

## Class AnalyzerEngine

`src/analyzer/engine.ts:1` `class AnalyzerEngine`

```ts
import { AnalyzerEngine } from "./src/analyzer/engine.ts";
const analyzer = new AnalyzerEngine({supportedLanguages:["en","th"], defaultScoreThreshold:0});
analyzer.analyze("เลขบัตร 1234567890121 email test@example.com", {
  language:"th", // th ต้องใส่ "th" ถึงเจอ TH_TNIN (default_recognizers.yaml:469)
  entities:["TH_TNIN","EMAIL_ADDRESS"], // optional - ถ้าไม่ใส่หาทุก entity
  scoreThreshold:0.5,
  allowList:["test@example.com"], // exact or regex
  allowListMatch:"exact",
  context:["my custom context"]
})
// → [{entityType:"TH_TNIN", start:8, end:21, score:1, value:"1234567890121"}, ...]
```

### Options (ตรง `analyzer_engine.py:172` `analyze`)

| Param | Type | Default | ใช้ทำอะไร |
|---|---|---|---|
| `language` | `string` | `supportedLanguages[0]` | ภาษา (`en`/`th`/`de`...) - `th` ต้องใส่ถึงเจอ `TH_TNIN` |
| `entities` | `string[]` | `all` | กรอง entity (`getSupportedEntities`) |
| `scoreThreshold` | `number` | `0` | กรอง `score >= threshold` (`analyzer_engine.py:354`) |
| `allowList` | `string[]` | `[]` | คำที่อนุญาต (`_remove_allow_list` `analyzer_engine.py:417` exact/regex) |
| `context` | `string[]` | `[]` | คำ context เพิ่มเติม boost `0.85` ถ้าเจอใน `CONTEXT_WINDOW 50` (`src/analyzer/engine.ts:1` `enhanceWithContext`) |
| `maxTextLength` | `number` | `100_000` | เพดานความยาวตัวอักษรสูงสุด ป้องกัน ReDoS/DoS |
| `onMaxLengthExceeded` | `"reject" \| "truncate"` | `"reject"` | พฤติกรรมเมื่อเกินเพดาน: โยน Error หรือตัดข้อความส่วนเกิน |

### Methods

* `getRecognizers(language?)` - `analyzer_engine.py:134` `get_recognizers`
* `getSupportedEntities(language?)` - `analyzer_engine.py:155` `get_supported_entities` → `["TH_TNIN","EMAIL_ADDRESS",...]` 89 entities
* `analyze(text, opts)` - `analyzer_engine.py:168` `analyze` → `RecognizerResult[]` (deduplicate `EntityRecognizer.remove_duplicates` `entity_recognizer.py:276`)

### Pipeline (ไม่มี model)

`getRecognizers` → `rec.analyze(text)` (89 regex) → `enhanceWithContext` (window 50) → `scoreThreshold` → `removeDuplicates` → `allowList` (ตรง `analyzer_engine.py:279`)

See: `src/analyzer/engine.ts:1`, `src/features/index.ts:1` 89 recognizers, `conf/default_recognizers.yaml:1`
