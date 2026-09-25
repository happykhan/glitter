import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const datasets = fs.readdirSync(path.join(root, "data/seed"))
  .filter((name) => name.endsWith(".json"))
  .map((name) => JSON.parse(fs.readFileSync(path.join(root, "data/seed", name), "utf8")));
const entities = datasets.flatMap((dataset) => dataset.entities);
const relationships = datasets.flatMap((dataset) => dataset.relationships);

test("the catalogue covers the brief's key resource forms", () => {
  const types = new Set(entities.flatMap((entity) => entity.types));
  for (const type of ["Publication", "Software", "Protocol", "DataStandard", "GuidanceDocument", "TrainingResource", "FundingOpportunity"]) {
    assert.ok(types.has(type), `missing ${type}`);
  }
});

test("curated relationships resolve and carry evidence", () => {
  const ids = new Set(entities.map((entity) => entity.id));
  const useful = relationships.filter((relationship) => relationship.predicate !== "cataloguedBy");
  assert.ok(useful.length >= 8);
  for (const relationship of useful) {
    assert.ok(ids.has(relationship.subject), `unknown subject ${relationship.subject}`);
    assert.ok(ids.has(relationship.object), `unknown object ${relationship.object}`);
    assert.ok(relationship.evidence?.length, `missing evidence for ${relationship.id}`);
  }
});

test("funding calls include dates, status and freshness", () => {
  const calls = entities.filter((entity) => entity.types.includes("FundingOpportunity"));
  assert.ok(calls.length >= 2);
  for (const call of calls) {
    assert.ok(call.fundingOpportunity?.applicationUrl);
    assert.ok(call.fundingOpportunity?.status);
    assert.ok(call.fundingOpportunity?.lastChecked);
    assert.ok(call.fundingOpportunity?.closes || call.fundingOpportunity?.status === "rolling");
  }
});

test("known software licences are recorded on the resource", () => {
  const software = entities.filter((entity) => entity.types.includes("Software"));
  assert.ok(software.length >= 2);
  for (const id of ["https://github.com/cidgoh/DataHarmonizer", "https://github.com/pha4ge/hAMRonization", "https://github.com/amrcolab/AMRColab", "https://github.com/ncbi/amr"]) {
    assert.ok(software.find((entity) => entity.id === id)?.license, `known licence missing for ${id}`);
  }
  assert.equal(software.find((entity) => entity.id === "https://github.com/ncbi/amr")?.license, "https://github.com/ncbi/amr/blob/master/LICENSE");
});
