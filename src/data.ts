export type Source = {
  name: string;
  sourceUrl: string;
  sourceRecordId?: string;
  sourceLicense?: string;
  retrievedAt: string;
  sourceUpdatedAt?: string;
  sourceRevision?: string;
};

export type Facet = { scheme: string; id: string; label: string; uri?: string };
export type Identifier = { scheme: string; value: string; uri?: string };
export type FundingDetails = {
  applicationUrl: string;
  opens?: string;
  closes?: string;
  status: "upcoming" | "open" | "rolling" | "closed";
  eligibility?: string;
  geographicScope?: string[];
  amount?: number;
  currency?: string;
  lastChecked: string;
};

export type Entity = {
  id: string;
  types: string[];
  name: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  identifiers?: Identifier[];
  landingPage?: string;
  license?: string;
  facets?: Facet[];
  sources?: Source[];
  status?: string;
  fundingOpportunity?: FundingDetails;
};

export type Evidence = { source: string; locator?: string; quote?: string };
export type Relationship = {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  description?: string;
  evidence?: Evidence[];
  assertedOn?: string;
  status?: "proposed" | "verified" | "disputed" | "retracted";
};

export type GraphKind = "resource" | "organization";
export type GraphNode = {
  id: string;
  name: string;
  kind: GraphKind;
  entity: Entity;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
};
export type GraphLink = {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  predicate: string;
  relationship: Relationship;
};

type Dataset = { standardVersion: string; entities: Entity[]; relationships: Relationship[] };
const datasetModules = import.meta.glob("../data/{seed,community}/*.json", { eager: true, import: "default" }) as Record<string, Dataset>;
const datasets = Object.entries(datasetModules).sort(([left], [right]) => left.localeCompare(right)).map(([, dataset]) => dataset);
const entityMap = new Map<string, Entity>();
for (const dataset of datasets) {
  for (const item of dataset.entities as Entity[]) {
    const existing = entityMap.get(item.id);
    entityMap.set(item.id, existing ? {
      ...existing,
      ...item,
      types: [...new Set([...existing.types, ...item.types])],
      sources: [...(existing.sources ?? []), ...(item.sources ?? [])],
      facets: [...(existing.facets ?? []), ...(item.facets ?? [])],
    } : item);
  }
}

export const entities = [...entityMap.values()];
export const relationships = datasets.flatMap((dataset) => dataset.relationships as Relationship[]);
export const resources = entities.filter((entity) => !entity.types.includes("Organization") && !entity.types.includes("Concept"));
export const organizations = entities.filter((entity) => entity.types.includes("Organization"));

export const typeLabels: Record<string, string> = {
  Publication: "Paper",
  Software: "Software",
  ComputationalWorkflow: "Workflow",
  Protocol: "Protocol",
  Dataset: "Dataset",
  DataStandard: "Data standard",
  TrainingResource: "Training",
  GuidanceDocument: "Guidance",
  FundingOpportunity: "Funding call",
  Project: "Project",
  Database: "Database",
  StrainCollection: "Strain collection",
  Instrument: "Instrument",
  Event: "Event",
  Person: "Person",
  Organization: "Organisation",
  Concept: "Concept",
};

export const predicateLabels: Record<string, string> = {
  mentions: "mentions",
  describes: "describes",
  uses: "uses",
  acceptsInput: "accepts input",
  producesOutput: "produces output",
  implements: "implements",
  conformsTo: "conforms to",
  mapsTo: "maps to",
  hasPart: "has part",
  supersedes: "supersedes",
  isDocumentedBy: "is documented by",
  isSupplementTo: "is supplement to",
  offeredBy: "offered by",
  teaches: "teaches",
  authoredBy: "authored by",
  maintainedBy: "maintained by",
  publishedBy: "published by",
  cataloguedBy: "catalogued by",
  about: "about",
  appliesToTaxon: "applies to taxon",
};

export function readableType(type: string) {
  return typeLabels[type] ?? type.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export function facetAxis(facet: Facet) {
  const scheme = facet.scheme.toLowerCase();
  if (scheme.includes("method")) return "Method";
  if (scheme.includes("application")) return "Application";
  return "Target";
}

export function resourceRelations(id: string) {
  return relationships.filter((relationship) => relationship.subject === id || relationship.object === id);
}

export function isUsefulRelationship(relationship: Relationship) {
  return relationship.status === "verified" && relationship.predicate !== "cataloguedBy";
}

export function fundingState(entity: Entity, today = new Date()) {
  const funding = entity.fundingOpportunity;
  if (!funding) return null;
  const day = today.toISOString().slice(0, 10);
  if (funding.status === "rolling") return "rolling";
  if (funding.opens && day < funding.opens) return "upcoming";
  if (funding.closes && day > funding.closes) return "closed";
  return "open";
}

export function buildResourceGraph(visibleIds?: Set<string>, includeCatalogueLinks = false) {
  const substantive = relationships.filter((relationship) => relationship.status === "verified" && (includeCatalogueLinks || relationship.predicate !== "cataloguedBy"));
  const included = new Set<string>();
  if (visibleIds) {
    for (const id of visibleIds) included.add(id);
    for (const relationship of substantive) {
      if (visibleIds.has(relationship.subject) || visibleIds.has(relationship.object)) {
        included.add(relationship.subject);
        included.add(relationship.object);
      }
    }
  } else {
    for (const entity of resources) included.add(entity.id);
    for (const relationship of substantive) {
      included.add(relationship.subject);
      included.add(relationship.object);
    }
  }

  const nodes: GraphNode[] = entities
    .filter((entity) => included.has(entity.id))
    .map((entity) => ({ id: entity.id, name: entity.name, kind: entity.types.includes("Organization") ? "organization" : "resource", entity }));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const links: GraphLink[] = substantive
    .filter((relationship) => nodeIds.has(relationship.subject) && nodeIds.has(relationship.object))
    .map((relationship) => ({
      id: relationship.id,
      source: relationship.subject,
      target: relationship.object,
      predicate: predicateLabels[relationship.predicate] ?? relationship.predicate,
      relationship,
    }));
  return { nodes, links };
}

export const filterOptions = {
  types: [...new Set(resources.flatMap((entity) => entity.types))].sort((a, b) => readableType(a).localeCompare(readableType(b))),
  facets: [...new Set(resources.flatMap((entity) => (entity.facets ?? []).map((facet) => `${facetAxis(facet)}|${facet.label}`)))].sort(),
  sources: [...new Set(resources.flatMap((entity) => (entity.sources ?? []).map((source) => source.name)))].sort(),
};

export function licenceLabel(url?: string) {
  if (!url) return "Not recorded";
  if (/spdx\.org\/licenses\/MIT/.test(url)) return "MIT";
  if (/LGPL-3\.0/.test(url)) return "LGPL-3.0";
  if (/GPL-3\.0/.test(url)) return "GPL-3.0";
  if (/creativecommons\.org\/licenses\/by\/4\.0/.test(url)) return "CC BY 4.0";
  if (/github\.com\/ncbi\/amr\/blob\/master\/LICENSE/.test(url)) return "Public domain notice";
  try { return new URL(url).hostname; } catch { return url; }
}
