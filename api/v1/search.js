import { catalogue, error, json, practicalQuestions, questionRoutesFor, resources, usefulRelationships } from "../_data.js";
import { matchesText, questionTitlesByResource, scoreResource } from "../../shared/resource-search.js";

const routeTitles = questionTitlesByResource(practicalQuestions);

function fundingState(entity) {
  const funding = entity.fundingOpportunity;
  if (!funding) return null;
  if (funding.status === "rolling") return "rolling";
  const today = new Date().toISOString().slice(0, 10);
  if (funding.opens && today < funding.opens) return "upcoming";
  if (funding.closes && today > funding.closes) return "closed";
  return "open";
}

function readNumber(value, fallback, max) {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number <= max ? number : null;
}

export function GET(request) {
  const params = new URL(request.url).searchParams;
  const q = params.get("q")?.trim() ?? "";
  if (q.length > 200) return error("q must be 200 characters or fewer.");
  const limit = readNumber(params.get("limit"), 10, 50);
  const offset = readNumber(params.get("offset"), 0, 10000);
  if (limit === null || limit < 1) return error("limit must be an integer from 1 to 50.");
  if (offset === null) return error("offset must be an integer from 0 to 10000.");
  const funding = params.get("funding");
  if (funding && !["open", "upcoming", "closed", "rolling"].includes(funding)) return error("funding must be open, upcoming, closed or rolling.");
  const type = params.get("type");
  const method = params.get("method");
  const application = params.get("application");
  const target = params.get("target");
  const source = params.get("source");
  for (const key of ["licenseKnown", "connected"]) if (params.has(key) && !["true", "false"].includes(params.get(key))) return error(`${key} must be true or false.`);
  const licenseKnown = params.get("licenseKnown") === "true";
  const connected = params.get("connected") === "true";
  for (const value of [type, method, application, target, source]) if (value && value.length > 100) return error("Filter values must be 100 characters or fewer.");

  const found = resources.map((entity) => ({ entity, relevance: scoreResource(entity, q, routeTitles.get(entity.id)) })).filter(({ entity, relevance }) => {
    if (relevance < 0) return false;
    if (type && !entity.types.some((value) => matchesText(value, type))) return false;
    if (method && !(entity.facets ?? []).some((facet) => facet.scheme === "Glitter method stage" && (matchesText(facet.label, method) || matchesText(facet.id, method)))) return false;
    if (application && !(entity.facets ?? []).some((facet) => facet.scheme === "Glitter application" && (matchesText(facet.label, application) || matchesText(facet.id, application)))) return false;
    if (target && !(entity.facets ?? []).some((facet) => facet.scheme === "Glitter target" && (matchesText(facet.label, target) || matchesText(facet.id, target)))) return false;
    if (source && !(entity.sources ?? []).some((item) => matchesText(item.name, source))) return false;
    if (funding && fundingState(entity) !== funding) return false;
    if (licenseKnown && !entity.license) return false;
    if (connected && usefulRelationships(entity.id).length === 0) return false;
    return true;
  }).sort((a, b) => b.relevance - a.relevance || a.entity.name.localeCompare(b.entity.name));

  return json({
    apiVersion: "1",
    standardVersion: catalogue.standardVersion,
    kind: "SearchResults",
    query: q,
    filters: { type, method, application, target, source, funding, licenseKnown, connected },
    total: found.length,
    limit,
    offset,
    items: found.slice(offset, offset + limit).map(({ entity }) => ({ ...entity, verifiedConnectionCount: usefulRelationships(entity.id).length, questionRoutes: questionRoutesFor(entity.id) })),
  });
}
