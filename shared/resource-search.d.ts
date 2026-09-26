export type SearchEntity = {
  id: string;
  name: string;
  types: string[];
  description?: string;
  identifiers?: { value: string; uri?: string }[];
  facets?: { id: string; label: string }[];
  sources?: { name: string }[];
};
export type SearchQuestion = { question: string; steps: { resourceIds: string[] }[] };
export function normalise(value: unknown): string;
export function matchesText(value: unknown, search: unknown): boolean;
export function scoreResource(entity: SearchEntity, query: string, questionTitles?: string[]): number;
export function questionTitlesByResource(questions: SearchQuestion[]): Map<string, string[]>;
