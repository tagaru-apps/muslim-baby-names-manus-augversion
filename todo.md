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

## Production Asset Remediation

- [x] Audit all `/manus-storage/` asset references and unresolved analytics placeholders.
- [x] Preserve each visual asset on a deployment-safe hosted URL and replace proxy references.
- [x] Remove the unresolved analytics script from the document head.
- [x] Build the production bundle and verify no dev-only asset or analytics references remain.

## Branded Social Card Assets

- [x] Inspect social-card rendering and existing image-generation loading states.
- [x] Apply the public CDN brand mark and texture to generated social cards.
- [x] Add a visible loading spinner and clearer generation status to preview and export controls.
- [x] Validate branded cards and loading feedback in the running site and production build.

## Configurable Social Cards

- [x] Inspect current export rendering, modal controls, and local export history.
- [x] Design warmer, darker, and minimal export themes with stable cache keys.
- [x] Add theme selection and custom dedication support to preview and export actions.
- [x] Cache recently generated card blobs locally and reuse matching renders.
- [x] Validate theme selection, cache reuse, and custom dedication exports.

### Configurable Card Validation Notes

The completed name-detail page presents the Warm, Dark, and Minimal selector directly below the export controls, with readable labels and selected-state treatment. The dedicated social-image cache keys include name, format, phonetic visibility, dedication, and card style, so exact repeated exports reuse their locally stored image blob while changed settings regenerate safely.

## Unique Card Interaction

- [x] Inspect the unique-name card structure and its existing transition treatment.
- [x] Add a subtle hover motion and editorial accent for unique collection cards.
- [x] Validate hover feedback and reduced-motion behaviour.

## CSV Name Import Utility

- [ ] Inspect the expected muslim_names_source.json field schema.
- [ ] Create a configurable Python CSV-to-JSON converter with row validation and duplicate handling.
- [x] Inspect the expected muslim_names_source.json field schema.
- [x] Create a configurable Python CSV-to-JSON converter with row validation and duplicate handling.
- [x] Test it on a representative sample and document the command and supported columns.

## Origin-Aware CSV Import

- [x] Inspect the converter and generated catalogue origin expectations.
- [x] Add origin column mapping and validation to the converter and example CSV.
- [x] Update import guidance with the approved origin taxonomy and test the revised template.

## Import Reporting & Provenance

- [x] Inspect existing import output, generated data fields, profile provenance UI, and browse sidebar.
- [x] Add source URL mapping, validation, and gender-origin pre-import summary output.
- [x] Carry source URLs into generated name records and display valid provenance links on profiles.
- [x] Add clear origin counts and routes to the desktop and mobile browse filter sidebar.
- [x] Apply the validated Quiet Courtyard archival-card and collection-frame refinements.
- [x] Validate import reporting, provenance display, and origin navigation.

## Name-Page Scroll Restoration

- [x] Inspect client-side route changes from name cards and the current scroll behaviour.
- [x] Restore the top-of-page position when a name detail route opens.
- [x] Validate name selection behaviour at desktop and mobile viewports.

## Editorial Name-Page Introductions

- [x] Inspect generated profile descriptions and static SEO copy for dataset-first wording.
- [x] Replace profile introductions with concise meaning-and-heritage editorial copy.
- [x] Remove individual name-page source-note copy from interactive and static pages.
- [x] Regenerate and validate representative name profiles.

## Google Analytics

- [x] Inspect the document shell for existing analytics scripts or placeholders.
- [x] Add the provided Google Analytics measurement tag once.
- [x] Validate the tracking script in the compiled site.

## Pinterest Publishing Automation

- [ ] Verify the new Pinterest profile and its website-claim status.
- [x] Build the 30-day calendar with board assignments, metadata, links, and creative briefs.
- [x] Prepare a scheduler-ready metadata queue and weekly measurement plan.
- [x] Prepare the first approved Pinterest-format creative batch.
- [x] Obtain confirmation for the five-item first-batch Pinterest publication.
- [x] Make the five confirmed creative image URLs publicly fetchable.
- [x] Add Pinterest-compatible HTML import pages to the server implementation.
- [x] Generate Pinterest-compatible HTML import pages in the static public output.
- [ ] Publish the five confirmed first-batch Pins and record their live links.

## Pinterest API Publishing Dashboard

- [x] Upgrade the project with a protected backend, database, and owner-only access.
- [x] Create Pinterest connection, board, draft, schedule, publication, and audit data models.
- [x] Build the owner-only review queue and individual approval controls.
- [ ] Validate the server-side Pinterest OAuth and API integration boundary with secure credential handling.
- [ ] Validate scheduled publication safeguards, idempotency, and publication-status logging.
- [ ] Validate the protected dashboard and document the Pinterest developer-app setup.
- [ ] Merge the existing public server routes with the OAuth and tRPC runtime entrypoint.
- [ ] Validate authenticated owner access, non-owner denial, and review-queue interactions end to end.

## Pinterest Submission Information Pages

- [x] Inspect the public footer, policy routes, and actual website data practices.
- [x] Add accurate Privacy, Terms, Contact, and Child Safety information pages.
- [x] Link the policy pages from the public footer and route map.
- [x] Validate the live policy routes and footer navigation.

## Publishing Reliability

- [ ] Resolve the reported website publishing timeout before the next live release.

## Pinterest Website Claim

- [x] Inspect the document head for an existing Pinterest verification tag.
- [x] Add the provided Pinterest domain-verification meta tag once.
- [x] Validate the published verification tag before claim completion.

## Cookie Consent and Analytics Privacy

- [x] Inspect the current Google Analytics bootstrap, privacy copy, and public application shell.
- [x] Gate Google Analytics behind explicit analytics consent.
- [x] Add an accessible cookie banner with accept, reject, and preference controls.
- [x] Update the privacy policy to explain consent choices and local preference storage.
- [x] Validate initial analytics gating and responsive banner presentation.
- [x] Verify opt-in loads analytics once and persists the preference across a reload.
- [x] Verify rejection keeps analytics unloaded; the persistent Cookie settings control reopens the choice.
- [x] Add and run a browser-like component test for reopening and changing saved consent preferences.
- [x] Remove the dynamically injected Google Analytics script and runtime state when a visitor revokes a previously accepted choice.
- [x] Validate saved-granted → Cookie settings → reject in both unit and browser-like component tests.
