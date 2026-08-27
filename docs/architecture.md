# Architecture - Pure TS

`microsoft-presidio-port` is **Pure TypeScript (Bun)** - **No python, No CV/AI/LLM/model** (`เราจะไม่ใช้ python` + `ไม่รวม cv/ai/llm`)

## Pipeline

```
Text
  → src/features/<country>/<feature>/index.ts:1 (89 regex, 0.01-0.8, validate checksum)
  → src/analyzer/engine.ts:1 AnalyzerEngine (registry 95 entries conf/default_recognizers.yaml:1, context window 50, allowList, dedup)
  → src/anonymizer/engine.ts:1 AnonymizerEngine (TextReplaceBuilder from end, conflict merge, 8 operators)
  → src/structured/engine.ts:1 StructuredEngine (Dict/Array, nested person.name)
```

## Core

* `src/core/sanitize.ts:1` `sanitizeValue(text, replacementPairs)` (`entity_recognizer.py:310` split/join literal)
* `src/core/scores.ts:1` `MIN_SCORE=0, MAX_SCORE=1`
* `src/core/types.ts:1` `RecognizerResult`, `ReplacementPair`
* `src/core/regex.ts:1` `gims` (`global_regex_flags:26` `pattern_recognizer.py:59` DOTALL|MULTILINE|IGNORECASE)

## Features

* `src/features/global/*` 10 + `src/features/th/thTnin` `th_tnin_recognizer.py:50` + `us 15` + `uk 6` + `es 3` + `it 5` + `de 13` + `sg 2`/`au 4`/`ca 2`/`kr 5`/`in 6`/`za 6`/`tr 2`/`se 2`/`ph 3`/`ng 2`/`pl 1`/`fi 1` = **89**
* `docs/features-*-catalog.md` 19 files: `features-global-catalog.md`, `features-th-catalog.md`, `features-us-catalog.md`...

## Anonymizer

* `src/anonymizer/operators/{replace,redact,keep,mask,hash,encrypt,custom}` (`presidio-anonymizer/.../operators/*.py`) + `hash` `sha256(salted)` + `encrypt` `AES-CBC iv16 PKCS7 base64url` (`aes_cipher.py:12`) via `crypto.subtle`/`node:crypto` (pure, no python)
* `src/anonymizer/engine.ts:1` `anonymize(text, analyzerResults, operators)` - `TextReplaceBuilder` from end (`text_replace_builder.py:1`)

## What is NOT included (by design)

* `nlp_engine` `spacy`/`stanza`/`transformers` (`presidio-analyzer/.../nlp_engine/*`), `lm_recognizer.py:1`, `third_party/ahds_recognizer.py:1`, `transformers_recognizer.py:1`, `Medical NER`
* `image` OCR `tesseract_ocr.py:1`/`document_intelligence_ocr.py:1` (needs CV model) - only `bbox` math is pure (not ported)
* `LemmaContextAwareEnhancer` with model (`lemma_context_aware_enhancer.py:1`) - current is simple window 50 (no model)

## Tests

* `tests/<country>/<feature>.test.ts:1` 89 files + `tests/anonymizer`, `tests/analyzer`, `tests/structured` = `367 pass` (`tests/th/thTnin.test.ts:1` 54 tests as baseline)
* `bun test` in `microsoft-presidio-port`
