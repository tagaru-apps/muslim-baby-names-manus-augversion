# CSV Name Import Guide

Use `csv_to_muslim_names_json.py` to transform a raw CSV list into the source format consumed by the catalogue normalisation pipeline.

## Expected output schema

Every output record follows this structure:

```json
{
  "english_name": "Layla",
  "arabic_name": "ليلى",
  "meaning": "Night beauty",
  "gender": "female"
}
```

The script accepts common CSV header aliases automatically.

| Required output field | Recognised CSV headers |
|---|---|
| `english_name` | `Name`, `English Name`, `Transliteration`, `name_en` |
| `arabic_name` | `Arabic`, `Arabic Name`, `Arabic Spelling`, `name_ar` |
| `meaning` | `Meaning`, `Meanings`, `Definition`, `Description` |
| `gender` | `Gender`, `Sex`, `Type`, `Name Gender` |

Gender values are normalised as follows: `M`, `Male`, and `Boy` become `male`; `F`, `Female`, and `Girl` become `female`; and `U`, `Unisex`, `Neutral`, and `Both` become `unisex`.

## Recommended workflow

First validate an incoming CSV without writing to the project data:

```bash
python3 scripts/csv_to_muslim_names_json.py \
  --input data/raw_names.csv \
  --dry-run
```

Then produce a review file:

```bash
python3 scripts/csv_to_muslim_names_json.py \
  --input data/raw_names.csv \
  --output data/import_review.json
```

After reviewing the resulting names, source provenance, spellings, and meanings, replace the catalogue source file and regenerate the site:

```bash
python3 scripts/csv_to_muslim_names_json.py \
  --input data/raw_names.csv \
  --output data/muslim_names_source.json

pnpm catalogue:build
```

Use explicit mappings if the source uses unusual headers:

```bash
python3 scripts/csv_to_muslim_names_json.py \
  --input data/vendor_export.csv \
  --name-column "Latin form" \
  --arabic-column "Arabic text" \
  --meaning-column "Gloss" \
  --gender-column "Sex" \
  --output data/import_review.json
```

By default, the converter skips rows with a missing Arabic spelling or meaning, skips duplicate English names after retaining the first record, and reports invalid genders. Use `--allow-empty-arabic`, `--allow-empty-meaning`, `--default-gender`, or `--keep-duplicates` only after reviewing why the source data needs that exception.
