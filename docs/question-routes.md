# Practical-question routes

`content/questions.json` holds editorial routes for common public-health pathogen-genomics questions. These are navigation and orientation, not part of the Glitter resource specification or knowledge-graph relationship set. Each `resourceIds` value must resolve to a catalogue entity; the API build fails if it does not.

Each route also has `matchTerms`: a short list of distinctive words or phrases
needed before `/api/v1/question?q=...` considers it. This keeps, for example,
foodborne WGS from returning the wastewater route merely because both discuss
sequencing and surveillance. Add variants people actually use, but do not make
generic words such as “genomics” or “surveillance” an anchor. Check a new
route against a clearly unrelated question as well as its own wording.

When adding a route, write an answer that says what the catalogue can establish, list the context a user must supply, select primary or otherwise authoritative resources for an ordered reading route, and state what is missing. Do not turn a shared topic, a recommended reading order or a course listing into a verified relationship. Add a graph edge only when a source explicitly supports that predicate and can be cited in the relationship evidence.

For hardware, protocols, course enrolment and accreditation, avoid timeless or universal recommendations. Record dates and licensing only when established by the source, and retain uncertainty otherwise. Review time-sensitive routes and linked resources before claiming that advice or availability is current.
