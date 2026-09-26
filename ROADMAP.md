# Glitter roadmap

Status: working plan, 26 September 2026. Glitter is a **discussion-draft resource
specification** and a separate **knowledgebase built with it**. The site and API
are useful prototypes, not a ratified interoperability standard or a complete
answer service.

## Where we are

| Area | Current state | Main limitation |
|---|---|---|
| Resource specification | JSON Schema, type profiles, relationship vocabulary and contribution checks | Minimum fields and crosswalks have not been tested with external consumers |
| Knowledgebase | 93 resources, six practical-question routes, 39 verified non-catalogue connections | Guidance-heavy; thin coverage for datasets, workflows, wastewater bench protocols and procurement evidence |
| Discovery | Search, facets, resource inspector, graph and route pages | Lexical matching is conservative; a missing route or result is not a claim about the wider world |
| API | Read-only search, record and connection lookup, exports, OpenAPI, and question-route lookup | No independent private-assistant test or real downstream consumer yet |
| Sources and trust | Selected WHO/IRIS, PHA4GE, GHRU, GMI and course records with provenance and explicit licence uncertainty | Refreshes still require curation; availability, calls and licences can go stale |

The graph only draws verified, cited assertions. A reading route groups useful
records but does not assert that those records use or implement one another.
Funding records are calls people can apply to, not grants that funded papers.

## Milestones

### 1. Make practical questions reliable to retrieve — implemented locally

- Add a dedicated `/api/v1/question` lookup for natural questions or exact
  route IDs. Return the route's answer, what to ask first, ordered resource
  summaries and stated gap in one response.
- Keep `/api/v1/questions` as the complete export and repair its missing
  `listPracticalQuestions` OpenAPI operation. Expose `findPracticalQuestion`
  separately.
- Test all six routes, a no-route case, and a foodborne-versus-wastewater
  collision. A no-route result must be explicit, not a guessed answer.

**Done means:** local checks pass and the API page tells an assistant to try
route lookup, then resource search, then record and verified connection lookup.
Production deployment remains a separate release step.

### 2. Deepen the weak practical routes — next content milestone

- Pathogenwatch and ten documented analysis tools now have project-level
  records and cited platform-to-tool links. SISTR makes Salmonella serotyping
  software discoverable; this does not yet constitute a complete validated
  Salmonella route.
- Curate pathogen-specific wastewater sampling, extraction, sequencing and
  analysis protocols, with method, target, validation context, provenance and
  licence checked at the original source. Keep planning guidance distinct from
  a bench SOP.
- Add a Salmonella serotyping/typing route grounded in actual schemes,
  software and interpretive guidance. Do not invent universal thresholds or
  software compatibility.
- For hardware procurement and accreditation, add current jurisdiction- and
  workload-specific evidence where available; otherwise keep the existing
  caveats prominent.

**Done means:** each route can point to a reviewed end-to-end starting set and
states what cannot be generalised. Search and API tests use the same user
questions. New graph edges require source-supported predicates.

### 3. Test interoperability rather than only describing it

- Publish a field-by-field crosswalk to Schema.org/Bioschemas, CodeMeta/EDAM,
  DataCite and relevant PHA4GE/MIxS metadata, noting information that cannot
  be mapped losslessly.
- Run two small import/export pilots with real records, at least one software
  record and one pathogen-genomics standard or protocol. Record duplicate,
  identifier, licence and relationship-handling outcomes.
- Decide minimum versus recommended fields by resource type from those pilots,
  then propose v0.1 governance and compatibility rules for community review.

**Done means:** another system can consume the export and round-trip chosen
records without silently changing identity, provenance or relationship meaning.

### 4. Make curation repeatable

- Produce reviewable source refresh diffs, not automatic publishing or silent
  deletion. Flag changed titles, URLs, rights, course availability and call
  dates.
- Add scheduled freshness checks only after ownership and review cadence are
  agreed. Keep imported facts separate from curator-written descriptions.
- Run an actual private-assistant test with the OpenAPI actions when an
  authenticated tool-capable host is available; inspect tool calls and citations
  across positive, ambiguous and zero-result prompts. No MCP server is needed.

**Done means:** a curator can accept or reject changes and consumers can tell
when time-sensitive information was last checked.

## Release discipline

For each milestone: validate schema and relationships, run retrieval tests,
inspect the relevant website route, then publish only after review. The live
site should never be described as updated until its deployed API and visible
page have both been checked.
