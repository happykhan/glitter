import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
execFileSync(process.execPath, ["scripts/build-api.mjs"], { cwd: root, stdio: "ignore" });

const read = (name) => JSON.parse(fs.readFileSync(path.join(root, "public/api/v1", name), "utf8"));

test("the API publishes versioned resource and relationship collections", () => {
  const resources = read("resources.json");
  const relationships = read("relationships.json");
  assert.equal(resources.apiVersion, "1");
  assert.equal(resources.standardVersion, "0.1.0");
  assert.equal(resources.kind, "ResourceCollection");
  assert.equal(resources.total, resources.items.length);
  assert.ok(resources.items.length >= 31);
  assert.equal(relationships.total, relationships.items.length);
  assert.ok(relationships.items.every((relationship) => relationship.subject && relationship.predicate && relationship.object));
});

test("the complete API catalogue retains schema-valid top-level fields", () => {
  const catalogue = read("catalogue.json");
  assert.equal(catalogue.standardVersion, "0.1.0");
  assert.ok(Array.isArray(catalogue.entities));
  assert.ok(Array.isArray(catalogue.relationships));
});

test("the API discovery document exposes every public endpoint", () => {
  const index = read("index.json");
  for (const name of ["catalogue", "resources", "organizations", "relationships", "schema", "openapi"]) {
    assert.match(index.endpoints[name], /^\/api\/v1\//);
  }
});
