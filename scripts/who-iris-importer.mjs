export const IRIS_API = "https://iris.who.int/server/api";
export const WHO_IGO_LICENSE = "https://creativecommons.org/licenses/by-nc-sa/3.0/igo/";

const values = (item, field) => (item.metadata?.[field] ?? []).map((entry) => entry.value).filter(Boolean);
const first = (item, field) => values(item, field)[0];
const isbn = (value) => String(value).replace(/[^0-9X]/gi, "").slice(0, 13);
const doi = (value) => String(value).replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").toLowerCase();

export function matchingEntity(item, existing) {
  const handle = first(item, "dc.identifier.uri");
  const isbns = new Set(values(item, "dc.identifier.isbn").map(isbn).filter((value) => value.length === 13));
  const dois = new Set(values(item, "dc.identifier.doi").map(doi));
  return existing.find((entity) => {
    if (entity.id === handle || entity.landingPage === handle || entity.sources?.some((source) => source.sourceUrl === handle)) return true;
    return entity.identifiers?.some((identifier) =>
      (identifier.scheme.toLowerCase() === "isbn" && isbns.has(isbn(identifier.value))) ||
      (identifier.scheme.toLowerCase() === "doi" && dois.has(doi(identifier.value))) ||
      identifier.uri === handle,
    );
  });
}

export function buildSelectedCatalogue(selected, items, existing, retrievedAt) {
  const byUuid = new Map(items.map((item) => [item.uuid, item]));
  const entities = [];
  const relationships = [];
  const skipped = [];
  const warnings = [];
  const existingIds = new Set(existing.map((entity) => entity.id));

  for (const selection of selected) {
    const item = byUuid.get(selection.uuid);
    if (!item) throw new Error(`IRIS did not return selected item ${selection.uuid}`);
    const handle = first(item, "dc.identifier.uri");
    if (handle !== selection.handle) throw new Error(`IRIS handle changed for ${selection.uuid}: ${handle ?? "missing"}`);
    if (!item.name || !/^https:\/\/iris\.who\.int\/handle\/10665\/\d+$/.test(handle)) throw new Error(`Invalid IRIS record ${selection.uuid}`);
    const matched = matchingEntity(item, existing);
    if (matched) {
      skipped.push({ handle, existingId: matched.id, reason: "same handle, ISBN or DOI" });
      continue;
    }

    const rights = values(item, "dc.rights");
    const rightsUri = first(item, "dc.rights.uri");
    const knownLicense = rights.includes("CC BY-NC-SA 3.0 IGO");
    if (rightsUri && rightsUri.replace(/\/$/, "") !== WHO_IGO_LICENSE.replace(/\/$/, "")) {
      warnings.push(`${handle}: IRIS rights URI ${rightsUri} was not copied`);
    }
    if (!knownLicense) warnings.push(`${handle}: licence not established from IRIS rights label`);

    const identifiers = [
      ...values(item, "dc.identifier.isbn").map((value) => ({ scheme: "ISBN", value: isbn(value) })).filter((entry) => entry.value.length === 13),
      ...values(item, "dc.identifier.doi").map((value) => ({ scheme: "DOI", value: doi(value), uri: `https://doi.org/${doi(value)}` })),
    ];
    const issued = first(item, "dc.date.issued");
    const source = {
      name: "WHO IRIS",
      sourceUrl: `${IRIS_API}/core/items/${item.uuid}`,
      sourceRecordId: item.uuid,
      retrievedAt,
      ...(item.lastModified && /^\d{4}-\d{2}-\d{2}T/.test(item.lastModified) ? { sourceUpdatedAt: item.lastModified } : {}),
    };
    entities.push({
      id: handle,
      types: selection.types,
      name: item.name,
      description: selection.description,
      ...(issued && /^\d{4}-\d{2}-\d{2}$/.test(issued) ? { datePublished: issued } : {}),
      ...(identifiers.length ? { identifiers } : {}),
      landingPage: handle,
      ...(knownLicense ? { license: WHO_IGO_LICENSE } : {}),
      facets: selection.facets,
      sources: [source],
      status: "active",
    });

    if (selection.supplements) {
      const related = values(item, "dc.relation");
      if (!related.includes(selection.supplements.irisHandle)) throw new Error(`${handle}: selected main-document relationship is not in IRIS metadata`);
      if (!existingIds.has(selection.supplements.glitterId)) throw new Error(`${handle}: main document is absent from Glitter`);
      relationships.push({
        id: `https://w3id.org/glitter/assertion/who-iris-${item.uuid}-supplements`,
        subject: handle,
        predicate: "isSupplementTo",
        object: selection.supplements.glitterId,
        evidence: [{ source: `${IRIS_API}/core/items/${item.uuid}`, locator: "dc.relation: Related document (main document)" }],
        assertedOn: retrievedAt,
        status: "verified",
      });
    }
  }
  return { catalogue: { standardVersion: "0.1.0", entities, relationships }, skipped, warnings };
}
