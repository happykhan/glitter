import assert from "node:assert/strict";
import test from "node:test";
import { GET as search } from "../api/v1/search.js";
import { GET as resource } from "../api/v1/resource.js";
import { GET as connections } from "../api/v1/connections.js";

const request = (route) => new Request(`https://glitter-roan.vercel.app${route}`);
const json = async (response) => ({ status: response.status, body: await response.json() });

test("search finds useful AMR software with stable identifiers and provenance", async () => {
  const { status, body } = await json(search(request("/api/v1/search?q=amr&type=Software&connected=true")));
  assert.equal(status, 200);
  assert.equal(body.kind, "SearchResults");
  assert.ok(body.items.some((item) => item.name === "AMRColab"));
  assert.ok(body.items.every((item) => item.types.includes("Software") && item.id && item.sources?.length && item.verifiedConnectionCount > 0));
  assert.ok(body.total >= body.items.length);
});

test("search filters facets and paginates without returning supporting concepts", async () => {
  const { body } = await json(search(request("/api/v1/search?method=metadata%20harmonisation&limit=1&offset=0")));
  assert.equal(body.limit, 1);
  assert.equal(body.items.length, 1);
  assert.ok(body.items[0].facets.some((facet) => facet.scheme === "Glitter method stage" && facet.label === "Metadata harmonisation"));
  const all = (await json(search(request("/api/v1/search?limit=50")))).body;
  assert.ok(all.items.every((item) => !item.types.includes("Concept") && !item.types.includes("Organization")));
  assert.equal((await json(search(request("/api/v1/search?limit=51")))).status, 400);
});

test("resource lookup returns a full record and clear error for missing IDs", async () => {
  const id = encodeURIComponent("https://github.com/cidgoh/DataHarmonizer");
  const { status, body } = await json(resource(request(`/api/v1/resource?id=${id}`)));
  assert.equal(status, 200);
  assert.equal(body.resource.name, "DataHarmonizer");
  assert.ok(body.resource.sources.length);
  assert.ok(body.verifiedConnectionCount > 0);
  assert.equal((await json(resource(request("/api/v1/resource")))).status, 400);
  assert.equal((await json(resource(request("/api/v1/resource?id=unknown")))).status, 404);
});

test("connections expose evidence, direction and preparation warnings", async () => {
  const id = encodeURIComponent("https://github.com/B-UMMI/chewBBACA");
  const { status, body } = await json(connections(request(`/api/v1/connections?id=${id}`)));
  assert.equal(status, 200);
  assert.equal(body.kind, "Connections");
  assert.ok(body.items.every((item) => item.status === "verified" && item.predicate !== "cataloguedBy" && item.evidence.length && item.neighbour?.id));
  assert.ok(body.items.some((item) => item.predicate === "producesOutput" && /--t 0/.test(item.description)));
  assert.equal((await json(connections(request(`/api/v1/connections?id=${id}&direction=in`)))).body.total, 0);
  assert.equal((await json(connections(request(`/api/v1/connections?id=${id}&direction=sideways`)))).status, 400);
});

test("assistant-style questions retrieve WHO genomics guidance and existing wet-lab protocols", async () => {
  const cases = [
    ["foodborne WGS", "9789240021228"],
    ["pathogen genome data sharing", "9789240061743"],
    ["national genomic surveillance strategy", "9789240076563"],
    ["DNA extraction protocol", "bq3ymypw"],
    ["how do I implement WGS for foodborne outbreak investigations?", "9789240021242"],
  ];
  for (const [question, expectedIdPart] of cases) {
    const { body } = await json(search(request(`/api/v1/search?q=${encodeURIComponent(question)}`)));
    assert.ok(body.items.some((item) => item.id.includes(expectedIdPart)), `Missing ${expectedIdPart} for ${question}`);
  }
});

test("WHO guidance retains provenance without claiming an unverified resource licence", async () => {
  const id = encodeURIComponent("https://www.who.int/publications/i/item/9789240076563");
  const result = (await json(resource(request(`/api/v1/resource?id=${id}`)))).body.resource;
  assert.equal(result.sources[0].name, "World Health Organization publication");
  assert.equal(result.license, undefined);
  const links = (await json(connections(request(`/api/v1/connections?id=${id}`)))).body.items;
  assert.ok(links.some((item) => item.predicate === "isSupplementTo" && item.evidence[0].source === "https://www.who.int/initiatives/genomic-surveillance-strategy"));
});

test("new WHO WGS materials are discoverable by use case", async () => {
  const cases = [
    ["genomics costing", "https://iris.who.int/handle/10665/385075"],
    ["TB genomics", "epi-win-digest-52"],
    ["gonococcal WGS", "9789240086647"],
    ["RSV WGS", "9789240111547"],
    ["AMR WGS", "9789240011007"],
  ];
  for (const [q, expectedIdPart] of cases) {
    const { body } = await json(search(request(`/api/v1/search?q=${encodeURIComponent(q)}`)));
    assert.ok(body.items.some((item) => item.id.includes(expectedIdPart)), `Missing ${expectedIdPart} for ${q}`);
  }
});

test("the costing workbook and data-sharing principles have verified document links", async () => {
  const tool = encodeURIComponent("https://iris.who.int/handle/10665/385075");
  const toolLinks = (await json(connections(request(`/api/v1/connections?id=${tool}`)))).body.items;
  assert.ok(toolLinks.some((item) => item.predicate === "isDocumentedBy" && item.neighbour.id.endsWith("9789240118843") && item.evidence.length));

  const platform = encodeURIComponent("https://www.who.int/publications/b/80650");
  const record = (await json(resource(request(`/api/v1/resource?id=${platform}`)))).body.resource;
  assert.equal(record.license, "https://creativecommons.org/licenses/by-nc-sa/3.0/igo/");
  const links = (await json(connections(request(`/api/v1/connections?id=${platform}`)))).body.items;
  assert.ok(links.some((item) => item.predicate === "isSupplementTo" && item.neighbour.id.endsWith("9789240061743") && item.evidence.length));
});

test("WHO IRIS pathogen-genomics resources are searchable and their annexes link to the main guidance", async () => {
  for (const [query, handle] of [
    ["foodborne WGS landscape", "10665/272430"],
    ["mpox genomic surveillance", "10665/384542"],
    ["drug resistant tuberculosis sequencing", "10665/373419"],
  ]) {
    const { body } = await json(search(request(`/api/v1/search?q=${encodeURIComponent(query)}&source=WHO%20IRIS`)));
    assert.ok(body.items.some((item) => item.id.endsWith(handle)), `Missing WHO IRIS ${handle} for ${query}`);
  }
  const annex = encodeURIComponent("https://iris.who.int/handle/10665/373521");
  const links = (await json(connections(request(`/api/v1/connections?id=${annex}`)))).body.items;
  assert.ok(links.some((item) => item.predicate === "isSupplementTo" && item.neighbour.id.endsWith("9789240021242") && item.evidence[0].source.includes("iris.who.int/server/api/core/items/")));
});
