import { catalogue, error, json, resources, usefulRelationships } from "../_data.js";

const aliases = {
  amr: "antimicrobial resistance",
  wgs: "whole genome sequencing",
  cgmlst: "core genome multilocus sequence typing",
  qc: "quality control",
  extraction: "isolation",
  extract: "isolation",
};
const stopWords = new Set(["a", "an", "and", "are", "can", "do", "does", "find", "for", "how", "i", "implement", "in", "is", "me", "of", "on", "show", "the", "to", "use", "using", "what", "which", "with"]);
const normalise = (value) => String(value ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
const matches = (value, search) => normalise(value).includes(normalise(search));

function score(entity, query) {
  const words = normalise(query).split(/\s+/).filter((word) => word && !stopWords.has(word));
  if (!words.length) return 0;
  const fields = [
    [entity.name, 12],
    ...((entity.identifiers ?? []).flatMap((item) => [[item.value, 11], [item.uri, 7]])),
    [entity.id, 7],
    [entity.description, 4],
    [entity.types.join(" "), 3],
    [(entity.facets ?? []).map((facet) => facet.label).join(" "), 5],
    [(entity.sources ?? []).map((source) => source.name).join(" "), 2],
  ];
  let total = 0;
  for (const word of words) {
    const choices = [word, aliases[word]].filter(Boolean);
    const best = Math.max(0, ...fields.map(([value, weight]) => choices.some((term) => matches(value, term)) ? weight : 0));
    if (!best) return -1;
    total += best;
  }
  return total + (matches(entity.name, query) ? 10 : 0);
}

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

  const found = resources.map((entity) => ({ entity, relevance: score(entity, q) })).filter(({ entity, relevance }) => {
    if (relevance < 0) return false;
    if (type && !entity.types.some((value) => matches(value, type))) return false;
    if (method && !(entity.facets ?? []).some((facet) => facet.scheme === "Glitter method stage" && (matches(facet.label, method) || matches(facet.id, method)))) return false;
    if (application && !(entity.facets ?? []).some((facet) => facet.scheme === "Glitter application" && (matches(facet.label, application) || matches(facet.id, application)))) return false;
    if (target && !(entity.facets ?? []).some((facet) => facet.scheme === "Glitter target" && (matches(facet.label, target) || matches(facet.id, target)))) return false;
    if (source && !(entity.sources ?? []).some((item) => matches(item.name, source))) return false;
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
    items: found.slice(offset, offset + limit).map(({ entity }) => ({ ...entity, verifiedConnectionCount: usefulRelationships(entity.id).length })),
  });
}
