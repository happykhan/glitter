import { catalogue, json, questionRoutesFor, readId, usefulRelationships } from "../_data.js";

export function GET(request) {
  const found = readId(new URL(request.url));
  if (found.error) return found.error;
  return json({
    apiVersion: "1",
    standardVersion: catalogue.standardVersion,
    kind: "Resource",
    resource: found.entity,
    verifiedConnectionCount: usefulRelationships(found.entity.id).length,
    questionRoutes: questionRoutesFor(found.entity.id),
  });
}
