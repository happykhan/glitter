import { facetAxis, fundingState, isUsefulRelationship, resourceRelations, type Entity } from "./data";
import questions from "../content/questions.json";
import { questionTitlesByResource, scoreResource } from "../shared/resource-search.js";

export type Filters = {
  types: string[];
  facets: string[];
  sources: string[];
  funding: string[];
  licenceKnown: boolean;
  connectedOnly: boolean;
};

export const EMPTY_FILTERS: Filters = { types: [], facets: [], sources: [], funding: [], licenceKnown: false, connectedOnly: false };

const routeTitles = questionTitlesByResource(questions);

export function searchScore(entity: Entity, query: string): number {
  return scoreResource(entity, query, routeTitles.get(entity.id));
}

export function matchesFilters(entity: Entity, query: string, filters: Filters) {
  if (searchScore(entity, query) < 0) return false;
  if (filters.types.length && !entity.types.some((type) => filters.types.includes(type))) return false;
  if (filters.facets.length && !(entity.facets ?? []).some((facet) => filters.facets.includes(`${facetAxis(facet)}|${facet.label}`))) return false;
  if (filters.sources.length && !(entity.sources ?? []).some((source) => filters.sources.includes(source.name))) return false;
  if (filters.funding.length && !filters.funding.includes(fundingState(entity) ?? "not-funding")) return false;
  if (filters.licenceKnown && !entity.license) return false;
  if (filters.connectedOnly && !resourceRelations(entity.id).some(isUsefulRelationship)) return false;
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
