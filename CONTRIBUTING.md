# Contributing resources to Glitter

Glitter accepts community contributions as small, reviewable JSON datasets.
Each pull request should add or improve resources that help people establish,
run, understand or improve public-health pathogen genomics.

## Before adding a record

Check the [live knowledgebase](https://glitter-roan.vercel.app/) and search by
title, persistent identifier and canonical URL. Improve an existing record
instead of creating a duplicate.

A suitable resource is publicly discoverable and belongs to one or more of the
controlled resource types. Examples include a protocol, software project,
paper, standard, dataset, training resource, guidance document or funding call.
Glitter catalogues software projects, not individual software versions.

## Add a resource

1. Fork the repository and create a branch.
2. Copy [`examples/resource-contribution.json`](examples/resource-contribution.json)
   to `data/community/<short-name>.json`.
3. Replace the example values. Keep `standardVersion` as `0.1.0`.
4. Add relationships only when following the connection helps someone choose,
   understand or use a resource. Every non-catalogue relationship needs
   evidence.
5. Run `npm install` once, then `npm run check`.
6. Open a pull request using the resource contribution template.

[Create a community resource file on GitHub](https://github.com/happykhan/glitter/new/main/data/community?filename=my-resource.json)

## Minimum contribution

Every community entity must contain:

- a stable URI in `id`;
- at least one controlled value in `types`;
- a concise `name`;
- its canonical `landingPage`;
- at least one `sources` entry with the page used to verify the record and the
  date it was checked.

Add a description, identifiers, facets and the resource licence when they are
known. Do not infer a resource licence from the licence of a source catalogue.
Omit unknown values rather than guessing.

## Identifiers and relationships

Prefer DOI or PMID for publications, a canonical project or bio.tools URI for
software, ORCID for people, ROR for organisations, and NCBI Taxonomy or ontology
IRIs for controlled concepts.

Relationships are directed. Use the canonical direction documented in
[`docs/relationship-curation.md`](docs/relationship-curation.md); do not add a
second inverse relationship. Evidence should point to a public source and may
include a section, table, figure or other locator. Short quotations are optional.

## What the automated checks enforce

The pull-request workflow checks the JSON Schema, duplicate identifiers,
relationship targets, evidence on curated relationships, the additional
community requirements above, tests and the production build. Passing checks
means the contribution is structurally valid; maintainers still review scope,
descriptions, evidence and possible duplicates.

Please keep one logical contribution per pull request. Imported catalogues or
large batches should first be proposed as a source-ingestion change.
