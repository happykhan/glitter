# Resource profiles

The core JSON Schema permits lightweight records. These profiles define what a
publishable Glitter record should contain for each important resource form.

`Required` fields are needed for a useful record. `Recommended` fields improve
discovery and evaluation. `Optional` fields are retained when supplied by an
authoritative source.

| Profile | Required | Recommended | Optional |
|---|---|---|---|
| Publication | `id`, `types`, `name`, `landingPage` | DOI or PMID, publication date, abstract-derived description, source provenance, relationships to described or mentioned resources | licence, facets |
| Software | `id`, `types`, `name`, `landingPage` | description, project licence, maintainer, method/application facets, publication or documentation relationship | input/output concepts, status |
| Protocol | `id`, `types`, `name`, `landingPage` | method stage, target scope, description, provenance, licence | software/instrument usage, version-independent identifiers |
| Dataset or standard | `id`, `types`, `name`, `landingPage` | persistent identifier, description, scope, licence, provenance | mappings, conformance links, distributions |
| Training resource | `id`, `types`, `name`, `landingPage` | description, method/application facets, provenance, `teaches` relationships | event dates, licence |
| Funding opportunity | `id`, `types`, `name`, `landingPage`, `fundingOpportunity.applicationUrl`, `status`, `lastChecked` | opening and closing dates, eligibility, geographic scope, funder relationship | amount, currency, relevant method/application facets |

## Licence fields

`license` belongs to the resource itself. `sources[].sourceLicense` applies only
to metadata imported from that source catalogue. One must never be substituted
for the other. When the resource licence is unknown, omit `license`; interfaces
must display that uncertainty as “Not recorded”.
