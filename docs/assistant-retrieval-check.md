# Assistant retrieval check — 25 September 2026

This is a reproducible API retrieval rehearsal, **not** a completed test of a
private ChatGPT assistant. The ChatGPT browser session was signed out and no
OpenAI API key was available, so an independent assistant could not be run.

The checks use the same `searchResources`, `getResource` and `getConnections`
operations exposed in `/api/v1/openapi` and are covered by
`tests/discovery-api.test.mjs`.

| User question | API result after curation | What the assistant may safely say |
|---|---|---|
| How can we start foodborne WGS? | WHO module 1 | It covers minimum system capacity before introduction. |
| How is WGS used in a foodborne outbreak? | WHO module 2 | It covers outbreak investigations using existing surveillance. |
| What guides routine foodborne WGS? | WHO module 3 | It covers routine surveillance, trends, AMR and virulence monitoring. |
| How should pathogen genome data be shared? | WHO guiding principles | Cite the WHO document; do not infer a data-sharing licence. |
| Is there a national strategy guide? | WHO national guide and one verified link to the global strategy | Explain the supplement relationship with its WHO evidence URL. |
| Is there a DNA extraction protocol? | GHRU bacterial DNA isolation protocol | Present it as a protocol; extraction/isolation are search synonyms. |

Known limitation: lexical search does not provide semantic recall. A question
about Salmonella serotyping currently has no match in the catalogue; an
assistant must say that Glitter has no result, not that no such tool exists.
Funding state belongs in the `funding` filter, not a free-text `q=open` query.

To complete the private-assistant test, sign into ChatGPT in the handed-off
Chrome tab, import `/api/v1/openapi` as a private action, and run the questions
above in Preview. Check actual tool calls, grounded citations, zero-result
behaviour, and whether it invents compatibility or licence claims.
