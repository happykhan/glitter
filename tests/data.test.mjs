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

test("Pathogenwatch components retain their own identity, scope and licence uncertainty", () => {
  const byId = new Map(entities.map((entity) => [entity.id, entity]));
  const platform = byId.get("https://pathogen.watch/");
  assert.ok(platform?.types.includes("Software"));
  assert.equal(platform.license, undefined);
  for (const id of [
    "https://github.com/klebgenomics/Kleborate",
    "https://github.com/klebgenomics/Kaptive",
    "https://github.com/phac-nml/sistr_cmd",
    "https://github.com/pathogenwatch-oss/speciator",
    "https://github.com/pathogenwatch-oss/mlst",
    "https://github.com/pathogenwatch-oss/amr-search",
  ]) assert.ok(byId.get(id)?.sources.some((source) => source.name.startsWith("Pathogenwatch")), id);
  assert.equal(byId.get("https://github.com/phac-nml/sistr_cmd")?.facets.some((facet) => facet.id === "salmonella"), true);
  assert.ok(byId.get("https://github.com/klebgenomics/Kleborate")?.license);
  assert.equal(byId.get("https://github.com/pathogenwatch-oss/amr-search")?.license, undefined);
  const uses = relationships.filter((item) => item.subject === platform.id && item.predicate === "uses");
  assert.ok(uses.length >= 10);
  assert.ok(uses.some((item) => item.object === "https://github.com/tseemann/shovill" && /optional/.test(item.description)));
  assert.ok(!uses.some((item) => item.object === "https://github.com/katholt/genotyphi"));
  assert.ok(uses.every((item) => item.status === "verified" && item.evidence?.[0]?.source && item.evidence[0].locator));
});

test("online courses keep enrolment availability separate from catalogue status and licences", () => {
  const courses = entities.filter((entity) => entity.trainingCourse);
  assert.ok(courses.length >= 9);
  assert.equal(courses.filter((entity) => entity.trainingCourse.availability === "open").length, 4);
  assert.equal(courses.filter((entity) => entity.trainingCourse.availability === "not-running").length, 4);
  assert.ok(courses.some((entity) => entity.trainingCourse.availability === "unknown"));
  for (const course of courses) {
    assert.ok(course.types.includes("TrainingResource"));
    assert.match(course.trainingCourse.lastChecked, /^2026-09-2[56]$/);
    assert.equal(course.license, undefined);
    assert.equal(course.sources[0].sourceUrl, course.landingPage);
  }
});
