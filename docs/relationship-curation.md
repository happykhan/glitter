# Relationship curation

Glitter relationships are discovery assertions, not co-occurrence guesses. Add
an edge only when following it helps a user understand, choose or use another
resource.

## Useful joins

| Subject | Predicate | Object | Use to a visitor |
|---|---|---|---|
| Publication | `describes` | Software, protocol, dataset or standard | Move from evidence to the usable resource |
| Publication | `mentions` | Software, protocol, dataset or standard | Find a materially discussed resource without claiming it is the paper's main subject |
| Protocol or workflow | `uses` | Software, instrument or standard | Identify what is needed to execute the procedure |
| Software service | `uses` | Software | Discover a documented analysis component without conflating the service with that tool |
| Software or workflow | `acceptsInput` | Data or format concept | Check whether existing inputs are compatible |
| Software or workflow | `producesOutput` | Data or format concept | Plan downstream interoperability |
| Software | `implements` | Standard or method | Find a practical implementation |
| Resource | `conformsTo` | Standard | Check a stated compatibility claim |
| Standard | `mapsTo` | Standard | Find a documented semantic or field mapping |
| Training resource | `teaches` | Software, protocol, method or standard | Find material for learning the resource |
| Funding opportunity | `offeredBy` | Organisation | Trace the call to the responsible funder |
| Resource | `maintainedBy` | Organisation | Identify stewardship without treating a catalogue as ownership |

`cataloguedBy` records discovery provenance. It is hidden from the default
graph because it says where a record was found, not how two scientific
resources interoperate.

## First curated paths

- Contextual data: the DataHarmonizer paper describes the software; the
  software implements the PHA4GE SARS-CoV-2, mpox and wastewater contextual
  data specifications.
- AMR: the AMRColab paper describes the AMRColab project; AMRColab uses
  AMRFinderPlus and hAMRonization; hAMRonization implements its separately
  identified AMR detection specification.
- Typing: chewBBACA produces a cgMLST allele matrix that ReporTree accepts
  **after** `ExtractCgMLST --t 0` replaces missing-call codes with zero. The
  prepared matrix is a supporting format concept, not a claim that raw
  chewBBACA output is directly compatible.

These examples are stored in `data/seed/graph-paths.json` alongside their
source URLs and locators. The map and resource inspector show verified
connections by default. Proposed, disputed and retracted assertions remain
available in the data API but are not drawn as established links.

Pathogenwatch provides a service-level example in
`data/seed/pathogenwatch-tools.json`: `uses` links its documented analysis
components to the platform. A component's presence does not mean every genome
receives that analysis. For example, SISTR is Salmonella-specific, Kleborate is
Klebsiella-focused, and the optional Shovill service handles short-read
assembly. The Kleborate-to-Kaptive edge has its own source evidence. Genotyphi
is not linked to the upstream repository as a `uses` edge because Pathogenwatch
documents an in-house implementation of that method.

## Evidence rule

Every curated relationship should include:

- a stable identifier;
- one canonical direction;
- at least one evidence URL;
- a locator such as an abstract, methods section, README heading or call page;
- assertion date and review status.

Use `verified` only when the evidence directly supports the predicate. Use
`proposed` when a curator has identified a plausible link that still needs
checking. Do not generate curated relationships merely because two resources
share a pathogen, method, resource type or source catalogue; those remain
search facets.

## Deliberate boundary

A paper-to-software edge targets the software project, not a release. Glitter
does not reconstruct the exact role of every tool in every paper. More specific
roles should be added only when users need that distinction for discovery or
interoperability.
