import assert from "node:assert/strict";
import test from "node:test";
import { GET as search } from "../api/v1/search.js";
import { GET as resource } from "../api/v1/resource.js";
import { GET as connections } from "../api/v1/connections.js";
import { GET as question } from "../api/v1/question.js";

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

test("a WHO IRIS handle resolves to the existing national strategy record", async () => {
  const alias = encodeURIComponent("https://iris.who.int/handle/10665/372390");
  const { status, body } = await json(resource(request(`/api/v1/resource?id=${alias}`)));
  assert.equal(status, 200);
  assert.equal(body.resource.id, "https://www.who.int/publications/i/item/9789240076563");
});

test("implementation resources answer concrete planning and accreditation queries", async () => {
  const cases = [
    ["bioinformatics infrastructure", "https://github.com/pha4ge/infrastructure-resources"],
    ["NGS implementation guide", "https://aphl.org/docs/default-source/technical/ID-NGS-Implementation-Guide102016.pdf"],
    ["pathogen genomics accreditation", "https://doi.org/10.1099/mgen.0.001097"],
    ["foodborne typing implementation", "https://www.ecdc.europa.eu/en/publications-data/expert-opinion-introduction-next-generation-typing-methods-food-and-waterborne"],
  ];
  for (const [q, id] of cases) {
    const { body } = await json(search(request(`/api/v1/search?q=${encodeURIComponent(q)}&limit=50`)));
    assert.ok(body.items.some((item) => item.id === id), `Missing ${id} for ${q}`);
  }
  const pha4ge = (await json(resource(request(`/api/v1/resource?id=${encodeURIComponent(cases[0][1])}`)))).body.resource;
  assert.equal(pha4ge.license, "https://www.apache.org/licenses/LICENSE-2.0");
  const ballard = (await json(resource(request(`/api/v1/resource?id=${encodeURIComponent(cases[2][1])}`)))).body.resource;
  assert.equal(ballard.license, undefined);
});

test("natural-language implementation questions retrieve ranked routes and keep route links editorial", async () => {
  const cases = [
    ["What server do I buy for bioinformatics?", "bioinformatics-server", "https://github.com/pha4ge/infrastructure-resources"],
    ["How do I set up foodborne pathogen WGS surveillance?", "foodborne-wgs", "https://www.who.int/publications/i/item/9789240021228"],
    ["What accreditation applies to pathogen genomics?", "accreditation", "https://doi.org/10.1099/mgen.0.001097"],
  ];
  for (const [question, routeId, expectedId] of cases) {
    const { status, body } = await json(search(request(`/api/v1/search?q=${encodeURIComponent(question)}&limit=50`)));
    assert.equal(status, 200);
    assert.ok(body.items.slice(0, 3).some((item) => item.id === expectedId), `${question}: expected ${expectedId} in top 3`);
    const expected = body.items.find((item) => item.id === expectedId);
    assert.ok(expected.questionRoutes.some((route) => route.id === routeId));
    const record = (await json(resource(request(`/api/v1/resource?id=${encodeURIComponent(expectedId)}`)))).body;
    assert.ok(record.questionRoutes.some((route) => route.id === routeId));
    assert.ok(record.verifiedConnectionCount > 0);
    const linked = (await json(connections(request(`/api/v1/connections?id=${encodeURIComponent(expectedId)}`)))).body.items;
    assert.ok(linked.every((item) => item.status === "verified" && item.evidence.length));
  }
  const foodborne = (await json(search(request(`/api/v1/search?q=${encodeURIComponent(cases[1][0])}`)))).body;
  assert.equal(foodborne.items[0].id, "https://www.who.int/publications/i/item/9789240021228");
  const unrelated = (await json(search(request("/api/v1/search?q=quantum%20banana")))).body;
  assert.equal(unrelated.total, 0);
});

test("question lookup selects the right route and includes ordered resource summaries", async () => {
  for (const [query, expectedId] of [
    ["What server do I buy for bioinformatics?", "bioinformatics-server"],
    ["How do I sequence wastewater for pathogen surveillance?", "wastewater-sequencing"],
    ["How do I set up foodborne pathogen WGS surveillance?", "foodborne-wgs"],
    ["What are MLST and cgMLST?", "mlst-cgmlst"],
    ["What skills does a public-health bioinformatics team need?", "bioinformatics-skills"],
    ["What accreditation applies to pathogen-genomics work?", "accreditation"],
  ]) {
    const { status, body } = await json(question(request(`/api/v1/question?q=${encodeURIComponent(query)}`)));
    assert.equal(status, 200);
    assert.equal(body.kind, "QuestionMatches");
    assert.equal(body.items[0]?.id, expectedId, query);
    assert.ok(body.items[0].answer && body.items[0].askFirst && body.items[0].gap);
    assert.ok(body.items[0].steps.every((step) => step.resources.length === step.resourceIds.length && step.resources.every((item) => item.id && item.name && item.landingPage)));
  }
  const foodborne = (await json(question(request("/api/v1/question?q=foodborne%20WGS%20surveillance")))).body;
  assert.ok(foodborne.items.every((item) => item.id !== "wastewater-sequencing"));
  assert.equal((await json(question(request("/api/v1/question?q=sewage%20sequencing")))).body.items[0]?.id, "wastewater-sequencing");
  assert.equal((await json(question(request("/api/v1/question?q=food-borne%20WGS")))).body.items[0]?.id, "foodborne-wgs");
  const unknown = (await json(question(request("/api/v1/question?q=quantum%20banana")))).body;
  assert.equal(unknown.total, 0);
  assert.equal((await json(question(request("/api/v1/question?id=mlst-cgmlst")))).body.items[0].id, "mlst-cgmlst");
  assert.equal((await json(question(request("/api/v1/question?id=unknown")))).status, 404);
  assert.equal((await json(question(request("/api/v1/question?q=foodborne&id=foodborne-wgs")))).status, 400);
});

test("implementation graph links state the source-supported relationship, not just a shared topic", async () => {
  for (const [id, predicate, neighbour] of [
    ["https://github.com/pha4ge/infrastructure-resources", "mentions", "https://pha4ge.org/working-groups/infrastructure/"],
    ["https://www.who.int/publications/i/item/9789240021228", "mentions", "https://www.who.int/publications/i/item/9789240021242"],
    ["https://doi.org/10.1099/mgen.0.001097", "describes", "https://www.iso.org/standard/76677.html"],
  ]) {
    const { body } = await json(connections(request(`/api/v1/connections?id=${encodeURIComponent(id)}`)));
    assert.ok(body.items.some((item) => item.predicate === predicate && item.neighbour.id === neighbour && item.evidence[0].source.startsWith("https://")));
  }
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

test("course search distinguishes open enrolment from courses that are not running", async () => {
  const harvard = (await json(search(request("/api/v1/search?q=sequencing%20strategies&type=TrainingResource")))).body.items;
  assert.ok(harvard.some((item) => item.trainingCourse?.availability === "open" && item.trainingCourse.platform === "Harvard Medical School"));
  const futurelearn = (await json(search(request("/api/v1/search?q=SARS-CoV-2%20whole%20genome%20sequencing&type=TrainingResource&source=FutureLearn")))).body.items;
  assert.ok(futurelearn.some((item) => item.trainingCourse?.availability === "not-running"));
});

test("Pathogenwatch software is discoverable and its components are independently inspectable", async () => {
  for (const [q, expectedId] of [
    ["Pathogenwatch", "https://pathogen.watch/"],
    ["Pathogenwatch tools", "https://pathogen.watch/"],
    ["Kleborate Klebsiella AMR", "https://github.com/klebgenomics/Kleborate"],
    ["Salmonella serotyping", "https://github.com/phac-nml/sistr_cmd"],
    ["Salmonella serotyping SISTR", "https://github.com/phac-nml/sistr_cmd"],
    ["pneumococcal SeroBA", "https://github.com/sanger-pathogens/seroba"],
  ]) {
    const { body } = await json(search(request(`/api/v1/search?q=${encodeURIComponent(q)}&limit=50`)));
    assert.ok(body.items.some((item) => item.id === expectedId), `${q}: ${expectedId}`);
  }
  const platform = encodeURIComponent("https://pathogen.watch/");
  const { body } = await json(connections(request(`/api/v1/connections?id=${platform}`)));
  assert.ok(body.items.some((item) => item.predicate === "uses" && item.neighbour.id === "https://github.com/klebgenomics/Kleborate"));
  assert.ok(body.items.some((item) => item.predicate === "uses" && item.neighbour.id === "https://github.com/phac-nml/sistr_cmd"));
  const kaptive = (await json(resource(request(`/api/v1/resource?id=${encodeURIComponent("https://github.com/klebgenomics/Kaptive")}`)))).body.resource;
  assert.match(kaptive.license, /LICENSE$/);
});
