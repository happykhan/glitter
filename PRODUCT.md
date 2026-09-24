# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: React, Vite and TypeScript, chosen as a lightweight interactive
prototype that can be deployed to Vercel. The data remains ordinary Glitter
JSON rather than being tied to a particular frontend framework.

## Users

The primary users are public-health laboratory scientists, bioinformaticians,
programme leads, trainers and researchers trying to establish, run or improve
pathogen whole-genome sequencing work.

## Product Purpose

Glitter helps people discover practical materials for public-health pathogen
genomics and understand how those materials relate. It brings together wet-lab
protocols, software, standards, guidance, papers, training, datasets and live
funding opportunities without attempting to model every experimental run.

Success means that someone can quickly find a useful resource, understand its
scope and provenance, and follow meaningful links to adjacent resources needed
for their work.

## Positioning

Glitter is both an interoperable metadata profile and an explorable resource
knowledgebase. Unlike a flat link directory, it uses typed relationships and
independent facets for workflow stage, application and pathogen scope.

## Operating Context

Users may enter through a method such as serotyping, a pathogen such as
Salmonella, a resource type, or a practical question about building a WGS
workflow. They need to compare resources, trace them to their source catalogue,
and move between standards, guidance, protocols, software and training.

## Capabilities and Constraints

- The first prototype must browse and search the current seed datasets.
- It must expose resource relationships rather than presenting only a list.
- Software is represented at project level, not by release version.
- Funding opportunities are calls people can apply to, with open and closing
  dates and visible freshness.
- Imported records retain source provenance and do not infer unknown licences.
- The prototype is read-only and contains no person-level clinical data.
- Initial deployment target: Vercel.

## Evidence on Hand

- Draft Glitter schema and relationship vocabulary.
- Fourteen IPSN and GHRU seed resources in `data/seed/initial-resources.json`.
- Nine PHA4GE resources plus PHA4GE as an organisation in
  `data/seed/pha4ge-guidance.json`.
- Curated publication, software and funding-call records with evidence-backed
  relationships in `data/seed/curated-resources.json`.
- Source definitions and ingestion policy in `config/sources.yaml` and
  `docs/source-ingestion.md`.
- No testimonials, adoption claims, usage analytics or production service
  guarantees are available and none should be fabricated.

## Product Principles

1. Lead with the work people are trying to do, not the database structure.
2. Make relationships legible and useful without overwhelming the resource.
3. Preserve source attribution, evidence and uncertainty.
4. Keep the interchange data portable and the website replaceable.
5. Prefer a small trustworthy catalogue over an inflated unreviewed one.

## Accessibility & Inclusion

The web interface should be keyboard usable, responsive, readable at common
zoom levels and avoid conveying resource type, status or provenance by colour
alone. It should use plain language suitable for an international public-health
audience.
