---
name: Glitter Scientific Network Workbench
description: A searchable evidence workbench with an explorable pathogen-genomics resource graph.
colors:
  workbench-ink: "#25343d"
  canvas-white: "#ffffff"
  evidence-muted: "#5b6972"
  cool-surface: "#f3f6f8"
  placeholder: "#737d82"
  relationship-line: "#7d8b94"
  body-strong: "#3e4d56"
  error: "#a8303a"
  teal-dark: "#087f80"
  mobile-shadow: "rgba(37,52,61,.16)"
  rule-line: "#dbe3e8"
  seashell-blue: "#acc0d3"
  peach: "#f6c992"
  coral: "#f96e81"
  rose: "#d396a6"
  teal: "#09a1a1"
  ocean-blue: "#5484a4"
  licence-unknown: "#a63f31"
typography:
  headline: { fontFamily: "IBM Plex Sans, system-ui, sans-serif", fontSize: "24px", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.035em" }
  title: { fontFamily: "IBM Plex Sans, system-ui, sans-serif", fontSize: "19px", fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.025em" }
  body: { fontFamily: "IBM Plex Sans, system-ui, sans-serif", fontSize: "12px", fontWeight: 400, lineHeight: 1.55 }
  control: { fontFamily: "IBM Plex Sans, system-ui, sans-serif", fontSize: "11px", fontWeight: 500, lineHeight: 1.3 }
  label: { fontFamily: "IBM Plex Sans, system-ui, sans-serif", fontSize: "10px", fontWeight: 500, lineHeight: 1.35, letterSpacing: "0.06em" }
rounded:
  square: "0px"
  mark: "1px"
  circular: "999px"
spacing:
  sm: "8px"
  md: "12px"
  lg: "17px"
  xl: "24px"
components:
  search-field: { backgroundColor: "transparent", textColor: "{colors.workbench-ink}", typography: "{typography.body}", rounded: "{rounded.square}", padding: "0 13px", height: "47px" }
  node-toggle: { backgroundColor: "transparent", textColor: "{colors.evidence-muted}", typography: "{typography.label}", rounded: "{rounded.square}", padding: "5px 6px", height: "31px" }
  node-index-row: { backgroundColor: "transparent", textColor: "{colors.workbench-ink}", typography: "{typography.control}", rounded: "{rounded.square}", padding: "10px 12px" }
  resource-action: { backgroundColor: "{colors.workbench-ink}", textColor: "#ffffff", typography: "{typography.body}", rounded: "{rounded.square}", padding: "0 12px", height: "43px" }
---

# Design System: Glitter Scientific Network Workbench

## Overview

**Creative North Star: "The Scientific Network Workbench"**

Glitter opens as a searchable resource directory with a graph view of the same filtered records. A clean white canvas, square institutional rails, compact controls and a persistent status line make it operational from the first viewport. Search and filters lead discovery; the graph explains useful evidence-backed connections. There is no hero, workflow fiction or decorative prose.

Selection binds topology to evidence. Choosing a node recentres and zooms the graph, isolates its one-hop neighbourhood, reveals edge predicates and presents the same neighbours as keyboard-operable inspector controls. Provenance and licence uncertainty remain first-class facts.

**Key Characteristics:**

- Prominent search across titles, descriptions, types, facets and sources.
- Faceted directory as the primary surface and force-directed graph as a peer view.
- Square ruled rails around white list and graph canvases.
- IBM Plex Sans for every interface and evidence role.
- Semantic node colours reinforced by shape and text.
- Shared selection across graph, node index and inspector.
- Deliberately themed focus, selection and scrollbar surfaces.

## Colors

White is the dominant surface. The supplied “Seashell garnet afternoon” palette provides crisp semantic colours without tinting the whole workspace.

### Primary

- **Workbench Ink:** Text, resource nodes, strong rules and status bar.
- **Teal:** Pathogen-scope nodes, focus and inspector cues.

### Secondary

- **Peach:** Source catalogues, paired with diamonds.
- **Ocean Blue:** Resource forms, paired with squares.
- **Rose, Coral and Seashell Blue:** Methods, applications and organisations as labelled circles.
- **Coral:** Explicit assertions, selection rings and active navigation.

### Neutral

- **White:** Graph field and surrounding rails.
- **Evidence Muted:** Counts, labels and secondary copy.
- **Rule Line / Rule Dark:** One-pixel structural separators.

**The Semantic Pairing Rule.** Colour never identifies kind alone: catalogues are peach diamonds, resource types are blue squares, and other kinds are labelled circles.

**The Evidence Coral Rule.** Coral is for explicit graph assertions and active selection; Licence Unknown uses a darker accessible error tone.

**The Teal Focus Rule.** Reserve teal outlines for keyboard focus and coral for current selection.

## Typography

**Display Font:** IBM Plex Sans (system-ui fallback)

**Body Font:** IBM Plex Sans (system-ui fallback)
**Label Font:** IBM Plex Sans (system-ui fallback)

One disciplined grotesk unifies node labels, navigation and evidence. Hierarchy comes from size, weight, case, tracking and rules—not an editorial display face.

### Hierarchy

- **Headline** (600, 24px, 1.05): Selected-node titles.
- **Title** (600, 19px, 1.2): Rail and empty-state headings.
- **Body** (400, 12px, 1.55): Descriptions and explanations.
- **Control** (500, 11px): Index entries and direct actions; search rises to 14px.
- **Label** (500, 10px, uppercase, 0.06em): Kinds, counts and section headers; status metadata may use 9px.

**The One-Voice Rule.** IBM Plex Sans operates the tool and records its evidence.

## Layout

Desktop uses a 56px application bar, a 58px global search band, a flexible workbench and 29px status line. The workbench has a 238px filter rail, a central results or graph surface and a 340px inspector. The graph itself has a 52px relationship toolbar, flexible canvas and 28px help strip.

At 1120px the rails contract to 215px and 300px and the brand descriptor disappears. At 820px the shell becomes document-height: filters move into an off-canvas drawer, result metadata simplifies, and a populated inspector becomes a fixed bottom sheet above the status line. The graph receives 68dvh and retains relationship selection, zoom and fit controls.

The result list and connected-resource list are the keyboard counterpart to direct graph manipulation.

**The Discovery-First Rule.** Search and filters must reveal useful records within seconds; the graph is available as a peer view, never the only route to content.

**The Shared-Selection Rule.** Canvas, index and connected-node list represent one synchronized state.

## Elevation & Depth

Desktop is flat: rules, tonal changes, node outlines and the dotted field create depth without cards. The sole shadow is the mobile inspector lift (`0 -14px 28px rgba(23,35,47,.16)`).

**The Flat Workbench Rule.** Use structure and tonal layering, not desktop card shadows.

## Shapes

Rails, controls, panels and actions are square. Circular geometry is semantic and belongs to most node kinds, the brand mark and status dot. Catalogue diamonds and type squares interrupt the circular field. Nodes have a fine white outline; resources are smallest, catalogues and organisations are anchors, and concept size can reflect connected-resource count. Selection adds an external coral ring without changing semantic fill.

**The Square-Rail Rule.** Never round structural containers, navigation cells, search bands, toolbars or primary actions.

## Components

### Resource Specification

The `/standard` surface is a Read-mode extension of the workbench. It retains
the square application bar, ruled navigation, IBM Plex Sans and white canvas,
then opens into a wide editorial column with a sticky section index. Dense
technical material is expressed through field ledgers, predicate lists and
dark code specimens rather than card grids. API endpoints and contribution
steps are operational links, not decorative documentation.

On mobile the index becomes a compact two-column contents strip, the article
uses the full viewport width, code specimens scroll internally, and endpoint
rows collapse without widening the document.

### Search and Filters

Search occupies a full-width 58px ruled band and matches names, descriptions, resource forms, facets and source catalogues. The filter rail separates resource form, topic/scope, funding state, source and record quality. Active filters appear as removable chips. On mobile the same controls move into a labelled drawer.

### Resource Results

Each ruled result carries a semantic mark, resource form, title, description, facets, source and curated-connection count. Hover and selection use a pale blue-neutral field; selection adds a 3px inset coral rail. Rows remain keyboard operable.

### Graph Toolbar and Canvas

The graph toolbar exposes resource and connection counts, relationship filtering, an optional catalogue-provenance layer, zoom and fit controls. The white canvas uses a 15px pale-blue dotted grid. Selecting recentres, zooms and isolates one-hop neighbours. Directed edges represent curated assertions; resource type, scope and source catalogue are not converted into default graph edges.

### Inspector

The square right rail contains kind, title, description, fact rows, provenance, connected nodes and optional canonical action. A populated inspector receives programmatic focus. On mobile it becomes the lifted bottom sheet.

### Provenance and Licensing

Ruled fact rows keep resource form, resource licence, source metadata licence and retrieval date distinct. Resource licence is “Not recorded” unless explicitly known. Source metadata licence is separately linked and never substituted. Provenance names the catalogue and source-record identifier; the resource landing page remains a separate action.

### Navigation, Status and Browser Surfaces

The active Graph navigation cell combines a tonal field with a 3px coral underline. The 29px ink status bar reports catalogue scope, counts and traceability; mobile retains scope and count. Scrollbars are thin (8px) with a seashell-blue thumb, cool-white track and 2px inset track border. Text selection is ink on peach. Buttons, links and inputs share a 3px teal focus outline with 2px offset. Reduced motion collapses transitions to 0.01ms and disables smooth scrolling.

## Do's and Don'ts

### Do:

- **Do** open on search and filter results with the evidence inspector available immediately.
- **Do** synchronize colour, shape and written kind labels across canvas, filters, index and inspector.
- **Do** expose the selected one-hop neighbourhood and predicates on both canvas and keyboard controls.
- **Do** distinguish source record, retrieval date, source metadata licence and unknown resource licence.
- **Do** preserve square rails, hard rules, IBM Plex Sans and the status line.
- **Do** theme scrollbars, focus, text selection and mobile overlay depth.

### Don't:

- **Don't** restore the former pathway atlas, workflow stages, hero, card grid or editorial display face.
- **Don't** force users through the graph when a list and filters answer the question faster.
- **Don't** use colour alone for kind, selection, assertion, provenance or licence status.
- **Don't** leave selected-edge meaning in hover-only tooltips.
- **Don't** infer resource licence from source metadata licence.
- **Don't** introduce rounded panels or desktop card shadows.
