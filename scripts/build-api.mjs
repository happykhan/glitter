#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDatasets, mergeCatalogue } from "./catalogue-data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public/api/v1");
const catalogue = mergeCatalogue(loadDatasets(root));
const resources = catalogue.entities.filter((entity) => !entity.types.includes("Organization"));
const organizations = catalogue.entities.filter((entity) => entity.types.includes("Organization"));

const endpoints = {
  index: "/api/v1",
  catalogue: "/api/v1/catalogue",
  resources: "/api/v1/resources",
  organizations: "/api/v1/organizations",
  relationships: "/api/v1/relationships",
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

const openapi = {
  openapi: "3.1.0",
  info: {
    title: "Glitter resource knowledgebase API",
    version: "1.0.0",
    description: "Read-only JSON endpoints for public-health pathogen-genomics resources and their curated relationships.",
  },
  servers: [{ url: "https://glitter-roan.vercel.app" }],
  paths: Object.fromEntries([
    [endpoints.index, "API discovery document"],
    [endpoints.catalogue, "Complete schema-valid Glitter catalogue"],
    [endpoints.resources, "Resource entities, excluding organisations"],
    [endpoints.organizations, "Organisation entities"],
    [endpoints.relationships, "Curated directed relationships"],
    [endpoints.schema, "Glitter JSON Schema"],
  ].map(([endpoint, description]) => [endpoint, { get: { summary: description, responses: { "200": { description: "JSON response", content: { "application/json": { schema: { type: "object" } } } } } } }])),
};

const documents = {
  "index.json": {
    apiVersion: "1",
    standardVersion: catalogue.standardVersion,
    documentation: "/api",
    note: "The API is read-only. Source provenance and licensing are retained on each entity.",
    endpoints,
  },
  "catalogue.json": catalogue,
  "resources.json": collection("ResourceCollection", resources),
  "organizations.json": collection("OrganizationCollection", organizations),
  "relationships.json": collection("RelationshipCollection", catalogue.relationships),
  "schema.json": JSON.parse(fs.readFileSync(path.join(root, "schema/glitter.schema.json"), "utf8")),
  "openapi.json": openapi,
};

fs.mkdirSync(output, { recursive: true });
for (const [name, document] of Object.entries(documents)) {
  fs.writeFileSync(path.join(output, name), `${JSON.stringify(document, null, 2)}\n`);
}

console.log(`Built API v1: ${resources.length} resources, ${organizations.length} organisations and ${catalogue.relationships.length} relationships.`);
