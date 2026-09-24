# Glitter conceptual model

Status: discussion draft, v0.1

## 1. Scope

Glitter describes discoverable resources and useful relationships between them
across the public-health pathogen-genomics lifecycle. Its purpose is to help a
user find the materials needed to establish, run, understand or improve WGS
work, following the broad intent of the GMI Knowledge Hub.

Glitter is not an execution or sample-provenance standard. It does not attempt
to reconstruct every laboratory action or analysis reported in a paper, and it
does not replace sample-level submission standards such as MIxS or PHA4GE.
Those standards are themselves resources that Glitter can describe and link.

## 2. Core record model

A Glitter record contains:

- `standardVersion`: version of the Glitter specification;
- `entities`: independently identifiable resources and supporting concepts;
- `relationships`: directed, typed connections between entities.

Every entity has:

- a stable `id` (preferably an existing URI or persistent identifier);
- one or more `types`;
- a human-readable `name`;
- optional identifiers, description, dates, links and facets.
- optional source provenance for records imported from external catalogues.

Every relationship has:

- its own `id`, so the assertion can be cited or corrected;
- `subject`, `predicate` and `object`;
- optional evidence and curator information;
- optional curation status.

Relationships are stored in one canonical direction. User interfaces may show
computed inverse labels; they should not duplicate inverse edges in the data.

## 3. Entity types

| Type | Use |
|---|---|
| `Publication` | Journal articles, preprints, reports and other citable works |
| `Software` | A tool, library, service or platform represented at project level |
| `ComputationalWorkflow` | An orchestrated, repeatable computational analysis |
| `Protocol` | A planned wet-lab or computational procedure |
| `Dataset` | A useful or citable collection of data |
| `DataStandard` | A schema, profile, checklist, ontology or reporting standard |
| `TrainingResource` | Tutorials, courses, videos, slides or exercises |
| `GuidanceDocument` | Policies, SOPs, best-practice documents and strategic guidance |
| `FundingOpportunity` | An open, upcoming, rolling or closed call people can apply to |
| `Project` | A programme, study, network or surveillance initiative |
| `Database` | A searchable biological, genomic or epidemiological resource |
| `StrainCollection` | A culture or strain collection available to the community |
| `Instrument` | Sequencing or laboratory equipment relevant to pathogen genomics |
| `Event` | A training event, workshop, meeting or community activity |
| `Person` | A supporting entity, preferably identified by ORCID |
| `Organization` | A funder, publisher, laboratory or institution, preferably with ROR |
| `Concept` | A method, application, organism, data format or ontology term |

`WebResource` should not be a primary type. A webpage is normally the landing
page of another resource. Use `GuidanceDocument` or `TrainingResource` when the
page itself is the intellectual resource.

## 4. Facets are not entity types

The GMI Knowledge Hub provides a useful starting taxonomy. Glitter should keep
these independent axes rather than mixing them into a single category tree:

- **method stage** — sample collection, sample QC, culture, extraction, library
  preparation, enrichment, sequencing, read QC, read processing, host removal,
  assembly/consensus, detection, typing, variant detection, AMR, virulence,
  phylogenetics, phylodynamics, transmission analysis and reporting;
- **application** — routine surveillance, outbreak investigation, clinical,
  One Health, environmental, wastewater, source attribution, validation,
  proficiency testing, research and public-health decision support;
- **target** — pathogen-agnostic or pathogen-specific, with NCBI Taxonomy IDs
  for named organisms;
- **resource form** — the entity types above;
- **maturity/status** — draft, active, deprecated, superseded or archived;
- **access** — open, registered, controlled or restricted.

Facet terms should carry resolvable ontology identifiers where available.
EDAM is the first choice for computational topics, operations, data and formats;
other OBO Foundry ontologies can be used for laboratory and genomic
epidemiology concepts.

## 5. Relationship model

The controlled predicates are defined in
`vocabularies/relationships.yaml`. The initial model deliberately stays small:

- a paper `mentions` software, a protocol, dataset or standard when that
  connection is useful for discovery;
- a workflow or protocol `uses` software without identifying every release;
- software or workflows `acceptInput` and `produceOutput` data or format concepts;
- a training resource `teaches` a tool, method, protocol or standard;
- a resource `conformsTo` a standard, while a standard `mapsTo` another standard;
- a funding opportunity is `offeredBy` a funding organisation.
- a resource is `cataloguedBy` an organisation when that organisation's index
  is the discovery source but formal publication or ownership is not asserted.

Glitter should not classify the exact scientific role a tool played in every
paper unless that distinction proves useful to knowledgebase users.

## 6. Identifiers

Prefer identifiers minted by the system of record:

- DOI or PMID for publications and published protocols;
- RRID, bio.tools ID, repository or canonical project URL for software;
- DOI, accession or repository URI for datasets;
- ORCID for people and ROR for organisations;
- NCBI Taxonomy IDs for organisms;
- ontology IRIs for controlled terms.

Software records refer to the project as a whole. A paper-to-software
relationship therefore remains stable even when software releases change.

Imported records retain their source catalogue, source record identifier,
retrieval date, source revision and licence where one is stated. Provenance is
repeatable, so the same resource can be supported by more than one catalogue.

## 7. Funding opportunities

A funding opportunity represents a call people can apply to, not an award that
funded a paper. Its profile should support:

- funder and programme;
- canonical call and application URLs;
- opening and closing dates;
- computed state: upcoming, open, rolling or closed;
- eligible applicants and organisations;
- geographic eligibility;
- scientific scope and relevant Glitter facets;
- indicative amount and currency where published;
- last-checked date, so stale calls are visible.

The website should calculate open/upcoming/closed from the dates wherever
possible. `rolling` is reserved for calls without a fixed closing date.

## 8. Profiles and validation

The core schema deliberately requires little: identity, type and name for
entities, plus a valid triple for relationships. Type-specific profiles should
then define minimum, recommended and optional fields. Proposed first profiles:

1. Software and computational workflows;
2. Wet-lab and computational protocols;
3. Publications and their resource relationships;
4. Datasets and standards;
5. Funding opportunities.

JSON Schema validates syntax. SHACL may later validate graph constraints such
as allowed subject/object types and profile conformance.

## 9. Alignment, not reinvention

| Concern | Reuse/alignment target |
|---|---|
| Web discovery and common entities | Schema.org and Bioschemas |
| Software metadata | CodeMeta, Bioschemas ComputationalTool, biotoolsSchema |
| Computational functions, data and formats | EDAM |
| Connected research resources and workflows | RO-Crate and Workflow RO-Crate |
| Persistent identifiers and output relations | DataCite |
| Sample and sequence context | MIxS and PHA4GE profiles |
| Taxa | NCBI Taxonomy |

## 10. Privacy boundary

Glitter should not contain person-level clinical data. It catalogues public or
appropriately shared resources and descriptive metadata rather than individual
specimen or patient records.

## 11. Recommended path to v0.1

1. Agree three user stories: resource discovery, pathway building and standards mapping.
2. Curate 20–30 real resources covering every proposed primary type.
3. Test five relationship-heavy examples, including paper-to-software,
   protocol-to-software and training-to-standard discovery.
4. Map each field to the external standards listed above.
5. Publish minimum/recommended/optional profiles and validation fixtures.
6. Pilot import/export with the GMI Hub, bio.tools and one PHA4GE template.
7. Establish versioning, term requests, deprecation and community governance.
