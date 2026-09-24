#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const schema = JSON.parse(fs.readFileSync(path.join(root, "schema/glitter.schema.json"), "utf8"));
const seedDirectory = path.join(root, "data/seed");
const seedFiles = fs.readdirSync(seedDirectory).filter((name) => name.endsWith(".json")).sort();
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);
const datasets = seedFiles.map((name) => ({ name, data: JSON.parse(fs.readFileSync(path.join(seedDirectory, name), "utf8")) }));

let failed = false;
for (const { name, data } of datasets) {
  if (!validate(data)) {
    failed = true;
    console.error(`${name}: schema validation failed`);
    for (const error of validate.errors ?? []) console.error(`  ${error.instancePath || "/"} ${error.message}`);
  }
}

const ids = new Set();
for (const { name, data } of datasets) {
  for (const entity of data.entities) {
    if (ids.has(entity.id)) {
      failed = true;
      console.error(`${name}: duplicate entity id ${entity.id}`);
    }
    ids.add(entity.id);
  }
}

const relationshipIds = new Set();
for (const { name, data } of datasets) {
  for (const relationship of data.relationships) {
    if (relationshipIds.has(relationship.id)) {
      failed = true;
      console.error(`${name}: duplicate relationship id ${relationship.id}`);
    }
    relationshipIds.add(relationship.id);
    if (!ids.has(relationship.subject) || !ids.has(relationship.object)) {
      failed = true;
      console.error(`${name}: relationship ${relationship.id} points to an unknown entity`);
    }
  }
}

if (failed) process.exit(1);
const entityCount = datasets.reduce((count, dataset) => count + dataset.data.entities.length, 0);
const relationshipCount = datasets.reduce((count, dataset) => count + dataset.data.relationships.length, 0);
console.log(`Validated ${seedFiles.length} datasets: ${entityCount} entities and ${relationshipCount} relationships.`);
