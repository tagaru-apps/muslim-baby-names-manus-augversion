# CSV Name Import Guide

Use `csv_to_muslim_names_json.py` to transform a raw CSV list into the source format consumed by the catalogue normalisation pipeline.

## Expected output schema

Every output record follows this structure:

```json
{
  "english_name": "Layla",
  "arabic_name": "ليلى",
  "meaning": "Night beauty",
  "gender": "female",
  "origin": "Arabic",
  "source_url": "https://example.org/source-record"
}
```

The script accepts common CSV header aliases automatically.

| Output field | Required? | Recognised CSV headers |
|---|---|---|
| `english_name` | Yes | `Name`, `English Name`, `Transliteration`, `name_en` |
| `arabic_name` | Yes | `Arabic`, `Arabic Name`, `Arabic Spelling`, `name_ar` |
| `meaning` | Yes | `Meaning`, `Meanings`, `Definition`, `Description` |
| `gender` | Yes | `Gender`, `Sex`, `Type`, `Name Gender` |
| `origin` | Yes | `Origin`, `Heritage`, `Linguistic Origin`, `Cultural Origin` |
| `source_url` | No | `Source URL`, `Source`, `Reference URL`, or `Provenance URL`; must begin with `https://` or `http://` |

Gender values are normalised as follows: `M`, `Male`, and `Boy` become `male`; `F`, `Female`, and `Girl` become `female`; and `U`, `Unisex`, `Neutral`, and `Both` become `unisex`.

The `origin` value must use one of the website’s approved collection labels: **African, Arabic, Hindi, Indonesian, Kurdish, Persian, Quranic, Somali, Turkish,** or **Urdu**. The converter preserves this value as a **source-stated** origin instead of relying on automatic inference.

When a `source_url` is supplied, it is preserved as a per-record provenance link on the individual name profile and its static SEO page. Use a stable public URL that points to the record or source material, not a private spreadsheet or a temporary download link.

## Recommended workflow

First validate an incoming CSV without writing to the project data:

```bash
python3 scripts/csv_to_muslim_names_json.py \
  --input data/raw_names.csv \
  --dry-run
```

The dry run prints a **gender × origin** breakdown, a totals row, the number of supplied provenance URLs, and any unrecognised origin labels before you replace the live source file.

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
  --source-url-column "Reference" \
  --output data/import_review.json
```

By default, the converter skips rows with a missing Arabic spelling or meaning, skips duplicate English names after retaining the first record, and reports invalid genders. Use `--allow-empty-arabic`, `--allow-empty-meaning`, `--default-gender`, or `--keep-duplicates` only after reviewing why the source data needs that exception. Source URLs are optional and blank values are accepted; `--allow-empty-source-url` is available as a compatibility flag for import scripts that declare this policy explicitly.
