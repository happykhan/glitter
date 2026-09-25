import { catalogue, entitiesById, error, json, readId, usefulRelationships } from "../_data.js";

export function GET(request) {
  const url = new URL(request.url);
  const found = readId(url);
  if (found.error) return found.error;
  const direction = url.searchParams.get("direction") ?? "both";
  if (!["both", "out", "in"].includes(direction)) return error("direction must be both, out or in.");
  if (url.searchParams.has("includeCatalogue") && !["true", "false"].includes(url.searchParams.get("includeCatalogue"))) return error("includeCatalogue must be true or false.");
  const includeCatalogue = url.searchParams.get("includeCatalogue") === "true";
  const connections = usefulRelationships(found.entity.id, includeCatalogue).filter((relationship) => direction === "both" || (direction === "out" ? relationship.subject === found.entity.id : relationship.object === found.entity.id)).map((relationship) => {
    const neighbourId = relationship.subject === found.entity.id ? relationship.object : relationship.subject;
    const neighbour = entitiesById.get(neighbourId);
    return {
      id: relationship.id,
      subject: relationship.subject,
      predicate: relationship.predicate,
      object: relationship.object,
      direction: relationship.subject === found.entity.id ? "out" : "in",
      description: relationship.description ?? null,
      status: relationship.status,
      assertedOn: relationship.assertedOn,
      evidence: relationship.evidence ?? [],
      neighbour: neighbour ? { id: neighbour.id, name: neighbour.name, types: neighbour.types, landingPage: neighbour.landingPage } : null,
    };
  });
  return json({ apiVersion: "1", standardVersion: catalogue.standardVersion, kind: "Connections", resource: { id: found.entity.id, name: found.entity.name }, total: connections.length, items: connections });
}
