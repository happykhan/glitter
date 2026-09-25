import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDatasets, mergeCatalogue } from "../scripts/catalogue-data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const catalogue = mergeCatalogue(loadDatasets(root));
export const entitiesById = new Map(catalogue.entities.map((entity) => [entity.id, entity]));
export const resources = catalogue.entities.filter((entity) => !entity.types.includes("Organization") && !entity.types.includes("Concept"));

export function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": status === 200 ? "public, max-age=300, s-maxage=3600" : "no-store",
    },
  });
}

export function error(message, status = 400) {
  return json({ error: { code: status === 404 ? "not_found" : "invalid_request", message } }, status);
}

export function readId(url) {
  const id = url.searchParams.get("id")?.trim();
  if (!id) return { error: error("Provide an entity URI in the id query parameter.") };
  if (id.length > 1000) return { error: error("The id parameter is too long.") };
  const entity = entitiesById.get(id) ?? catalogue.entities.find((candidate) => candidate.identifiers?.some((identifier) => identifier.uri === id || identifier.value === id));
  return entity ? { entity } : { error: error("No entity with that identifier is in the Glitter catalogue.", 404) };
}

export function usefulRelationships(id, includeCatalogue = false) {
  return catalogue.relationships.filter((relationship) => relationship.status === "verified" && (includeCatalogue || relationship.predicate !== "cataloguedBy") && (relationship.subject === id || relationship.object === id));
}
