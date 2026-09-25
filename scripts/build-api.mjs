#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDatasets, mergeCatalogue } from "./catalogue-data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public/api/v1");
const catalogue = mergeCatalogue(loadDatasets(root));
const resources = catalogue.entities.filter((entity) => !entity.types.includes("Organization") && !entity.types.includes("Concept"));
const organizations = catalogue.entities.filter((entity) => entity.types.includes("Organization"));
const concepts = catalogue.entities.filter((entity) => entity.types.includes("Concept"));

const endpoints = {
  index: "/api/v1",
  catalogue: "/api/v1/catalogue",
  resources: "/api/v1/resources",
  organizations: "/api/v1/organizations",
  concepts: "/api/v1/concepts",
  relationships: "/api/v1/relationships",
  search: "/api/v1/search",
  resource: "/api/v1/resource",
  connections: "/api/v1/connections",
  schema: "/api/v1/schema",
  openapi: "/api/v1/openapi",
};

const collection = (kind, items) => ({
  apiVersion: "1",
  standardVersion: catalogue.standardVersion,
  kind,
  total: items.length,
  items,
});

const parameter = (name, description, schema = { type: "string" }, required = false) => ({ name, in: "query", description, required, schema });
const jsonResponse = (description, schema = { type: "object" }) => ({ description, content: { "application/json": { schema } } });
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });

const openapi = {
  openapi: "3.1.0",
  info: {
    title: "Glitter resource knowledgebase API",
    version: "1.0.0",
    description: "Find public-health pathogen-genomics resources, inspect a record, and follow verified, cited relationships. Use searchResources first, then getResource or getConnections. Never infer compatibility from shared tags or catalogue provenance.",
  },
  servers: [{ url: "https://glitter-roan.vercel.app" }],
  components: { schemas: {
    Entity: { type: "object", required: ["id", "types", "name"], properties: {
      id: { type: "string", description: "Stable canonical URI." },
      types: { type: "array", items: { type: "string" } },
      name: { type: "string" },
      description: { type: "string" },
      landingPage: { type: "string", format: "uri" },
      license: { type: "string", format: "uri", description: "Resource licence, not source-metadata licence. Missing when unknown." },
      facets: { type: "array", items: { type: "object", properties: { scheme: { type: "string" }, id: { type: "string" }, label: { type: "string" } } } },
      sources: { type: "array", items: { type: "object", properties: { name: { type: "string" }, sourceUrl: { type: "string", format: "uri" }, sourceLicense: { type: "string", format: "uri" }, retrievedAt: { type: "string", format: "date" } } } },
      fundingOpportunity: { type: "object", description: "For calls that users can apply to; inspect opens, closes and lastChecked before treating as current." },
      trainingCourse: { type: "object", description: "For online courses; availability is time-sensitive and must be read with lastChecked. Resource status active does not mean enrolment is open.", properties: { platform: { type: "string" }, availability: { type: "string", enum: ["open", "upcoming", "not-running", "unknown"] }, lastChecked: { type: "string", format: "date" } } },
      verifiedConnectionCount: { type: "integer", description: "Present on search results, not part of the Glitter entity standard." },
    }, additionalProperties: true },
    Connection: { type: "object", required: ["id", "subject", "predicate", "object", "direction", "status", "evidence", "neighbour"], properties: {
      id: { type: "string" }, subject: { type: "string" }, predicate: { type: "string" }, object: { type: "string" },
      direction: { type: "string", enum: ["in", "out"] }, status: { type: "string", enum: ["verified"] },
      description: { type: ["string", "null"], description: "May contain a preparation or compatibility caveat." },
      evidence: { type: "array", items: { type: "object", required: ["source"], properties: { source: { type: "string", format: "uri" }, locator: { type: "string" } } } },
      neighbour: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, types: { type: "array", items: { type: "string" } }, landingPage: { type: "string", format: "uri" } } },
    } },
    SearchResults: { type: "object", required: ["kind", "total", "limit", "offset", "items"], properties: {
      kind: { const: "SearchResults" }, query: { type: "string" }, filters: { type: "object" }, total: { type: "integer" }, limit: { type: "integer" }, offset: { type: "integer" }, items: { type: "array", items: ref("Entity") },
    } },
    ResourceResponse: { type: "object", required: ["kind", "resource"], properties: { kind: { const: "Resource" }, resource: ref("Entity"), verifiedConnectionCount: { type: "integer" } } },
    ConnectionsResponse: { type: "object", required: ["kind", "resource", "total", "items"], properties: { kind: { const: "Connections" }, resource: { type: "object", properties: { id: { type: "string" }, name: { type: "string" } } }, total: { type: "integer" }, items: { type: "array", items: ref("Connection") } } },
  } },
  paths: {
    [endpoints.search]: { get: {
      operationId: "searchResources",
      summary: "Search and filter pathogen-genomics resources",
      description: "Use for questions about resources, protocols, standards or funding calls. Search is lexical across titles, descriptions, identifiers and facets; common question words are ignored. Prefer concise topic terms and explicit filters. It is not an LLM-generated answer. Returns full resource records with provenance and licence fields. If there are no results, say the catalogue has no match; do not invent a resource.",
      parameters: [
        parameter("q", "Topic words to find in resource name, description, identifiers, facets and source name; all substantive words must match. Common question words are ignored. Use funding=open rather than the word open in q."),
        parameter("type", "Resource form, for example Software, Protocol, DataStandard, Publication or FundingOpportunity."),
        parameter("method", "Method-stage facet label or id, for example metadata harmonisation."),
        parameter("application", "Application facet label or id, for example antimicrobial resistance."),
        parameter("target", "Pathogen or target facet label or id, for example Salmonella."),
        parameter("source", "Source catalogue name, for example GHRU Protocols."),
        parameter("funding", "Current funding-call state, calculated from dates.", { type: "string", enum: ["open", "upcoming", "closed", "rolling"] }),
        parameter("licenseKnown", "Set true to require a recorded resource licence; absence never means unrestricted use.", { type: "boolean" }),
        parameter("connected", "Set true to require at least one verified non-catalogue connection.", { type: "boolean" }),
        parameter("limit", "Page size, 1 to 50; default 10.", { type: "integer", minimum: 1, maximum: 50, default: 10 }),
        parameter("offset", "Zero-based result offset; default 0.", { type: "integer", minimum: 0, maximum: 10000, default: 0 }),
      ],
      responses: { "200": jsonResponse("Ranked matching resources, total count and applied filters", ref("SearchResults")), "400": jsonResponse("Invalid query parameter") },
    } },
    [endpoints.resource]: { get: {
      operationId: "getResource",
      summary: "Get a resource by its canonical URI or identifier",
      description: "Returns the complete record, including its source provenance, resource licence when known, and funding-call dates when applicable. The id parameter is a canonical URI or a recorded identifier value.",
      parameters: [parameter("id", "Canonical entity URI or recorded identifier.", { type: "string" }, true)],
      responses: { "200": jsonResponse("Complete resource record", ref("ResourceResponse")), "400": jsonResponse("Missing or invalid id"), "404": jsonResponse("Entity not found") },
    } },
    [endpoints.connections]: { get: {
      operationId: "getConnections",
      summary: "Get a resource's verified, evidenced relationships",
      description: "Returns directed predicates, neighbour summaries, evidence URLs and any compatibility warning. By default excludes catalogue-provenance links and proposed or unverified assertions. Use this to explain how materials relate; do not mistake a shared facet for a relationship.",
      parameters: [
        parameter("id", "Canonical entity URI or recorded identifier.", { type: "string" }, true),
        parameter("direction", "Outgoing, incoming or both kinds of edge.", { type: "string", enum: ["both", "out", "in"], default: "both" }),
        parameter("includeCatalogue", "Set true to include verified cataloguedBy provenance edges.", { type: "boolean", default: false }),
      ],
      responses: { "200": jsonResponse("Verified connections with evidence and neighbour summaries", ref("ConnectionsResponse")), "400": jsonResponse("Invalid query parameter"), "404": jsonResponse("Entity not found") },
    } },
    ...Object.fromEntries([
      [endpoints.index, "API discovery document"],
      [endpoints.catalogue, "Complete schema-valid Glitter catalogue"],
      [endpoints.resources, "Discoverable resources, excluding supporting organisations and concepts"],
      [endpoints.organizations, "Organisation entities"],
      [endpoints.concepts, "Supporting concepts used to join resources"],
      [endpoints.relationships, "All curated directed relationships, including non-verified assertions"],
      [endpoints.schema, "Glitter JSON Schema"],
    ].map(([endpoint, description]) => [endpoint, { get: { summary: description, responses: { "200": jsonResponse("JSON response") } } }])),
  },
};

const documents = {
  "index.json": {
    apiVersion: "1",
    standardVersion: catalogue.standardVersion,
    documentation: "/api",
    note: "Use search, resource and connections for discovery. The complete catalogue and collections remain available as exports. The API is read-only; source provenance and licensing are retained.",
    endpoints,
  },
  "catalogue.json": catalogue,
  "resources.json": collection("ResourceCollection", resources),
  "organizations.json": collection("OrganizationCollection", organizations),
  "concepts.json": collection("ConceptCollection", concepts),
  "relationships.json": collection("RelationshipCollection", catalogue.relationships),
  "schema.json": JSON.parse(fs.readFileSync(path.join(root, "schema/glitter.schema.json"), "utf8")),
  "openapi.json": openapi,
};

fs.mkdirSync(output, { recursive: true });
for (const [name, document] of Object.entries(documents)) {
  fs.writeFileSync(path.join(output, name), `${JSON.stringify(document, null, 2)}\n`);
}

console.log(`Built API v1: ${resources.length} resources, ${organizations.length} organisations, ${concepts.length} concepts and ${catalogue.relationships.length} relationships.`);
