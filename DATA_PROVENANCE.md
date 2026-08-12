# Muslim Baby Names Catalogue — Data Provenance

## Selected source

The expanded catalogue uses the **Muslim Names Dataset** by Takiuddin Ahmed, published on Hugging Face under **CC0 1.0 Universal**. The dataset card describes approximately 14,585 entries with English transliterations, Arabic spellings, meanings, and male/female classifications. The publisher states that the records were collected from muslimnames.com using an automated scraper.[^source]

## Implementation boundaries

The imported catalogue is treated as a discovery index. The source does not provide a consistent origin taxonomy, authoritative pronunciation, editorial long descriptions, reliable popularity scores, or verified Quranic/uniqueness flags. This release therefore presents the source fields transparently, marks missing enrichment as unavailable, and avoids asserting religious or historical context that is not supplied by the source.

Before production publication, a subject-matter editorial review should validate high-traffic records, sensitive religious references, and any names that have disputed translations or transliterations. This provenance note remains available in the project to support the public Sources & Methodology page.

[^source]: [Takiuddin Ahmed, *Muslim Names Dataset*](https://huggingface.co/datasets/takiuddinahmed/muslim-names-dataset), accessed 2026-08-12. Dataset card: CC0 1.0; approximately 14,585 rows; fields for English name, Arabic name, meaning, and gender.
