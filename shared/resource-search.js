const aliases = {
  amr: ["antimicrobial resistance"],
  wgs: ["whole genome sequencing", "genome sequencing", "sequencing", "genomics"],
  cgmlst: ["core genome multilocus sequence typing", "allele typing"],
  qc: ["quality control"],
  extraction: ["isolation"],
  extract: ["isolation"],
  server: ["infrastructure", "compute"],
  servers: ["infrastructure", "compute"],
  accreditation: ["quality management"],
};

const stopWords = new Set([
  "a", "an", "and", "are", "be", "buy", "can", "do", "does", "find", "for", "how", "i", "implement",
  "in", "is", "me", "need", "of", "on", "set", "should", "show", "the", "to", "up", "use", "using", "what", "which", "with", "applies",
]);

export const normalise = (value) => String(value ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
export const matchesText = (value, search) => normalise(value).includes(normalise(search));

export function scoreResource(entity, query, questionTitles = []) {
  const words = normalise(query).split(/\s+/).filter((word) => word && !stopWords.has(word));
  if (!words.length) return 0;
  const fields = [
    [entity.name, 12],
    ...((entity.identifiers ?? []).flatMap((identifier) => [[identifier.value, 11], [identifier.uri, 7]])),
    [entity.id, 7],
    [entity.description, 4],
    [entity.types.join(" "), 3],
    [(entity.facets ?? []).map((facet) => facet.label).join(" "), 5],
    [(entity.sources ?? []).map((source) => source.name).join(" "), 2],
    [questionTitles.join(" "), 6],
  ];
  let score = 0;
  let matched = 0;
  for (const word of words) {
    const choices = [word, ...(aliases[word] ?? [])];
    const best = Math.max(0, ...fields.map(([value, weight]) => choices.some((term) => matchesText(value, term)) ? weight : 0));
    if (best) { matched += 1; score += best; }
  }
  if (matched < Math.max(1, Math.ceil(words.length * 0.75))) return -1;
  if (matchesText(entity.name, query)) score += 10;
  if (/\bset\s+up\b/i.test(query) && (entity.facets ?? []).some((facet) => facet.id === "implementation-planning")) score += 8;
  return score + matched * 2;
}

export function questionTitlesByResource(questions) {
  const titles = new Map();
  for (const question of questions) for (const step of question.steps) for (const id of step.resourceIds) {
    titles.set(id, [...(titles.get(id) ?? []), question.question]);
  }
  return titles;
}
