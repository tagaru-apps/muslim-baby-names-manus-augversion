#!/usr/bin/env python3
"""Convert a raw baby-name CSV file into the muslim_names_source.json schema.

Required output keys: english_name, arabic_name, meaning, gender.
The converter recognises common input header aliases and can override them with
explicit flags. It preserves Arabic Unicode, normalises gender values, reports
incomplete rows, and prevents duplicate English-name records by default.

Examples:
  python3 scripts/csv_to_muslim_names_json.py --input data/raw_names.csv
  python3 scripts/csv_to_muslim_names_json.py --input names.csv --output data/muslim_names_source.json --default-gender female
  python3 scripts/csv_to_muslim_names_json.py --input names.csv --name-column Name --arabic-column Arabic --meaning-column Meaning --gender-column Sex
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Iterable


FIELD_ALIASES = {
    "english_name": ("english_name", "name", "english", "name_en", "englishname", "transliteration", "romanized_name"),
    "arabic_name": ("arabic_name", "arabic", "name_ar", "arabic_spelling", "arabicname", "arabic_script"),
    "meaning": ("meaning", "meanings", "definition", "description", "name_meaning"),
    "gender": ("gender", "sex", "type", "name_gender"),
}

GENDER_MAP = {
    "m": "male", "male": "male", "boy": "male", "boys": "male", "masculine": "male",
    "f": "female", "female": "female", "girl": "female", "girls": "female", "feminine": "female",
    "u": "unisex", "unisex": "unisex", "neutral": "unisex", "both": "unisex", "all": "unisex",
}


def normalized_header(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", value.strip().lower()).strip("_")


def clean(value: object | None) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip())


def canonical_name(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def normalise_gender(raw_value: str, default_gender: str | None) -> str | None:
    value = clean(raw_value).lower()
    if not value and default_gender:
        value = default_gender
    return GENDER_MAP.get(value)


def resolve_column(headers: Iterable[str], field: str, override: str | None) -> str | None:
    header_list = list(headers)
    if override:
        if override not in header_list:
            raise ValueError(f"Requested --{field.replace('_', '-')} column '{override}' was not found. Available columns: {', '.join(header_list)}")
        return override
    aliases = set(FIELD_ALIASES[field])
    for header in header_list:
        if normalized_header(header) in aliases:
            return header
    return None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert a raw CSV name list into muslim_names_source.json.")
    parser.add_argument("--input", "-i", required=True, type=Path, help="Raw CSV file path.")
    parser.add_argument("--output", "-o", type=Path, default=Path("data/muslim_names_source.json"), help="Output JSON path (default: data/muslim_names_source.json).")
    parser.add_argument("--name-column", help="Exact CSV header for the English name column.")
    parser.add_argument("--arabic-column", help="Exact CSV header for the Arabic spelling column.")
    parser.add_argument("--meaning-column", help="Exact CSV header for the meaning column.")
    parser.add_argument("--gender-column", help="Exact CSV header for the gender column.")
    parser.add_argument("--default-gender", choices=("male", "female", "unisex"), help="Use this gender when a source row leaves gender blank.")
    parser.add_argument("--allow-empty-arabic", action="store_true", help="Keep rows without Arabic spelling (otherwise they are skipped).")
    parser.add_argument("--allow-empty-meaning", action="store_true", help="Keep rows without a meaning (otherwise they are skipped).")
    parser.add_argument("--keep-duplicates", action="store_true", help="Keep repeated English-name records instead of retaining the first.")
    parser.add_argument("--dry-run", action="store_true", help="Validate and report without writing JSON.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.input.exists():
        print(f"Input file not found: {args.input}", file=sys.stderr)
        return 2

    with args.input.open("r", encoding="utf-8-sig", newline="") as handle:
        sample = handle.read(4096)
        handle.seek(0)
        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=",;\t|")
        except csv.Error:
            dialect = csv.excel
        reader = csv.DictReader(handle, dialect=dialect)
        if not reader.fieldnames:
            print("CSV has no header row.", file=sys.stderr)
            return 2

        try:
            columns = {
                "english_name": resolve_column(reader.fieldnames, "english_name", args.name_column),
                "arabic_name": resolve_column(reader.fieldnames, "arabic_name", args.arabic_column),
                "meaning": resolve_column(reader.fieldnames, "meaning", args.meaning_column),
                "gender": resolve_column(reader.fieldnames, "gender", args.gender_column),
            }
        except ValueError as error:
            print(error, file=sys.stderr)
            return 2

        missing_columns = [field for field, column in columns.items() if not column and not (field == "gender" and args.default_gender)]
        if missing_columns:
            print(f"Could not identify required CSV column(s): {', '.join(missing_columns)}. Use the explicit --*-column flags. Available columns: {', '.join(reader.fieldnames)}", file=sys.stderr)
            return 2

        output: list[dict[str, str]] = []
        seen: set[str] = set()
        skipped = Counter()
        warnings: list[str] = []
        for line_number, row in enumerate(reader, start=2):
            name = clean(row.get(columns["english_name"] or ""))
            arabic = clean(row.get(columns["arabic_name"] or ""))
            meaning = clean(row.get(columns["meaning"] or ""))
            gender = normalise_gender(row.get(columns["gender"] or "") if columns["gender"] else "", args.default_gender)
            if not name:
                skipped["missing English name"] += 1
                continue
            if not arabic and not args.allow_empty_arabic:
                skipped["missing Arabic spelling"] += 1
                continue
            if not meaning and not args.allow_empty_meaning:
                skipped["missing meaning"] += 1
                continue
            if not gender:
                skipped["invalid or missing gender"] += 1
                warnings.append(f"Row {line_number}: unsupported gender value '{clean(row.get(columns['gender'] or ''))}' for {name}")
                continue
            key = canonical_name(name)
            if key in seen and not args.keep_duplicates:
                skipped["duplicate English name"] += 1
                continue
            seen.add(key)
            output.append({"english_name": name, "arabic_name": arabic, "meaning": meaning, "gender": gender})

    print("Detected columns:")
    for field, column in columns.items():
        print(f"  {field}: {column or '(default gender)'}")
    print(f"Prepared {len(output):,} valid name records.")
    if skipped:
        print("Skipped rows:")
        for reason, count in skipped.most_common():
            print(f"  {reason}: {count:,}")
    for warning in warnings[:10]:
        print(f"Warning: {warning}")
    if len(warnings) > 10:
        print(f"Warning: {len(warnings) - 10:,} additional gender warnings omitted.")
    if args.dry_run:
        print("Dry run complete; no JSON file written.")
        return 0

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(output):,} records to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
