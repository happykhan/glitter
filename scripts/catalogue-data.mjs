import fs from "node:fs";
import path from "node:path";

export const STANDARD_VERSION = "0.1.0";

function jsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(target);
    return entry.isFile() && entry.name.endsWith(".json") ? [target] : [];
  });
}

export function loadDatasets(root) {
  return ["data/seed", "data/community"]
    .flatMap((directory) => jsonFiles(path.join(root, directory)))
    .sort()
    .map((file) => ({
      file,
      name: path.relative(root, file),
      data: JSON.parse(fs.readFileSync(file, "utf8")),
    }));
}

function uniqueObjects(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = JSON.stringify(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function mergeCatalogue(datasets) {
  const entityMap = new Map();
  for (const { data } of datasets) {
    for (const entity of data.entities) {
      const existing = entityMap.get(entity.id);
      entityMap.set(entity.id, existing ? {
        ...existing,
        ...entity,
        types: [...new Set([...existing.types, ...entity.types])],
        identifiers: uniqueObjects([...(existing.identifiers ?? []), ...(entity.identifiers ?? [])]),
        sources: uniqueObjects([...(existing.sources ?? []), ...(entity.sources ?? [])]),
        facets: uniqueObjects([...(existing.facets ?? []), ...(entity.facets ?? [])]),
        distributions: uniqueObjects([...(existing.distributions ?? []), ...(entity.distributions ?? [])]),
      } : entity);
    }
  }

  const relationshipMap = new Map();
  for (const { data } of datasets) {
    for (const relationship of data.relationships) relationshipMap.set(relationship.id, relationship);
  }

  return {
    standardVersion: STANDARD_VERSION,
    entities: [...entityMap.values()].sort((a, b) => a.name.localeCompare(b.name)),
    relationships: [...relationshipMap.values()].sort((a, b) => a.id.localeCompare(b.id)),
  };
}
