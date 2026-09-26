# Glitter API v1

The website has a [practical API guide](https://glitter-roan.vercel.app/api)
with endpoints, response fields and copyable examples. This file records the
same contract for repository users.

The Glitter website publishes versioned, read-only JSON. Exports are static
build artefacts; search and lookup are read-only endpoints over the catalogue
published with the deployment. No authentication is required, and cross-origin
access is enabled.

Base URL: `https://glitter-roan.vercel.app/api/v1`

| Endpoint | Contents |
|---|---|
| `/api/v1` | API discovery document and endpoint links |
| `/api/v1/search` | Ranked resource search with filters and pagination |
| `/api/v1/resource?id=URI` | Full record by canonical URI or recorded identifier |
| `/api/v1/connections?id=URI` | Verified directed links, evidence, and neighbour summaries |
| `/api/v1/questions` | Curated practical-question routes, referenced resource IDs and explicit gaps |
| `/api/v1/catalogue` | Complete schema-valid Glitter document |
| `/api/v1/resources` | Discoverable resources, excluding supporting organisations and concepts |
| `/api/v1/organizations` | Organisation entities |
| `/api/v1/concepts` | Supporting formats and other concepts used to join resources |
| `/api/v1/relationships` | Directed relationships and their evidence |
| `/api/v1/schema` | JSON Schema for the resource specification |
| `/api/v1/openapi` | OpenAPI 3.1 tool definition, including query parameters and operation IDs |

Search accepts `q`, `type`, `method`, `application`, `target`, `source`,
`funding`, `licenseKnown`, `connected`, `limit` and `offset`. Substantive query
words are matched against resource fields and curated practical-question titles;
common question words are ignored and some extra words are tolerated. Results
are ranked by field relevance; filtering is lexical and does not use an LLM or
a live web search. Search items include `questionRoutes` when a resource is part
of an editorial reading route. These are not verified graph relationships.
`funding` is computed from the call's dates at request time. The
default page size is 10, with a maximum of 50.

```sh
curl -fsSG 'https://glitter-roan.vercel.app/api/v1/search' \
  --data-urlencode 'q=amr' \
  --data-urlencode 'type=Software'

curl -fsSG 'https://glitter-roan.vercel.app/api/v1/connections' \
  --data-urlencode 'id=https://github.com/B-UMMI/chewBBACA'
```

An AI assistant host that supports OpenAPI/HTTP tools can import
`/api/v1/openapi` and call `searchResources`, `getResource` and
`getConnections`. Suggested instruction: search first, inspect the selected
record, then follow only verified relationships; cite each resource's
`landingPage` and each relationship's `evidence` URL. An ordinary chat cannot
call this API merely because someone pastes the URL into a prompt.

The resource lookup response also includes `questionRoutes` outside the
schema-valid `resource` object. Use `/api/v1/questions` for each route's ordered
steps, clarifying question and evidence gap.

For an assistant, pass concise topic terms in `q` and use the dedicated
filters for resource type, pathogen, source and funding state. Treat zero
results as a catalogue gap rather than evidence that no resource exists.

The collection endpoints return an envelope containing `apiVersion`,
`standardVersion`, `kind`, `total` and `items`. Use `/catalogue` when a consumer
needs one document that validates directly against the Glitter JSON Schema.

The complete export endpoints remain available for consumers that want to do
their own indexing. They include assertions of all review statuses; the
connections endpoint intentionally defaults to verified non-catalogue links.

The API does not assert a blanket licence over third-party resources or source
metadata. Consumers must inspect `license` on the resource and
`sources[].sourceLicense` on each provenance record. Absence means the licence
has not been recorded, not that the material is unrestricted.

The major version in `/api/v1` is the compatibility boundary for endpoint and
envelope changes. `standardVersion` identifies the Glitter record model used by
the returned data.
## Practical questions

`GET /api/v1/questions` returns six editorial entry points for common implementation and learning questions. Each route has a short answer, a clarifying question, ordered catalogue resource IDs and an explicit gap. Use `getResource` for the cited records; only `getConnections` provides verified, evidenced graph relationships. A reading route does not assert that its resources implement, cite or interoperate with one another.
