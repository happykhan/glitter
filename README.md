# Glitter

Glitter is a proposed open metadata standard and knowledgebase for discovering
and connecting resources that help people undertake public-health pathogen
genomics. It covers wet-lab and bioinformatics protocols, software, papers,
standards, datasets, training, guidance and funding opportunities.

The project is at the **v0.1 design stage**. The current files are a discussion
draft, not a normative or production-ready standard.

## Interactive knowledgebase

The website combines a searchable resource directory with an interactive
knowledge graph. The graph shows evidence-backed resource-to-resource
assertions; resource form, pathogen scope, method, application and source
catalogue remain filters rather than being counted as scientific connections.
Selecting a resource opens a provenance, licensing and relationship inspector.

The default website view is a searchable resource directory. Search covers
titles, descriptions, types, facets, source catalogues and curated practical-question titles. Filters cover
resource form, pathogen/method/application, funding state, source catalogue,
licence availability and the presence of curated connections. The graph is a
second view of the same filtered result set; search matches without verified links appear as standalone nodes.

- Live site: <https://glitter-roan.vercel.app>
- Frontend: React, TypeScript and `react-force-graph-2d`
- Resource specification: <https://glitter-roan.vercel.app/standard>
- API guide: <https://glitter-roan.vercel.app/api>
- Read-only JSON API: <https://glitter-roan.vercel.app/api/v1>

Run it locally with `npm install` followed by `npm run dev`.

## Why a graph?

A catalogue can say that a paper and a software tool exist. Glitter should also
be able to connect the paper to the software, protocol or standard it discusses
and connect tools to compatible inputs, outputs and workflows. These typed
relationships make the collection explorable without attempting to reconstruct
every analysis reported by every paper.

## Design principles

- Reuse established identifiers and vocabularies before creating new ones.
- Separate resource **types** from browse **facets** such as method, application
  and pathogen scope.
- Treat software as a durable project-level resource rather than cataloguing
  every release as a separate record.
- Represent useful, evidence-backed relationships without modelling individual
  laboratory or analysis runs.
- Support a small mandatory core with richer type-specific profiles.
- Keep the interchange format usable as ordinary JSON while allowing JSON-LD
  export for linked-data systems.

## Draft contents

- [Conceptual model](docs/model.md)
- [Relationship vocabulary](vocabularies/relationships.yaml)
- [Resource type vocabulary](vocabularies/resource-types.yaml)
- [Resource profiles](docs/profiles.md)
- [Relationship curation rules](docs/relationship-curation.md)
- [Draft JSON Schema](schema/glitter.schema.json)
- [Worked knowledge-hub example](examples/knowledge-hub.json)
- [Initial imported seed records](data/seed/initial-resources.json)
- [PHA4GE guidance and standards seed](data/seed/pha4ge-guidance.json)
- [Curated papers, software and funding calls](data/seed/curated-resources.json)
- [Source-ingestion design](docs/source-ingestion.md)
- [Initial source registry](config/sources.yaml)
- [API reference](docs/api.md)
- [Contribution guide](CONTRIBUTING.md)

Refresh the PHA4GE seed from its public WordPress feed with:

```sh
node scripts/import-pha4ge.mjs
```

Community contributions belong in `data/community/`. Start from
[`examples/resource-contribution.json`](examples/resource-contribution.json)
and run `npm run check` before opening a pull request. The same validation runs
automatically on GitHub.

## Proposed standards stack

Glitter should be a community profile and crosswalk, not a replacement for
existing standards. The draft aligns with Schema.org and Bioschemas for web
resource descriptions, CodeMeta and bio.tools/EDAM for research software,
RO-Crate for connected research objects, DataCite for identifiers and
research-output relationships, and MIxS/PHA4GE for linking to established
pathogen-genomics contextual metadata standards.

## Next decisions

Before calling v0.1 stable, the community needs to agree the initial use cases,
minimum required fields by resource type, relationship names, governance
process, and two or three real interoperability pilots.
