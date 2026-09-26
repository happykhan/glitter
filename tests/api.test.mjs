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
  const concepts = read("concepts.json");
  const relationships = read("relationships.json");
  assert.equal(resources.apiVersion, "1");
  assert.equal(resources.standardVersion, "0.1.0");
  assert.equal(resources.kind, "ResourceCollection");
  assert.equal(resources.total, resources.items.length);
  assert.ok(resources.items.length >= 31);
  assert.equal(concepts.kind, "ConceptCollection");
  assert.ok(concepts.items.some((item) => item.id === "urn:glitter:format:cgmlst-allele-profile-tsv"));
  assert.ok(resources.items.every((item) => !item.types.includes("Concept")));
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
  assert.equal(index.documentation, "/api");
  for (const name of ["catalogue", "resources", "organizations", "concepts", "relationships", "questions", "search", "resource", "connections", "schema", "openapi"]) {
    assert.match(index.endpoints[name], /^\/api\/v1\//);
  }
});

test("practical questions are complete routes to real resources, not invented edges", () => {
  const questions = read("questions.json");
  const resources = read("resources.json");
  const ids = new Set(resources.items.map((item) => item.id));
  assert.equal(questions.kind, "QuestionCollection");
  assert.equal(questions.total, 6);
  for (const question of questions.items) {
    assert.ok(question.answer && question.askFirst && question.gap);
    assert.ok(question.steps.length > 0);
    for (const step of question.steps) for (const id of step.resourceIds) assert.ok(ids.has(id), `${question.id}: ${id}`);
  }
});

test("OpenAPI offers callable discovery operations with their parameters", () => {
  const openapi = read("openapi.json");
  for (const [path, operation] of [["/api/v1/search", "searchResources"], ["/api/v1/resource", "getResource"], ["/api/v1/connections", "getConnections"]]) {
    assert.equal(openapi.paths[path].get.operationId, operation);
    assert.ok(openapi.paths[path].get.parameters.length);
  }
  assert.ok(openapi.paths["/api/v1/search"].get.parameters.some((param) => param.name === "target"));
});

test("the human-readable API page has its own route", () => {
  const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
  assert.ok(vercel.rewrites.some((rewrite) => rewrite.source === "/api" && rewrite.destination === "/index.html"));
});

test("curated graph paths connect standards, AMR tools and compatible typing outputs", () => {
  const catalogue = read("catalogue.json");
  const has = (subject, predicate, object) => catalogue.relationships.some((item) => item.subject === subject && item.predicate === predicate && item.object === object && item.status === "verified" && item.evidence?.length);
  assert.ok(has("https://github.com/cidgoh/DataHarmonizer", "implements", "https://github.com/pha4ge/Wastewater_Contextual_Data_Specification"));
  assert.ok(has("https://doi.org/10.1099/mgen.0.001308", "describes", "https://github.com/amrcolab/AMRColab"));
  assert.ok(has("https://github.com/amrcolab/AMRColab", "uses", "https://github.com/pha4ge/hAMRonization"));
  assert.ok(has("https://github.com/pha4ge/hAMRonization", "implements", "https://github.com/pha4ge/hAMRonization/blob/master/docs/hAMRonization_specification_details.csv"));
  const profile = "urn:glitter:format:cgmlst-allele-profile-tsv";
  assert.ok(has("https://github.com/B-UMMI/chewBBACA", "producesOutput", profile));
  assert.ok(has("https://github.com/insapathogenomics/ReporTree", "acceptsInput", profile));
  assert.match(catalogue.relationships.find((item) => item.subject === "https://github.com/insapathogenomics/ReporTree" && item.object === profile).description, /--t 0/);
});
