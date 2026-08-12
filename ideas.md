# Muslim Baby Names — Design Direction

## Three initial directions

| Theme Name | Very Brief Intro | Probability |
|---|---|---:|
| Quiet Courtyard | A calm, editorial archive that borrows the rhythm of a sunlit courtyard: warm paper, deep green ink, and craft-led geometry. It treats choosing a name as a reflective family ritual rather than a search task. | 0.07 |
| Atlas of Names | A scholarly, library-inspired catalogue with restrained typographic drama, archival dividers, and a crisp utilitarian discovery layer. It conveys breadth and provenance without becoming cold. | 0.04 |
| Gilded Garden | A more expressive jewel-toned approach with botanical silhouettes and fine gold details, evoking heritage stationery. It makes the experience feel celebratory and intimate. | 0.09 |

## Chosen approach: Quiet Courtyard

### Design Movement

**Contemporary Islamic editorial design** with the warmth of a carefully made family journal. The experience balances scholarly credibility with a quiet sense of occasion, using architectural geometry as a framing language rather than decoration.

### Core Principles

1. **Discovery should feel unhurried.** Search, filtering, and browsing remain immediate, but content is presented in deliberate, breathable sequences.
2. **Trust is visual.** Clear source language, measured typographic hierarchy, meaningful labels, and data that is easy to scan make the site feel worthy of a family’s confidence.
3. **Heritage is abstracted, not literal.** Arches, eight-point stars, and fine linework are used as structural cues, never as clip-art.
4. **Every page is a path back into discovery.** Detail pages lead naturally into related meanings, origins, letters, and saved names.

### Color Philosophy

The base is **warm sandstone paper** rather than clinical white, creating an editorial foundation that softens dense information. **Courtyard emerald** anchors the brand in reassurance and depth. **Antique gold** is reserved for moments of value: selected controls, metadata highlights, and fine dividers. Ink-brown typography maintains a print-like ease without harsh black contrast.

### Layout Paradigm

The homepage uses a **procession of spaces** instead of a centered marketing stack: a wide entry panel, an offset index rail, then framed name collections that open into a full-width editorial confidence section. Interior pages use a compact title band, contextual breadcrumb trail, and two-column browsing workspace with filter controls that collapse gracefully on mobile.

### Signature Elements

1. An **eight-point star aperture** appears as a quiet icon, pattern, and framed counter motif.
2. **Soft arch frames** contain hero media and selected feature cards, with varied corners to avoid a repetitive rounded-card interface.
3. **Gold rule lines and small caps labels** guide scanning like a well-designed reference book.

### Interaction Philosophy

Interactions should reward curiosity without introducing friction. Filters provide immediate visual feedback, saved-name hearts feel personal but restrained, and hover states disclose a name’s metadata before navigation. Keyboard and mobile interactions are direct, accessible, and never hidden behind ornamental motion.

### Animation

Section content can rise into view with a 180–240ms opacity-and-translate transition using `cubic-bezier(0.23, 1, 0.32, 1)`. Name cards lift by 2px on hover; button presses scale to 0.97. Search results and mobile menus use short 180ms transitions from their trigger edge. All nonessential movement is disabled for reduced-motion preferences.

### Typography System

**Fraunces** is the English display face, used for major headings at high contrast and occasional italic emphasis. **DM Sans** carries body copy, navigation, filter labels, and card metadata with high legibility. **Amiri** is used only for Arabic names, set generously and treated as a primary content element rather than a decorative ornament. Labels use DM Sans in tracked uppercase, while cards keep names in Fraunces and meanings in DM Sans.

### Brand Essence

**Muslim Baby Names is the calm, carefully sourced place for families to find a name with meaning, heritage, and a story worth carrying.**

**Personality:** Considered, reassuring, informed.

### Brand Voice

Headlines are reflective but clear; CTAs are gentle invitations; microcopy is factual and transparent. Avoid generic onboarding language or pressure.

> “Find the story a name begins.”

> “Browse names by meaning, origin, or the letter that feels like home.”

### Wordmark & Logo

The mark is a solid emerald **eight-point star aperture** with a narrow open inner arch, evoking a window into a courtyard. The accompanying wordmark uses a customized Fraunces-style serif lockup with a small gold dot detail between the two word groups. The site header will use the standalone mark at an easily recognizable size.

### Signature Brand Color

**Courtyard Emerald — `#0B6E4F`**. This deep, balanced green is the visual anchor across navigation, calls to action, and key interactive states.

## Product model for the initial front-end implementation

The first release will use a local, structured sample name collection to make all browsing and search interactions tangible while remaining ready to replace with an SSG/Firestore data source later. The front-end will demonstrate homepage search, index navigation, letter browsing, gender and origin filtering, individual name profiles, related-name discovery, and browser-local favorites. The app will be built as a static React experience with route templates that mirror the specified public URL structure.

## Style Decisions

- Use an editorial cream and emerald visual system; never use a dark neon treatment, purple gradients, or a generic centered SaaS layout.
- Maintain clear contrast over every image and pattern treatment; the prominent hero visual will stay low-key, so overlayed text is ivory.
- Use arch motifs sparingly to create hierarchy. Avoid uniform rounded panels throughout the interface.
- Keep meaningful Islamic references abstract, respectful, and contextually relevant.
