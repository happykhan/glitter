import { facetAxis, fundingState, readableType, resourceRelations, type Entity } from "./data";

export type Filters = {
  types: string[];
  facets: string[];
  sources: string[];
  funding: string[];
  licenceKnown: boolean;
  connectedOnly: boolean;
};

export const EMPTY_FILTERS: Filters = { types: [], facets: [], sources: [], funding: [], licenceKnown: false, connectedOnly: false };

const aliases: Record<string, string[]> = {
  amr: ["antimicrobial resistance"],
  wgs: ["whole genome sequencing", "genome sequencing", "genomics"],
  cgmlst: ["core genome multilocus sequence typing", "allele typing"],
  qc: ["quality control"],
  sarscov2: ["sars-cov-2"],
};

const normalise = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();

export function searchScore(entity: Entity, query: string): number {
  const words = normalise(query).split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  const fields = [
    [entity.name, 12],
    ...((entity.identifiers ?? []).flatMap((identifier) => [[identifier.value, 11], [identifier.uri ?? "", 7]] as [string, number][])),
    [entity.id, 7],
    [entity.description ?? "", 4],
    [entity.types.map(readableType).join(" "), 3],
    [(entity.facets ?? []).map((facet) => `${facet.label} ${facetAxis(facet)}`).join(" "), 5],
    [(entity.sources ?? []).map((source) => source.name).join(" "), 2],
  ] as [string, number][];
  let score = 0;
  for (const word of words) {
    const expanded = [word, ...(aliases[word] ?? [])];
    const best = Math.max(0, ...fields.map(([value, weight]) => expanded.some((term) => normalise(value).includes(normalise(term))) ? weight : 0));
    if (!best) return -1;
    score += best;
  }
  if (normalise(entity.name).includes(normalise(query))) score += 10;
  return score;
}

export function matchesFilters(entity: Entity, query: string, filters: Filters) {
  if (searchScore(entity, query) < 0) return false;
  if (filters.types.length && !entity.types.some((type) => filters.types.includes(type))) return false;
  if (filters.facets.length && !(entity.facets ?? []).some((facet) => filters.facets.includes(`${facetAxis(facet)}|${facet.label}`))) return false;
  if (filters.sources.length && !(entity.sources ?? []).some((source) => filters.sources.includes(source.name))) return false;
  if (filters.funding.length && !filters.funding.includes(fundingState(entity) ?? "not-funding")) return false;
  if (filters.licenceKnown && !entity.license) return false;
  if (filters.connectedOnly && resourceRelations(entity.id).every((relation) => relation.predicate === "cataloguedBy")) return false;
  return true;
}

export function readDiscoveryUrl(search: string) {
  const params = new URLSearchParams(search);
  const known = (key: string) => params.getAll(key).filter(Boolean);
  return {
    query: params.get("q") ?? "",
    selectedId: params.get("resource"),
    filters: {
      types: known("type"), facets: known("facet"), sources: known("source"), funding: known("funding"),
      licenceKnown: params.has("licence"), connectedOnly: params.has("connected"),
    } as Filters,
  };
}

export function writeDiscoveryUrl(query: string, filters: Filters, selectedId: string | null) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  for (const value of filters.types) params.append("type", value);
  for (const value of filters.facets) params.append("facet", value);
  for (const value of filters.sources) params.append("source", value);
  for (const value of filters.funding) params.append("funding", value);
  if (filters.licenceKnown) params.set("licence", "1");
  if (filters.connectedOnly) params.set("connected", "1");
  if (selectedId) params.set("resource", selectedId);
  return params.toString();
}
