import { catalogue, entitiesById, error, json, practicalQuestions } from "../_data.js";
import { scoreQuestionRoute } from "../../shared/resource-search.js";

function withResources(route) {
  return {
    ...route,
    steps: route.steps.map((step) => ({
      ...step,
      resources: step.resourceIds.map((id) => {
        const entity = entitiesById.get(id);
        return { id, name: entity.name, types: entity.types, landingPage: entity.landingPage, sources: entity.sources };
      }),
    })),
  };
}

export function GET(request) {
  const params = new URL(request.url).searchParams;
  const q = params.get("q")?.trim();
  const id = params.get("id")?.trim();
  if ((!q && !id) || (q && id)) return error("Provide either a question in q or a route id in id.");
  if (q && q.length > 200) return error("q must be 200 characters or fewer.");
  if (id && id.length > 100) return error("id must be 100 characters or fewer.");

  const ranked = id
    ? practicalQuestions.filter((route) => route.id === id)
    : practicalQuestions.map((route) => ({ route, relevance: scoreQuestionRoute(route, q) }))
      .filter(({ relevance }) => relevance >= 0)
      .sort((a, b) => b.relevance - a.relevance || a.route.question.localeCompare(b.route.question))
      .map(({ route }) => route);
  if (id && ranked.length === 0) return error("No practical-question route has that id.", 404);

  return json({
    apiVersion: "1",
    standardVersion: catalogue.standardVersion,
    kind: "QuestionMatches",
    query: q ?? null,
    id: id ?? null,
    total: ranked.length,
    items: ranked.map(withResources),
    note: "These are editorial reading routes, not verified graph relationships. Inspect records and use /api/v1/connections for cited links.",
  });
}
