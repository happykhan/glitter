import { ArrowUpRight, FileJson, GitPullRequest, Link2, ShieldCheck } from "lucide-react";
import { CodeExample } from "./DocComponents";

const entityExample = `{
  "id": "https://doi.org/10.1099/mgen.0.001308",
  "types": ["Publication"],
  "name": "AMRColab — a user-friendly antimicrobial resistance detection and visualization tool",
  "landingPage": "https://doi.org/10.1099/mgen.0.001308",
  "facets": [
    { "scheme": "Glitter application", "id": "antimicrobial-resistance", "label": "Antimicrobial resistance" }
  ],
  "sources": [
    { "name": "PubMed", "sourceUrl": "https://pubmed.ncbi.nlm.nih.gov/39432417/", "retrievedAt": "2026-09-24" }
  ]
}`;

const relationshipExample = `{
  "id": "https://w3id.org/glitter/assertion/amrcolab-paper-mentions-hamronization",
  "subject": "https://doi.org/10.1099/mgen.0.001308",
  "predicate": "mentions",
  "object": "https://github.com/pha4ge/hAMRonization",
  "evidence": [{ "source": "https://pubmed.ncbi.nlm.nih.gov/39432417/", "locator": "Abstract" }],
  "assertedOn": "2026-09-24",
  "status": "verified"
}`;

export default function StandardPage() {
  return <main className="standard-page">
    <aside className="standard-index" aria-label="On this page">
      <strong>Resource specification</strong>
      <a href="#purpose">Purpose</a>
      <a href="#record">Record structure</a>
      <a href="#types">Types and facets</a>
      <a href="#relationships">Relationships</a>
      <a href="#provenance">Provenance and licences</a>
      <a href="#contribute">Contribute</a>
      <div className="standard-version"><span>Current draft</span><b>0.1.0</b><small>JSON Schema 2020-12</small></div>
    </aside>

    <article className="standard-article">
      <header className="standard-heading">
        <div>
          <h1>The Glitter resource specification</h1>
          <p>A small, portable JSON model for describing useful public-health pathogen-genomics resources, where they came from, and the evidence-backed connections between them.</p>
        </div>
        <div className="standard-actions">
          <a href="/api/v1/schema" target="_blank" rel="noreferrer"><FileJson size={16} /> JSON Schema</a>
          <a href="https://github.com/happykhan/glitter/blob/main/docs/model.md" target="_blank" rel="noreferrer"><ArrowUpRight size={16} /> Full model</a>
        </div>
      </header>

      <div className="standard-status"><ShieldCheck size={20} /><p><strong>Discussion draft.</strong> The data and API are usable now, but 0.1.0 remains open to community review. A future stable release will document its governance and compatibility policy.</p></div>

      <section id="purpose" className="standard-section">
        <h2>What the specification describes</h2>
        <p>Glitter describes discoverable materials that help people establish, run, understand or improve pathogen whole-genome sequencing. It covers wet-lab protocols, software, workflows, publications, datasets, standards, training, guidance and funding calls.</p>
        <p>It is deliberately not a sample, patient or laboratory-run provenance standard. MIxS and PHA4GE contextual-data specifications remain the appropriate standards for sequence and specimen metadata; Glitter catalogues those standards as resources and connects them to the tools and publications that implement or explain them.</p>
      </section>

      <section id="record" className="standard-section">
        <h2>Record structure</h2>
        <p>A Glitter document has three top-level members: the specification version, independently identifiable entities, and directed relationships. The core is intentionally small so records remain ordinary, portable JSON.</p>
        <table className="field-table">
          <caption>Core fields</caption>
          <thead><tr><th scope="col">Field</th><th scope="col">Requirement</th><th scope="col">Meaning</th></tr></thead>
          <tbody>
            <tr><th scope="row"><code>standardVersion</code></th><td><b>Required</b></td><td>Version of the Glitter record model.</td></tr>
            <tr><th scope="row"><code>entities</code></th><td><b>Required</b></td><td>Resources and supporting organisations or concepts, each with a stable URI.</td></tr>
            <tr><th scope="row"><code>relationships</code></th><td><b>Required</b></td><td>Directed assertions joining two known entity identifiers.</td></tr>
            <tr><th scope="row"><code>sources</code></th><td><b>Recommended</b></td><td>Where the record was obtained, when it was checked and any source-data licence.</td></tr>
            <tr><th scope="row"><code>facets</code></th><td><b>Recommended</b></td><td>Independent method, application and pathogen scope terms used for discovery.</td></tr>
          </tbody>
        </table>
        <CodeExample label="Entity example" children={entityExample} />
      </section>

      <section id="types" className="standard-section">
        <h2>Types and discovery facets</h2>
        <p>Resource form and subject are separate. A protocol is a <code>Protocol</code> whether it concerns DNA extraction or assembly; those topics belong in facets. This prevents the category tree from mixing what an item is with what it is about.</p>
        <div className="type-ledger">
          <div><b>Primary resource types</b><p>Publication · Software · Computational workflow · Protocol · Dataset · Data standard · Training resource · Guidance document · Funding opportunity</p></div>
          <div><b>Supporting types</b><p>Project · Database · Strain collection · Instrument · Event · Person · Organisation · Concept</p></div>
          <div><b>Facet axes</b><p>Method stage · Application · Pathogen or target scope · Maturity · Access conditions</p></div>
        </div>
      </section>

      <section id="relationships" className="standard-section">
        <h2>Useful relationships, not inferred similarity</h2>
        <p>Relationships exist when following the edge helps a person understand, choose or use a resource. Shared category, pathogen or source catalogue is filter metadata and does not become a scientific connection. Relationships are stored once in a canonical direction and may carry evidence and curation status.</p>
        <div className="predicate-list">
          <span><code>describes</code> paper → resource</span>
          <span><code>uses</code> protocol/workflow → software</span>
          <span><code>implements</code> software → standard</span>
          <span><code>conformsTo</code> resource → standard</span>
          <span><code>teaches</code> training → resource</span>
          <span><code>offeredBy</code> funding call → organisation</span>
          <span><code>maintainedBy</code> resource → organisation</span>
          <span><code>cataloguedBy</code> resource → catalogue owner</span>
        </div>
        <CodeExample label="Relationship example" children={relationshipExample} />
      </section>

      <section id="provenance" className="standard-section">
        <h2>Provenance and licences stay distinct</h2>
        <p><code>license</code> describes the resource itself. <code>sources[].sourceLicense</code> describes metadata reused from a catalogue. One must never be inferred from the other. When either licence is unknown, the field is omitted and interfaces must say that it is not recorded.</p>
        <p>Every imported record can retain the source catalogue, source record identifier, retrieval date, upstream revision and upstream modification date. Multiple sources may support the same merged entity.</p>
        <p>Online courses may include <code>trainingCourse</code> with a platform, enrolment availability and <code>lastChecked</code> date. A course page marked <code>active</code> in the catalogue is not necessarily open for enrolment.</p>
      </section>

      <section id="contribute" className="standard-section standard-contribute">
        <h2>Propose another resource</h2>
        <p>Contributions use ordinary pull requests. Add one small JSON document under <code>data/community/</code>; automated checks validate the schema, identifiers, relationship targets, evidence, tests and production build.</p>
        <ol>
          <li><span>Copy the contribution example and replace its values.</span><code>cp examples/resource-contribution.json data/community/my-resource.json</code></li>
          <li><span>Run the same checks used by the pull-request workflow.</span><code>npm run check</code></li>
          <li><span>Open a focused pull request with sources and relationship evidence.</span></li>
        </ol>
        <div className="contribute-actions">
          <a className="primary-action" href="https://github.com/happykhan/glitter/new/main/data/community?filename=my-resource.json" target="_blank" rel="noreferrer"><GitPullRequest size={17} /> Add a resource on GitHub</a>
          <a href="https://github.com/happykhan/glitter/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer"><Link2 size={17} /> Contribution guide</a>
        </div>
      </section>
    </article>
  </main>;
}
