#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDatasets } from "./catalogue-data.mjs";
import { buildSelectedCatalogue, IRIS_API } from "./who-iris-importer.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "data/seed/who-iris.json");
const selected = JSON.parse(fs.readFileSync(path.join(root, "config/who-iris-selected.json"), "utf8")).items;
const args = process.argv.slice(2);
const write = args.includes("--write");
const discoverAt = args.indexOf("--discover");
if (args.some((arg, index) => !["--write", "--discover"].includes(arg) && !(discoverAt >= 0 && index === discoverAt + 1))) {
  throw new Error("Usage: node scripts/import-who-iris.mjs [--write] [--discover 'topic']");
}

async function getJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json", "user-agent": "Glitter WHO IRIS importer/0.1" } });
  if (!response.ok) throw new Error(`IRIS returned HTTP ${response.status}: ${url}`);
  return response.json();
}

if (discoverAt >= 0) {
  const query = args[discoverAt + 1];
  if (!query || write) throw new Error("Use --discover 'topic' without --write; discovery never publishes records.");
  const url = new URL(`${IRIS_API}/discover/search/objects`);
  url.searchParams.set("query", query);
  url.searchParams.set("size", "20");
  const results = await getJson(url);
  const objects = results._embedded?.searchResult?._embedded?.objects ?? [];
  for (const result of objects) {
    const item = result._embedded?.indexableObject;
    if (item?.uuid) console.log(JSON.stringify({ uuid: item.uuid, name: item.name, handle: item.metadata?.["dc.identifier.uri"]?.[0]?.value ?? null }));
  }
  process.exit(0);
}

const existing = loadDatasets(root)
  .filter(({ file }) => file !== output)
  .flatMap(({ data }) => data.entities);
const items = [];
for (const selection of selected) items.push(await getJson(`${IRIS_API}/core/items/${selection.uuid}`));
const retrievedAt = new Date().toISOString().slice(0, 10);
const result = buildSelectedCatalogue(selected, items, existing, retrievedAt);
console.log(`WHO IRIS: ${result.catalogue.entities.length} new resources, ${result.catalogue.relationships.length} evidenced relationships, ${result.skipped.length} existing matches.`);
for (const skipped of result.skipped) console.log(`Skipped ${skipped.handle}: already ${skipped.existingId}`);
for (const warning of result.warnings) console.warn(`Review: ${warning}`);
if (write) {
  fs.writeFileSync(output, `${JSON.stringify(result.catalogue, null, 2)}\n`);
  console.log(`Wrote ${output}`);
} else {
  console.log("Preview only. Run with --write to update the reviewed selection in data/seed/who-iris.json.");
}
