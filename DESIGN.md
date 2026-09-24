---
name: "Glitter"
description: "A warm, evidence-led pathway atlas for public-health pathogen genomics resources."
colors:
  atlas-paper: "#f4f0e6"
  atlas-paper-deep: "#e8e0cf"
  atlas-ink: "#172b30"
  evidence-muted: "#5c6867"
  laboratory-teal: "#176c66"
  laboratory-teal-dark: "#104f4c"
  route-rust: "#c9503d"
  route-yellow: "#d9b74a"
  standard-blue: "#42678a"
  rule-line: "#c9c1b2"
  warm-white: "#fffdf7"
  pathway-surface: "#fbfaf5"
  selected-surface: "#efe8d8"
  licence-unknown: "#9b3e30"
typography:
  display:
    fontFamily: "Newsreader, serif"
    fontSize: "clamp(48px, 5.6vw, 88px)"
    fontWeight: 500
    lineHeight: 0.91
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Newsreader, serif"
    fontSize: "34px"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Newsreader, serif"
    fontSize: "25px"
    fontWeight: 500
  body:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.55
  control:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "15px"
    fontWeight: 400
  label:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    letterSpacing: "0.08em"
rounded:
  square: "0"
  source: "2px"
  symbol: "3px"
  field: "4px"
  tag: "12px"
  chip: "14px"
  round: "50%"
spacing:
  xs: "4px"
  sm: "7px"
  md: "10px"
  lg: "16px"
  xl: "22px"
  2xl: "28px"
components:
  primary-action:
    backgroundColor: "{colors.atlas-ink}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.square}"
    padding: "0 13px"
    height: "46px"
  primary-action-hover:
    backgroundColor: "{colors.laboratory-teal-dark}"
    textColor: "{colors.warm-white}"
  filter-chip:
    backgroundColor: "transparent"
    textColor: "{colors.atlas-ink}"
    rounded: "{rounded.chip}"
    padding: "8px 11px"
  filter-chip-selected:
    backgroundColor: "{colors.laboratory-teal}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.chip}"
    padding: "8px 11px"
  source-mark:
    backgroundColor: "{colors.atlas-ink}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.source}"
    height: "20px"
  search-field:
    backgroundColor: "transparent"
    textColor: "{colors.atlas-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.square}"
    height: "65px"
---

# Design System: Glitter

## Overview

**Creative North Star: "The Working Pathway Atlas"**

Glitter should feel like a well-used scientific atlas laid open on a laboratory bench: warm paper, fine cartographic rules, purposeful annotations and a route that makes a complex field navigable. It is operational rather than promotional. Real resources, workflow stages and evidence occupy the interface from the first viewport.

The visual voice combines editorial authority with laboratory precision. Newsreader gives stage names and headlines a humane, reference-book character; IBM Plex Sans keeps search, filters, metadata and provenance compact and legible. Colour identifies landmarks, while words, icons, shapes and labels carry the meaning.

**Key Characteristics:**
- Warm atlas-paper surfaces with deep blue-green ink.
- A continuous teal pathway, route stops and fine structural rules.
- Editorial display type paired with compact scientific interface type.
- Dense but calm evidence presentation with explicit source and licence language.
- Flat, responsive surfaces that reveal detail without ornamental chrome.

## Colors

The palette is earthy and institutional: teal carries the route, rust marks selection and emphasis, yellow protects focus visibility, and warm neutrals keep a dense evidence interface readable.

### Primary
- **Laboratory Teal:** The pathway line, stage stops, selected filters and trusted positive states. It establishes continuity across the atlas.
- **Deep Laboratory Teal:** Hovered primary actions, icons and quieter high-contrast teal text.

### Secondary
- **Route Rust:** The current-navigation rule, selected-resource rail and unknown-licence warning family.
- **Route Yellow:** The global keyboard focus ring, text selection and one point in the brand mark. Its scarcity makes it conspicuous.

### Tertiary
- **Standard Blue:** The semantic mark for data standards; it is always paired with its rotated-square shape and a text label.

### Neutral
- **Atlas Paper:** The page and detail-panel ground.
- **Deep Atlas Paper:** Interactive hover and open-filter surfaces.
- **Atlas Ink:** Primary text, rules, source marks, footer and primary actions.
- **Evidence Muted:** Secondary labels and supporting metadata.
- **Rule Line:** Internal dividers in stages, facts and relationships.
- **Warm White:** The main workspace and inverse text.
- **Pathway Surface:** A quieter near-white field behind the five-stage route.
- **Selected Surface:** A warm tonal highlight behind the active resource.

### Named Rules

**The Meaning Beyond Colour Rule.** Resource type, selection, status and provenance always retain a text label, icon, shape or rule treatment; colour is reinforcement, never the sole signal.

**The Yellow Is Focus Rule.** Reserve route yellow primarily for keyboard focus and text selection so it remains an unmistakable interaction cue.

## Typography

**Display Font:** Newsreader (with generic serif fallback)  
**Body Font:** IBM Plex Sans (with generic sans-serif fallback)  
**Label Font:** IBM Plex Sans (with generic sans-serif fallback)

**Character:** The serif is editorial, warm and slightly compressed; the sans serif is plain-spoken and technical. Together they make the atlas feel authored without making controls or evidence decorative.

### Hierarchy
- **Display** (medium, fluid 48–88px, 0.91 line-height): The single page thesis. On small screens it resolves to 44px with a 0.96 line-height.
- **Headline** (medium, 34px, 1.04 line-height): Selected-resource titles in the detail panel.
- **Title** (medium, 25px): Workflow-stage names and section-scale headings.
- **Body** (regular, 13px, 1.55 line-height): Descriptions, about copy and supporting explanations; the introductory summary may use the browser-default 16px size.
- **Control** (regular, 15px): Search input and high-attention controls.
- **Label** (semibold, 10px, 0.08em tracking, uppercase): Stage indices, resource types, filter labels and evidence headings.

### Named Rules

**The Two-Voice Rule.** Newsreader names the place or idea; IBM Plex Sans operates it and records the evidence.

**The Evidence Stays Small, Not Faint Rule.** Metadata may be compact, but it keeps sufficient contrast and uses weight, case and spacing to remain scannable.

## Layout

The page is a vertical sequence of masthead, two-column editorial introduction, bordered atlas workspace, evidence strip and dark footer. Desktop content uses narrow viewport-relative gutters: 3.2vw for the masthead and editorial sections, and 1.4vw around the central workspace. The introduction balances a 1.55fr headline column against a smaller summary column.

The workspace begins with a 65px control band and opens into five equal pathway columns, each at least 190px wide. When detail is visible, the route shares the grid with a 360px evidence panel. Fine one-pixel rules define structure; recurring internal gaps and padding cluster around 7–10px for nodes, 16px for stage headers and 20–28px for panels.

At 1050px, the introduction stacks, the detail panel contracts to 320px and route columns may narrow to 175px. At 760px, the navigation becomes a menu, the title is 44px, controls wrap to two rows, the horizontal route turns into a vertical timeline, and the detail panel becomes a fixed focused sheet beneath the 62px masthead. The route remains scrollable on intermediate widths rather than crushing the stage columns.

**The Route Owns the Workspace Rule.** Search and filters may change what is on the pathway, but stage order and route continuity remain visually stable.

## Elevation & Depth

The system is flat by default. Depth comes from tonal layering, dark rules, active rails and the contrast between atlas paper and warm-white workspace surfaces. The only ambient shadow is the open mobile navigation, where separation from the page is necessary; selected resources use a tonal fill rather than elevation.

### Shadow Vocabulary
- **Mobile navigation lift** (`0 14px 24px rgba(23, 43, 48, 0.12)`): Separates the expanded menu from content below the masthead.

### Named Rules

**The Flat Evidence Rule.** Do not use card shadows to make metadata feel important; use hierarchy, rules and tonal fields.

## Shapes

The overall system is rectilinear: square workspaces, square actions and fine straight rules evoke maps, specimens and tabulated evidence. Small radii are functional rather than decorative. Source marks use a 2px corner, semantic square symbols use 3px, select fields use 4px, scope tags use a 12px pill and filter chips use a 14px pill. Circular stage stops, counts and selected-filter badges punctuate the otherwise angular field.

Resource-type symbols vary deliberately: guidance and training use circles; protocols and software use rounded squares; data standards use a rotated square. Keep the icon and text type label together.

**The Structural Corners Rule.** Large containers and primary actions stay square; rounding is reserved for compact tags, controls and semantic marks.

## Components

### Buttons

- **Shape:** Primary actions are square; compact filters are gently pill-shaped.
- **Primary:** Atlas-ink fill with warm-white text, a 46px minimum height and 13px horizontal padding. The label and outward arrow are separated across the full width.
- **Hover / Focus:** Primary actions shift to deep laboratory teal. Every interactive element receives a 3px route-yellow `focus-visible` outline offset by 3px.
- **Filter / Ghost:** The filter trigger is a 65px transparent control separated by a one-pixel rule; its hover and open state use deep atlas paper. Clear and empty-state actions remain underlined or outlined rather than competing with the primary resource action.

### Chips

- **Style:** Filter chips use a one-pixel neutral border, 8px by 11px padding and a 14px pill radius. Scope tags are smaller teal-outlined pills.
- **State:** Selected filters fill with laboratory teal, turn warm white and add a check icon. The active-filter count appears in a rust circular badge.

### Cards / Containers

- **Corner Style:** Resource nodes and major surfaces are square.
- **Background:** Nodes are transparent at rest, atlas paper on hover and selected-surface when active.
- **Shadow Strategy:** No card shadows; rows are separated with one-pixel rule lines.
- **Border:** Each resource starts with a top rule. Active state adds a 3px rust rail at the left edge.
- **Internal Padding:** Resource nodes use a compact 12px by 6px inset and a 7px grid gap.

### Inputs / Fields

- **Style:** Search is a borderless transparent field inside the ruled 65px control bar. Source selection is a 36px warm-white field with a one-pixel neutral border and 4px corners.
- **Focus:** The shared yellow focus-visible outline applies to input, select and button controls. The search input retains its clean borderless interior.
- **Error / Disabled:** No disabled or form-error state is currently implemented. Do not infer one from the licence-warning colour.

### Navigation

The 72px desktop masthead uses compact 13px medium-weight links. The active atlas link receives a 3px rust underline; GitHub includes an outward-arrow icon. Below 760px, the menu button exposes stacked 48px link rows with rules and preserves `aria-expanded` state.

### Resource Node

Each node combines a semantic shape and icon, uppercase type label, clamped resource name and dark source mark. It is a real button with `aria-pressed`; selecting it opens the detail panel and moves focus to that panel.

### Provenance Detail

The detail panel treats provenance and licensing as first-class evidence. Facts use paired label/value rows. The resource licence is shown as “Not recorded” unless explicit evidence exists; the source metadata licence is a separate fact. The provenance link names the catalogue and source-record identifier, and opens the canonical record. Never collapse source metadata licensing into a claim about the resource itself.

### Empty State

The empty result covers the route field with a warm near-white surface, a rust help icon, a concise explanation and a single outlined reset action. Result counts update through a polite live region.

## Do's and Don'ts

### Do:
- **Do** preserve the Plan → Prepare → Sequence → Analyse → Share route and keep real resource nodes visible early.
- **Do** keep source catalogue, retrieval date, source-record identifier and licence uncertainty legible in the detail flow.
- **Do** use the shared 3px yellow focus ring and return focus to the selected resource when the detail panel closes.
- **Do** pair every resource colour with its icon shape and textual type label.
- **Do** respect reduced-motion preferences by removing route drawing and collapsing transitions to effectively instantaneous changes.

### Don't:
- **Don't** turn the atlas into a generic grid of floating cards or marketing panels.
- **Don't** infer a resource licence from the licence attached to its source metadata.
- **Don't** use colour alone to communicate resource type, selected state, provenance or licence status.
- **Don't** introduce soft card shadows or large rounded containers into the flat, ruled evidence system.
- **Don't** shrink the five desktop stages until their content becomes illegible; allow horizontal scrolling or switch to the mobile vertical route.
