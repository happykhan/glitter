import initial from "../data/seed/initial-resources.json";
import pha4ge from "../data/seed/pha4ge-guidance.json";

export type Source = {
  name: string;
  sourceUrl: string;
  sourceRecordId?: string;
  sourceLicense?: string;
  retrievedAt: string;
  sourceUpdatedAt?: string;
};

export type Facet = { scheme: string; id: string; label: string };

export type Entity = {
  id: string;
  types: string[];
  name: string;
  description?: string;
  landingPage?: string;
  facets?: Facet[];
  sources?: Source[];
  status?: string;
};

export type Relationship = { id: string; subject: string; predicate: string; object: string };
export type GraphKind = "resource" | "catalogue" | "type" | "target" | "method" | "application" | "organization";
export type GraphNode = {
  id: string;
  name: string;
  kind: GraphKind;
  entity?: Entity;
  source?: Source;
  resourceCount?: number;
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
  explicit?: boolean;
};

export const entities = [...initial.entities, ...pha4ge.entities] as Entity[];
export const relationships = [...initial.relationships, ...pha4ge.relationships] as Relationship[];
export const resources = entities.filter((entity) => !entity.types.includes("Organization"));
export const resourceTypes = ["DataStandard", "Protocol", "GuidanceDocument", "Software", "TrainingResource"];

export const typeLabels: Record<string, string> = {
  DataStandard: "Data standard",
  Protocol: "Protocol",
  GuidanceDocument: "Guidance",
  Software: "Software",
  TrainingResource: "Training",
  Organization: "Organisation",
};

export const kindLabels: Record<GraphKind, string> = {
  resource: "Resource",
  catalogue: "Source catalogue",
  type: "Resource type",
  target: "Pathogen scope",
  method: "Method",
  application: "Application",
  organization: "Organisation",
};

export function readableType(type: string) {
  return type.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function facetKind(scheme: string): GraphKind {
  if (scheme.includes("method")) return "method";
  if (scheme.includes("application")) return "application";
  return "target";
}

export function buildKnowledgeGraph() {
  const nodes = new Map<string, GraphNode>();
  const links = new Map<string, GraphLink>();
  const addNode = (node: GraphNode) => {
    if (!nodes.has(node.id)) nodes.set(node.id, node);
    return nodes.get(node.id)!;
  };
  const addLink = (link: GraphLink) => {
    if (!links.has(link.id)) links.set(link.id, link);
  };

  for (const entity of entities) {
    const isOrganization = entity.types.includes("Organization");
    addNode({ id: entity.id, name: entity.name, kind: isOrganization ? "organization" : "resource", entity });
    if (isOrganization) continue;

    for (const type of entity.types) {
      const typeId = `type:${type}`;
      addNode({ id: typeId, name: typeLabels[type] ?? readableType(type), kind: "type" });
      addLink({ id: `${entity.id}|hasType|${typeId}`, source: entity.id, target: typeId, predicate: "has type" });
    }

    for (const facet of entity.facets ?? []) {
      const kind = facetKind(facet.scheme);
      const facetId = `facet:${facet.scheme}:${facet.id}`;
      addNode({ id: facetId, name: facet.label, kind });
      const predicate = kind === "method" ? "supports method" : kind === "application" ? "supports application" : "has scope";
      addLink({ id: `${entity.id}|${predicate}|${facetId}`, source: entity.id, target: facetId, predicate });
    }

    for (const source of entity.sources ?? []) {
      const sourceId = `catalogue:${source.name}`;
      addNode({ id: sourceId, name: source.name, kind: "catalogue", source });
      addLink({ id: `${entity.id}|cataloguedBy|${sourceId}`, source: entity.id, target: sourceId, predicate: "catalogued by" });
    }
  }

  for (const relationship of relationships) {
    if (!nodes.has(relationship.subject) || !nodes.has(relationship.object)) continue;
    addLink({ id: relationship.id, source: relationship.subject, target: relationship.object, predicate: readableType(relationship.predicate).toLowerCase(), explicit: true });
  }

  const nodeList = [...nodes.values()];
  const linkList = [...links.values()];
  for (const node of nodeList) {
    node.resourceCount = new Set(linkList.flatMap((link) => {
      const sourceId = typeof link.source === "string" ? link.source : link.source.id;
      const targetId = typeof link.target === "string" ? link.target : link.target.id;
      if (sourceId !== node.id && targetId !== node.id) return [];
      const otherId = sourceId === node.id ? targetId : sourceId;
      return nodes.get(otherId)?.kind === "resource" ? [otherId] : [];
    })).size;
  }

  return { nodes: nodeList, links: linkList };
}
