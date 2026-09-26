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

## WHO IRIS pathogen-genomics import

WHO IRIS exposes a public DSpace REST discovery API at
`https://iris.who.int/server/api/discover/search/objects`, item metadata at
`https://iris.who.int/server/api/core/items/{uuid}`, and an OAI-PMH feed at
`https://iris.who.int/server/oai/request`. The latter supports date-based
harvesting but does not replace editorial selection.

`npm run import:who-iris` fetches the records in
`config/who-iris-selected.json` and previews matches, warnings and new
resources. `npm run import:who-iris -- --write` refreshes the published
`data/seed/who-iris.json`. To inspect possible additions without loading them,
run `npm run import:who-iris -- --discover "whole genome sequencing"` and then
review each candidate before adding its UUID and expected handle to the
allowlist. A broad IRIS search contains unrelated human-genomics and older
news items, so search hits are never auto-published.

The importer checks the expected handle, matches existing Glitter resources
by handle, ISBN or DOI, and skips matches rather than creating duplicate nodes.
It only turns `dc.relation` into a connection where the allowlist explicitly
identifies the main document and the API record confirms it. It records a
licence only when `dc.rights` states CC BY-NC-SA 3.0 IGO; the corresponding
canonical licence URL is used because at least one IRIS `dc.rights.uri` is
malformed. Recheck source rights and bibliographic dates during curation.

## Online courses

`data/seed/online-courses.json` contains a reviewed selection of pathogen-
genomics courses from Harvard Medical School and FutureLearn. The catalogue
records a course page even when enrolment is paused, but `trainingCourse`
separately records its platform, availability and last-checked date. Refresh
availability from the individual course page before promoting an enrolment
link. A live page or a free course is not evidence of an open content licence;
leave `license` unset unless reuse terms are explicit. Shared topic or provider
alone is not grounds for a graph relationship.

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

## Pathogenwatch analysis software

`data/seed/pathogenwatch-tools.json` is a hand-reviewed selection from the
current [Pathogenwatch technical descriptions](https://cgps.gitbook.io/pathogenwatch/technical-descriptions-of-analysis-tools)
and each tool's canonical repository. Pathogenwatch is a platform-level
`Software` record; each externally identifiable analysis project is a separate
software record. Verified `uses` assertions link the platform to documented
components and carry page-level evidence. They do not imply that every genome
is processed by every tool. The optional Shovill short-read assembly service is
marked accordingly.

Repository licences are recorded only where a specific licence document was
found. The Pathogenwatch-OSS repositories and SeroBA were left without a
resource licence when GitHub did not identify a specific SPDX licence; an
“open source” statement alone is not a reusable licence URI. Genotyphi is not
linked to its upstream repository as a component, because Pathogenwatch says
it uses an in-house assembly-based implementation of that method. Review
method descriptions and licence links again during source refreshes.
