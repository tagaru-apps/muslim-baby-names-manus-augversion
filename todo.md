# Data & Programmatic SEO Expansion

- [x] Identify a reputable Muslim name data source with clear reuse rights.
- [x] Document the selected source’s provenance, declared licence, and available fields.
- [x] Acquire the source data into the local normalisation workflow.
- [x] Normalise records into the website’s name schema and remove duplicate or incomplete entries.
- [x] Extend route handling and SEO metadata for each individual name.
- [x] Generate SEO sitemap assets for all catalogue pages and individual-name URLs.
- [x] Validate sample routes, build output, mobile presentation, and data counts.
- [ ] Save a final project checkpoint and deliver the expanded catalogue.

## Pronunciation Feature

- [x] Inspect the current normalisation, static-page, and name-detail pronunciation flow.
- [x] Define deterministic respelling and confidence rules using the source transliteration and Arabic-script availability.
- [x] Test phonetic output on a representative sample of approximately 20 names.
- [x] Add generated `phonetic` and `phoneticConfidence` fields to the normalisation output.
- [x] Add guarded Arabic and English browser-speech controls to individual name pages.
- [x] Include phonetic respellings and pronunciation metadata in generated static SEO pages.
- [x] Regenerate the full catalogue, validate representative routes, and report confidence counts.

## Name Sharing

- [x] Inspect the existing name-detail action controls and shareable data fields.
- [x] Add native browser sharing with a clipboard-copy fallback that includes phonetic pronunciation.
- [x] Validate the share control in the detail-page layout and save the completed update.

## Origin Classification

- [x] Inspect source descriptions for direct linguistic and etymological origin signals.
- [x] Define and sample-test deterministic explicit and inferred origin rules.
- [x] Generate `origin` and `originConfidence` values and rebuild the origin list.
- [x] Update detail-page presentation and static SEO structured data for inferred origins.
- [x] Validate at least three origin filter and route combinations and report coverage counts.

## Social Preview Images

- [x] Inspect static name-page generation for current social metadata hooks.
- [x] Design and sample-test a tailored 1200×630 social card composition.
- [x] Generate individual social-preview images and Open Graph/Twitter metadata for all names.
- [x] Validate image and metadata output for representative individual-name pages.

## Enhanced Social Sharing

- [x] Inspect the current preview renderer and detail-page sharing controls.
- [x] Design boy, girl, and Quranic preview-card treatments within the Quiet Courtyard system.
- [x] Add preview-image download and copy-link actions with success feedback.
- [x] Validate representative category previews and the updated detail-page action layout.

### Validation Notes

The production-rendered boy sample uses the deep-teal geometric treatment and the girl sample uses the berry-toned floral treatment; both retained the name, Arabic script, phonetic guide, meaning, and origin line legibly at 1200×630. The Quranic sample used the distinct indigo-and-gold celestial treatment, and its footer was refined to avoid a duplicate Quranic label. The name-detail header was also checked with the Save, Share, Image, and Copy link actions in a single responsive row.

## Square Previews & Shortlist Sharing

- [x] Inspect the existing social-preview renderer, favorites state, and detail-page share controls.
- [x] Design the 1080×1080 Instagram card and combined-shortlist visual treatment.
- [x] Add square preview rendering, Instagram download, and local share-count state.
- [x] Add combined shortlist image export using saved names from local storage.
- [x] Validate the output image dimensions, share count, and shortlist export flow.

## Unique Collection Repair

- [x] Inspect the Unique Muslim names route and identify why its result set is empty or invalid.
- [x] Implement a deterministic unique-name collection from the sourced catalogue.
- [x] Validate navigation and direct access to the restored collection.

## Unique Collection Enrichment

- [x] Inspect existing unique-name data, card presentation, and filter state.
- [x] Define programmatic distinctiveness-note reasons and transparent editorial selection criteria.
- [x] Add distinctiveness annotations and a curated 100-name collection to the generated catalogue.
- [x] Persist unique-collection gender and origin filters in shareable URL parameters.
- [x] Display the curated editorial selection above collection results and validate its filter behaviour.

## Share & Download Repair

- [x] Inspect the current name-page share and social-image download action paths.
- [x] Identify browser compatibility and deployment-route causes of the failure.
- [x] Implement robust native sharing, image download, and fallback behaviour.
- [x] Validate the repaired actions against a running production build.

## Social Card Preview & Story Sharing

- [x] Inspect current social-image generation and name-page action controls.
- [x] Design a 1080×1920 Story card and export preview modal.
- [x] Add phonetic visibility state to generated social card formats.
- [x] Add Story share/download and preview-modal export flows.
- [x] Validate all social-card dimensions, preview states, and export actions.

## Story Motifs & Export History

- [x] Inspect current social-image generation, preview modal, and shortlist page composition.
- [x] Design distinct girl, boy, and Quranic Story motifs plus dedication placement.
- [x] Add personal dedication controls to card preview and exports.
- [x] Persist a concise device-local export history and display it on the shortlist page.
- [x] Validate Story rendering, dedication inclusion, and recent-export carousel behaviour.
