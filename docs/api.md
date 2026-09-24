# Glitter API v1

The Glitter website publishes versioned, read-only JSON documents. They are
static build artefacts: no authentication is required, responses can be cached,
and cross-origin access is enabled.

Base URL: `https://glitter-roan.vercel.app/api/v1`

| Endpoint | Contents |
|---|---|
| `/api/v1` | API discovery document and endpoint links |
| `/api/v1/catalogue` | Complete schema-valid Glitter document |
| `/api/v1/resources` | Resource entities, excluding organisations |
| `/api/v1/organizations` | Organisation entities |
| `/api/v1/relationships` | Directed relationships and their evidence |
| `/api/v1/schema` | JSON Schema for the resource specification |
| `/api/v1/openapi` | OpenAPI 3.1 description of these endpoints |

The collection endpoints return an envelope containing `apiVersion`,
`standardVersion`, `kind`, `total` and `items`. Use `/catalogue` when a consumer
needs one document that validates directly against the Glitter JSON Schema.

```sh
curl -s https://glitter-roan.vercel.app/api/v1/resources | jq '.items[] | select(.types | index("Software"))'
```

The API does not assert a blanket licence over third-party resources or source
metadata. Consumers must inspect `license` on the resource and
`sources[].sourceLicense` on each provenance record. Absence means the licence
has not been recorded, not that the material is unrestricted.

The major version in `/api/v1` is the compatibility boundary for endpoint and
envelope changes. `standardVersion` identifies the Glitter record model used by
the returned data.
