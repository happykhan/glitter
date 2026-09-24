---
name: Glitter Scientific Network Workbench
description: A graph-first evidence workbench for pathogen-genomics resources and provenance.
colors:
  workbench-ink: "#17232f"
  canvas-paper: "#f7f4ed"
  panel-white: "#fffdf8"
  evidence-muted: "#657079"
  rule-line: "#ccd0cd"
  rule-dark: "#9ba3a2"
  focus-gold: "#f0b429"
  catalogue-orange: "#d97721"
  type-blue: "#345aa8"
  target-teal: "#13756f"
  method-purple: "#8a4b97"
  application-rose: "#b13d54"
  organization-gold: "#d6a81d"
  verified-red: "#cb4a38"
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

Glitter opens as the knowledge graph itself: a serious analysis surface closer to Cytoscape or Gephi than a catalogue landing page. A warm technical canvas, square institutional rails, compact controls and a persistent status line make it operational from the first viewport. The graph carries the story; there is no hero, workflow fiction or decorative prose.

Selection binds topology to evidence. Choosing a node recentres and zooms the graph, isolates its one-hop neighbourhood, reveals edge predicates and presents the same neighbours as keyboard-operable inspector controls. Provenance and licence uncertainty remain first-class facts.

**Key Characteristics:**

- Populated force-directed graph as the primary surface.
- Square ruled rails around a warm dotted canvas.
- IBM Plex Sans for every interface and evidence role.
- Semantic node colours reinforced by shape and text.
- Shared selection across graph, node index and inspector.
- Deliberately themed focus, selection and scrollbar surfaces.

## Colors

Warm archival neutrals support crisp institutional colours assigned to graph semantics.

### Primary

- **Workbench Ink:** Text, resource nodes, strong rules and status bar.
- **Target Teal:** Pathogen-scope nodes, inspector cue and resource-action hover.

### Secondary

- **Catalogue Orange:** Source catalogues, paired with diamonds.
- **Type Blue:** Resource forms, paired with squares.
- **Method Purple, Application Rose and Organization Gold:** Labelled circular concept nodes.
- **Verified Red:** Explicit assertions and their predicate labels.
- **Focus Gold:** Keyboard focus, selected-node rings and selected index rails.

### Neutral

- **Canvas Paper / Panel White:** Graph field and surrounding rails.
- **Evidence Muted:** Counts, labels and secondary copy.
- **Rule Line / Rule Dark:** One-pixel structural separators.

**The Semantic Pairing Rule.** Colour never identifies kind alone: catalogues are orange diamonds, resource types are blue squares, and other kinds are labelled circles.

**The Evidence Red Rule.** Verified red is for explicit graph assertions; Licence Unknown is only for absent resource-licence evidence.

**The Gold Interaction Rule.** Reserve gold for focus and active selection, not decoration.

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

Desktop uses a 56px application bar, flexible workbench and 29px status line. The workbench has a 255px searchable node index, a central graph with a 420px minimum and a 320px inspector. The graph itself has a 39px toolbar, flexible canvas and 26px help strip.

At 1080px the rails contract to 225px and 285px and the brand descriptor disappears. At 760px the shell becomes document-height: the workbench stacks, the graph receives 58dvh, type toggles scroll horizontally, and the node index opens only for search or the explicit browse control. A populated inspector becomes a fixed 56dvh bottom sheet above the status line.

The node index and connected-node list are the keyboard counterpart to direct graph manipulation. Closing details returns focus to the prior indexed node when present.

**The Graph-First Rule.** Rails may contract or stack, but the populated topology remains the primary working surface.

**The Shared-Selection Rule.** Canvas, index and connected-node list represent one synchronized state.

## Elevation & Depth

Desktop is flat: rules, tonal changes, node outlines and the dotted field create depth without cards. The sole shadow is the mobile inspector lift (`0 -14px 28px rgba(23,35,47,.16)`).

**The Flat Workbench Rule.** Use structure and tonal layering, not desktop card shadows.

## Shapes

Rails, controls, panels and actions are square. Circular geometry is semantic and belongs to most node kinds, the brand mark and status dot. Catalogue diamonds and type squares interrupt the circular field. Nodes have a fine paper outline; resources are smallest, catalogues and organisations are anchors, and concept size can reflect connected-resource count. Selection adds an external gold ring without changing semantic fill.

**The Square-Rail Rule.** Never round structural containers, navigation cells, search bands, toolbars or primary actions.

## Components

### Search and Node Filters

Search is borderless within a 47px ruled band and matches names plus resource descriptions. Seven type toggles combine colour, shape, text and checked state; inactive kinds remain at 42% opacity. On mobile they become a horizontal strip.

### Node Index

Each ruled button carries a semantic mark, truncated name, uppercase kind and chevron. Hover and selection use a warm tonal field; selection adds a 3px inset gold rail. Rows remain keyboard operable.

### Graph Toolbar and Canvas

The 39px toolbar exposes counts, zoom and fit controls as square cells. The warm canvas uses a 15px dotted grid. Selecting recentres over 550ms, zooms to 2.1, dims non-neighbours to 12% and outlines the node in gold. Background click clears isolation. Metadata edges are fine and neutral; explicit assertions are thicker red lines with arrows. Every selected edge shows direction, predicate and “verified” when explicit.

### Inspector

The square right rail contains kind, title, description, fact rows, provenance, connected nodes and optional canonical action. A populated inspector receives programmatic focus. On mobile it becomes the lifted bottom sheet.

### Provenance and Licensing

Ruled fact rows keep resource form, resource licence, source metadata licence and retrieval date distinct. Resource licence is “Not recorded” unless explicitly known. Source metadata licence is separately linked and never substituted. Provenance names the catalogue and source-record identifier; the resource landing page remains a separate action.

### Navigation, Status and Browser Surfaces

The active Graph navigation cell combines a tonal field with a 3px gold underline. The 29px ink status bar reports prototype state, counts and traceability; mobile retains state and count. Scrollbars are thin (8px) with a dark neutral thumb, warm track and 2px inset track border. Text selection is ink on pale gold. Buttons, links and inputs share a 3px gold focus outline with 2px offset. Reduced motion collapses transitions to 0.01ms and disables smooth scrolling.

## Do's and Don'ts

### Do:

- **Do** open on the populated graph with index and evidence inspector framing it.
- **Do** synchronize colour, shape and written kind labels across canvas, filters, index and inspector.
- **Do** expose the selected one-hop neighbourhood and predicates on both canvas and keyboard controls.
- **Do** distinguish source record, retrieval date, source metadata licence and unknown resource licence.
- **Do** preserve square rails, hard rules, IBM Plex Sans and the status line.
- **Do** theme scrollbars, focus, text selection and mobile overlay depth.

### Don't:

- **Don't** restore the former pathway atlas, workflow stages, hero, card grid or editorial display face.
- **Don't** hide topology behind a list-first or marketing-first surface.
- **Don't** use colour alone for kind, selection, assertion, provenance or licence status.
- **Don't** leave selected-edge meaning in hover-only tooltips.
- **Don't** infer resource licence from source metadata licence.
- **Don't** introduce rounded panels or desktop card shadows.
