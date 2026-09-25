# Source ingestion

Status: discussion draft, v0.1

Glitter should combine hand-curated records with repeatable imports from useful
public catalogues. Imported records must remain attributable and traceable to a
specific source revision. The importer should never copy full resource content
when the source only permits linking or its reuse licence is unclear.

The initial source registry is in `config/sources.yaml`.

## Common ingestion rules

1. Use the provider's structured endpoint rather than scraping the rendered
   webpage when both are available.
2. Preserve the canonical resource URL and the catalogue record identifier.
3. Record the source, retrieval date, upstream modification time or revision,
   and stated licence.
4. Match existing records by persistent identifier or canonical URL before
   minting a Glitter identifier.
5. Keep provider data separate from curator additions so a refresh cannot
   silently erase reviewed metadata.
6. Stage changes for review. Do not automatically delete a Glitter record when
   it disappears upstream; mark it for curation instead.
7. Import titles, descriptions and classifications only to the extent allowed
   by the source licence. A link and a short factual description are the safe
   default when the licence has not been established.

## WHO IPSN PGS Data Standard Catalogue

The experimental IPSN catalogue is backed by the public
`WHO-Collaboratory/collaboratory-pgs-data-standards` GitHub repository. Its web
client discovers branches with the GitHub API and reads `catalogue.json` from
the selected branch. Glitter should import the explicitly designated
`proof-of-concept-stable` branch, not whichever branch happens to be newest.

For a reproducible production import, resolve that branch to a commit SHA and
store the SHA in `sources[].sourceRevision`. The catalogue states a CC BY 4.0
licence, which must be retained in each imported record.

The selected branch currently contains four standards, all already represented
in Glitter. The WHO Collaboratory catalogue is not a general IPSN resource
feed. Do not label separately curated WHO publications as imports from that API.

Proposed mapping:

| IPSN field | Glitter destination |
|---|---|
| `id` | `sources[].sourceRecordId` |
| `name` | `name` |
| first `URLs` entry | `landingPage` |
| further `URLs` entries | `distributions[].url` where they are actual distributions |
| `scopes` | scope/application facets |
| `targets` | target/pathogen facets |
| `formats` | data-format facets |
| `supporting_materials` | candidate related entities and relationships |
| `developers` | candidate `Organization` entities and `maintainedBy` relationships |
| `comment` | source-supplied description or curator note |

Developer and supporting-material strings should not automatically become new
entities without a stable identifier or curator review.

## WHO genomics publications

The WHO genomic surveillance initiative and WHO publication pages are curated
separately from the Collaboratory standards feed. Each publication is checked
against its own landing page and recorded with its own ISBN, date, description
and source URL. The resource licence remains unset if that page does not
establish a specific reuse licence. This is a selected-records workflow, not
an automated IPSN API import.

The WHO publication pages link the Genomics Costing Tool workbook and its user
manual as distinct resources; Glitter records their evidenced document link.
WHO's 2025 data-sharing platform publication explicitly states CC BY-NC-SA
3.0 IGO, so that resource has a licence URI. Do not transfer that licence to
other WHO records without checking their own landing pages.

## CGPS GHRU Protocols

The GHRU protocols page is available through the site's WordPress REST API as
post `6298`. Its rendered post content is a curated index containing section
headings and outbound links to protocols.io and Zenodo.

The adapter should:

- parse the section hierarchy and links from `content.rendered`;
- create a `Protocol` record for protocols.io targets;
- create a `TrainingResource` record for the Zenodo training collection;
- use the section heading as a method-stage facet, such as DNA extraction,
  library preparation, sequencing or bioinformatics;
- use the target URL as the provisional identifier, replacing it with a DOI
  when the target supplies one;
- preserve the WordPress post ID, canonical page URL, upstream `modified` time
  and retrieval date as provenance.

The page is a discovery source, while protocols.io or Zenodo is the canonical
source for each target resource. Until the licence of each target has been
checked, this adapter is link-only: import factual metadata and URLs, not the
full protocol or training content.

## Refresh and review

An ingestion run should write a candidate change set containing additions,
updates, possible matches and upstream removals. A curator approves that change
set before it becomes part of the published knowledgebase. The website can then
show both the canonical resource and the catalogue or catalogues from which it
was discovered.

## PHA4GE guidance documents and standards

PHA4GE exposes its curated Guidance Documents & Standards page as WordPress
page `10874`. The adapter reads the rendered resource cards from the REST
response and imports the card title, description and canonical target URL.

Cards are classified according to what the resource represents:

- contextual-data specifications and metadata templates are `DataStandard`;
- best-practice and pathogen-analysis material is `GuidanceDocument`;
- the hAMRonization software and its AMR detection specification are separate
  records, linked with an evidenced `implements` relationship;
- the wastewater guidance collection is a `GuidanceDocument` landing resource.

The source page's modification timestamp is retained as the source revision.
The page does not state a blanket reusable-data licence, so imports are limited
to catalogue metadata and links. Licences for the target repositories and
documents should be checked individually before importing their contents.
