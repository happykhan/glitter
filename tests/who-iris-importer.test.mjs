import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { buildSelectedCatalogue, matchingEntity, WHO_IGO_LICENSE } from "../scripts/who-iris-importer.mjs";

const root = path.resolve(import.meta.dirname, "..");
const selected = JSON.parse(fs.readFileSync(path.join(root, "config/who-iris-selected.json"), "utf8")).items;
const imported = JSON.parse(fs.readFileSync(path.join(root, "data/seed/who-iris.json"), "utf8"));
const metadata = (value) => [{ value }];

test("IRIS selection publishes only reviewed pathogen-genomics records with evidenced document links", () => {
  assert.equal(imported.entities.length, selected.length);
  assert.deepEqual(new Set(imported.entities.map((entity) => entity.id)), new Set(selected.map((item) => item.handle)));
  assert.equal(imported.relationships.length, 2);
  for (const entity of imported.entities) {
    assert.equal(entity.license, WHO_IGO_LICENSE);
    assert.equal(entity.sources[0].name, "WHO IRIS");
    assert.match(entity.sources[0].sourceUrl, /^https:\/\/iris\.who\.int\/server\/api\/core\/items\//);
  }
  assert.ok(imported.relationships.every((link) => link.predicate === "isSupplementTo" && link.evidence.length));
});

test("an IRIS handle and a WHO publication URL with the same ISBN resolve to one resource", () => {
  const item = { metadata: {
    "dc.identifier.uri": metadata("https://iris.who.int/handle/10665/373460"),
    "dc.identifier.isbn": metadata("9789240021242 (electronic version)"),
  } };
  const existing = [{ id: "https://www.who.int/publications/i/item/9789240021242", identifiers: [{ scheme: "ISBN", value: "9789240021242" }] }];
  assert.equal(matchingEntity(item, existing), existing[0]);
});

test("a malformed rights URI is never copied as a licence", () => {
  const selection = { uuid: "test-uuid", handle: "https://iris.who.int/handle/10665/123456", types: ["GuidanceDocument"], description: "Test record", facets: [] };
  const item = { uuid: selection.uuid, name: "Pathogen WGS guidance", metadata: {
    "dc.identifier.uri": metadata(selection.handle),
    "dc.rights": metadata("CC BY-NC-SA 3.0 IGO"),
    "dc.rights.uri": metadata("https://creativecommons.org/licenses/by-nc-sa/3"),
  } };
  const result = buildSelectedCatalogue([selection], [item], [], "2026-09-25");
  assert.equal(result.catalogue.entities[0].license, WHO_IGO_LICENSE);
  assert.equal(result.warnings.length, 1);
  item.metadata["dc.rights"] = metadata("Rights unclear");
  assert.equal(buildSelectedCatalogue([selection], [item], [], "2026-09-25").catalogue.entities[0].license, undefined);
});

test("selected supplements require a relationship stated by IRIS", () => {
  const selection = { uuid: "test-uuid", handle: "https://iris.who.int/handle/10665/123456", types: ["GuidanceDocument"], description: "Test record", facets: [], supplements: {
    irisHandle: "https://iris.who.int/handle/10665/654321",
    glitterId: "https://www.who.int/publications/i/item/123",
  } };
  const item = { uuid: selection.uuid, name: "Pathogen WGS annex", metadata: { "dc.identifier.uri": metadata(selection.handle) } };
  const existing = [{ id: selection.supplements.glitterId }];
  assert.throws(() => buildSelectedCatalogue([selection], [item], existing, "2026-09-25"), /not in IRIS metadata/);
});
