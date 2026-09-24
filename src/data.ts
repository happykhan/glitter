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

export type Relationship = {
  id: string;
  subject: string;
  predicate: string;
  object: string;
};

export const entities = [...initial.entities, ...pha4ge.entities] as Entity[];
export const relationships = [...initial.relationships, ...pha4ge.relationships] as Relationship[];

export const sourceNames = [
  "IPSN PGS Data Standard Catalogue",
  "GHRU Protocols",
  "PHA4GE Guidance Documents & Standards",
];

export const resourceTypes = [
  "DataStandard",
  "Protocol",
  "GuidanceDocument",
  "Software",
  "TrainingResource",
];

export const stages = ["Plan", "Prepare", "Sequence", "Analyse", "Share"] as const;
export type Stage = (typeof stages)[number];

export function stageFor(entity: Entity): Stage {
  const text = `${entity.name} ${(entity.facets ?? []).map((facet) => facet.id).join(" ")}`.toLowerCase();
  if (/isolation|quantification|purity|library|transport|sample/.test(text)) return "Prepare";
  if (/miseq|sequencing/.test(text) && !/bioinformatics|metadata/.test(text)) return "Sequence";
  if (/bioinformatics|amr|recombinant|analysis|hamron/.test(text)) return "Analyse";
  if (/metadata|contextual|mixs|migs|standard/.test(text)) return "Share";
  return "Plan";
}

export function readableType(type: string) {
  return type.replace(/([a-z])([A-Z])/g, "$1 $2");
}
