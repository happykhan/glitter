import { ArrowUpRight, Braces, Database, FileJson, Search, ShieldCheck } from "lucide-react";
import { CodeExample, CopyButton } from "./DocComponents";

const API_BASE = "https://glitter-roan.vercel.app/api/v1";
const EXAMPLE_ID = "https%3A%2F%2Fgithub.com%2Fcidgoh%2FDataHarmonizer";

const endpoints = [
  ["Search resources", "/search", "Find and filter by words, form, method, application, pathogen target or funding state.", "?q=amr&type=Software"],
  ["Get a resource", "/resource", "Look up one record by its stable URI or another recorded identifier, with provenance and licence.", `?id=${EXAMPLE_ID}`],
  ["Get connections", "/connections", "Follow verified, directed relationships with evidence and compatibility notes.", `?id=${EXAMPLE_ID}`],
  ["Discovery", "", "API version and links to every operation and export.", ""],
  ["Full catalogue", "/catalogue", "The complete Glitter document: entities and relationships together.", ""],
  ["Resource export", "/resources", "All discoverable resources, excluding supporting organisations and concepts.", ""],
  ["Organisation export", "/organizations", "Supporting organisations named in the catalogue.", ""],
  ["Concept export", "/concepts", "Supporting formats and other concepts used to join resources.", ""],
  ["Relationship export", "/relationships", "All directed assertions, including catalogue provenance and review status.", ""],
  ["JSON Schema", "/schema", "Validate a complete Glitter document against the draft record specification.", ""],
  ["OpenAPI", "/openapi", "Machine-readable operations and parameters for tool-capable AI assistants.", ""],
] as const;

const curlExample = `curl -fsSG '${API_BASE}/search' \\
  --data-urlencode 'q=amr' \\
  --data-urlencode 'type=Software'`;
const connectionExample = `curl -fsSG '${API_BASE}/connections' \\
  --data-urlencode 'id=https://github.com/B-UMMI/chewBBACA'`;
const assistantInstruction = `Use the Glitter API tool specification at ${API_BASE}/openapi.
First call searchResources to find relevant pathogen-genomics materials. Use getResource to inspect a result and getConnections to verify how it relates to others. Cite each resource's landingPage and each relationship's evidence URL. Treat missing licences as unknown. Do not infer that resources are compatible just because they share a tag or source catalogue.`;

export default function ApiPage() {
  return <main className="standard-page api-page">
    <aside className="standard-index" aria-label="On this page">
      <strong>API reference</strong>
      <a href="#start">Find resources</a>
      <a href="#assistant">Use with an AI assistant</a>
      <a href="#endpoints">Operations and exports</a>
      <a href="#responses">Response format</a>
      <a href="#connections">Check a connection</a>
      <a href="#licences">Licences and versioning</a>
      <div className="standard-version"><span>API version</span><b>v1</b><small>Resource model 0.1.0</small></div>
    </aside>

    <article className="standard-article">
      <header className="standard-heading">
        <div>
          <h1>Find resources through the Glitter API</h1>
          <p>Search for materials, inspect a record, and follow evidence-backed connections. The same operations can be used by a tool-capable AI assistant, a notebook or another website.</p>
        </div>
        <div className="standard-actions">
          <a href={`${API_BASE}/openapi`} target="_blank" rel="noreferrer"><Braces size={16} /> OpenAPI</a>
          <a href="/standard"><FileJson size={16} /> Resource specification</a>
        </div>
      </header>

      <div className="standard-status"><ShieldCheck size={20} /><p><strong>Read-only discovery.</strong> No key or sign-in is required. Search runs against the catalogue published with each deployment; it does not search the live web or invent missing links.</p></div>

      <section id="start" className="standard-section">
        <h2>Find resources</h2>
        <p>Search with words and filters. Each result includes its canonical ID, source provenance and resource licence when one is recorded. Use the ID to fetch the full record or its verified connections.</p>
        <div className="api-base"><Database size={18} /><code>{API_BASE}</code><CopyButton value={API_BASE} label="Copy base URL" /></div>
        <CodeExample label="Find AMR software" children={curlExample} />
        <p className="api-inline-note"><a href={`${API_BASE}/search?q=amr&type=Software`} target="_blank" rel="noreferrer"><Search size={14} /> See the search response <ArrowUpRight size={12} /></a> Search also accepts <code>method</code>, <code>application</code>, <code>target</code>, <code>source</code>, <code>funding</code>, <code>licenseKnown</code>, <code>connected</code>, <code>limit</code> and <code>offset</code>.</p>
      </section>

      <section id="assistant" className="standard-section">
        <h2>Use it with an AI assistant</h2>
        <p>Import the <a href={`${API_BASE}/openapi`} target="_blank" rel="noreferrer">OpenAPI tool specification</a> into an assistant or agent platform that supports HTTP tools. It defines three callable operations: <code>searchResources</code>, <code>getResource</code> and <code>getConnections</code>. Give the assistant these instructions alongside the tool:</p>
        <CodeExample label="Suggested assistant instruction" children={assistantInstruction} />
        <p className="api-inline-note">An ordinary chat cannot call this API merely because you paste a URL. Its host must support importing an OpenAPI action or making HTTP tool calls. Results are catalogue records, not clinical advice or an answer generated by Glitter.</p>
      </section>

      <section id="endpoints" className="standard-section">
        <h2>Operations and exports</h2>
        <p>The first three endpoints answer discovery questions. The others provide complete exports for analysis or validation. Fetch <code>/catalogue</code> when you need one document matching the Glitter resource specification.</p>
        <div className="endpoint-list">{endpoints.map(([name, path, description, example]) => <div key={name}><div><strong>{name}</strong><code>GET /api/v1{path}</code></div><p>{description}</p><a href={`${API_BASE}${path}${example}`} target="_blank" rel="noreferrer" aria-label={`Open ${name} example response`}><ArrowUpRight size={16} /></a></div>)}</div>
      </section>

      <section id="responses" className="standard-section">
        <h2>Response format</h2>
        <p>Search returns matching <code>items</code>, <code>total</code>, <code>limit</code>, <code>offset</code> and applied filters. Resource lookup returns one <code>resource</code>. Connections returns directed <code>items</code> with a neighbour summary, evidence URL and any compatibility note. Export collections use this envelope:</p>
        <table className="field-table">
          <caption>Export collection fields</caption>
          <thead><tr><th scope="col">Field</th><th scope="col">Type</th><th scope="col">Meaning</th></tr></thead>
          <tbody>
            <tr><th scope="row"><code>apiVersion</code></th><td>String</td><td>HTTP API version, currently <code>1</code>.</td></tr>
            <tr><th scope="row"><code>standardVersion</code></th><td>String</td><td>Version of the Glitter resource model used by these records.</td></tr>
            <tr><th scope="row"><code>kind</code></th><td>String</td><td>Which collection this is, such as <code>ResourceCollection</code>.</td></tr>
            <tr><th scope="row"><code>total</code></th><td>Number</td><td>Number of records in <code>items</code>.</td></tr>
            <tr><th scope="row"><code>items</code></th><td>Array</td><td>The resources, organisations, concepts or relationships themselves.</td></tr>
          </tbody>
        </table>
        <p className="api-inline-note">The catalogue endpoint instead returns <code>standardVersion</code>, <code>entities</code> and <code>relationships</code>, matching the <a href="/standard#record">resource specification</a>.</p>
      </section>

      <section id="connections" className="standard-section">
        <h2>Check a connection</h2>
        <p>Use the exact ID from search. The response keeps the direction, predicate, review status and evidence together. The default excludes catalogue-provenance links and unverified assertions.</p>
        <CodeExample label="Trace a typing-tool connection" children={connectionExample} />
      </section>

      <section id="licences" className="standard-section">
        <h2>Licences and versioning</h2>
        <p><code>license</code> describes the resource itself; <code>sources[].sourceLicense</code> describes metadata supplied by an upstream catalogue. If either field is absent, that licence has not been recorded. The API does not grant a blanket licence over third-party material.</p>
        <p>The <code>/api/v1</code> path identifies the API generation. <code>standardVersion</code> identifies the record model. The model is still a 0.1.0 discussion draft, so consumers should check that field and validate complete catalogue documents against <a href={`${API_BASE}/schema`} target="_blank" rel="noreferrer">the JSON Schema</a>.</p>
        <div className="contribute-actions"><a href="/standard"><FileJson size={17} /> Read the resource specification</a><a href="/standard#contribute"><ArrowUpRight size={17} /> Propose a resource</a></div>
      </section>
    </article>
  </main>;
}
