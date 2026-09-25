import { ArrowUpRight, Braces, Database, FileJson, ShieldCheck } from "lucide-react";
import { CodeExample, CopyButton } from "./DocComponents";

const API_BASE = "https://glitter-roan.vercel.app/api/v1";

const endpoints = [
  ["Discovery", "", "Start here for the version and links to every endpoint."],
  ["Catalogue", "/catalogue", "The complete Glitter document: entities and relationships together."],
  ["Resources", "/resources", "Resource entities, excluding supporting organisations."],
  ["Organisations", "/organizations", "Supporting organisations named in the catalogue."],
  ["Relationships", "/relationships", "Directed assertions, including catalogue provenance links."],
  ["JSON Schema", "/schema", "Validate a complete Glitter document against the draft record specification."],
  ["OpenAPI", "/openapi", "Machine-readable description of the read-only HTTP endpoints."],
] as const;

const curlExample = `curl -fsS ${API_BASE}/resources \\
  | jq '.items[] | select(.types | index("Protocol")) | {name, landingPage}'`;

const javascriptExample = `const response = await fetch("${API_BASE}/resources");
if (!response.ok) throw new Error(\`Glitter API returned \${response.status}\`);

const { items, standardVersion } = await response.json();
const software = items.filter(resource => resource.types.includes("Software"));`;

export default function ApiPage() {
  return <main className="standard-page api-page">
    <aside className="standard-index" aria-label="On this page">
      <strong>API reference</strong>
      <a href="#start">Get started</a>
      <a href="#endpoints">Endpoints</a>
      <a href="#responses">Response format</a>
      <a href="#usage">Use the data</a>
      <a href="#licences">Licences and versioning</a>
      <div className="standard-version"><span>API version</span><b>v1</b><small>Resource model 0.1.0</small></div>
    </aside>

    <article className="standard-article">
      <header className="standard-heading">
        <div>
          <h1>Use the Glitter API</h1>
          <p>Download the resource catalogue and its evidence-backed relationships as ordinary JSON. The API is read-only, public and designed for notebooks, scripts and other websites.</p>
        </div>
        <div className="standard-actions">
          <a href={`${API_BASE}/openapi`} target="_blank" rel="noreferrer"><Braces size={16} /> OpenAPI</a>
          <a href="/standard"><FileJson size={16} /> Resource specification</a>
        </div>
      </header>

      <div className="standard-status"><ShieldCheck size={20} /><p><strong>Static, versioned data.</strong> No key or sign-in is required. The catalogue is regenerated when this site is deployed, rather than being a live search service.</p></div>

      <section id="start" className="standard-section">
        <h2>Get started</h2>
        <p>Use this base URL with any of the paths below. Responses are JSON and permit cross-origin requests.</p>
        <div className="api-base"><Database size={18} /><code>{API_BASE}</code><CopyButton value={API_BASE} label="Copy base URL" /></div>
        <CodeExample label="Find protocols with curl" children={curlExample} />
      </section>

      <section id="endpoints" className="standard-section">
        <h2>Endpoints</h2>
        <p>Fetch <code>/catalogue</code> when you need one document that validates against the Glitter schema. Fetch a collection when you only need one kind of record.</p>
        <div className="endpoint-list">{endpoints.map(([name, path, description]) => <div key={name}><div><strong>{name}</strong><code>GET /api/v1{path}</code></div><p>{description}</p><a href={`${API_BASE}${path}`} target="_blank" rel="noreferrer" aria-label={`Open ${name} endpoint`}><ArrowUpRight size={16} /></a></div>)}</div>
      </section>

      <section id="responses" className="standard-section">
        <h2>Response format</h2>
        <p>The resources, organisations and relationships endpoints return collections. Each collection has the same envelope; <code>items</code> contains the requested records.</p>
        <table className="field-table">
          <caption>Collection response fields</caption>
          <thead><tr><th scope="col">Field</th><th scope="col">Type</th><th scope="col">Meaning</th></tr></thead>
          <tbody>
            <tr><th scope="row"><code>apiVersion</code></th><td>String</td><td>HTTP API version, currently <code>1</code>.</td></tr>
            <tr><th scope="row"><code>standardVersion</code></th><td>String</td><td>Version of the Glitter resource model used by these records.</td></tr>
            <tr><th scope="row"><code>kind</code></th><td>String</td><td>Which collection this is, such as <code>ResourceCollection</code>.</td></tr>
            <tr><th scope="row"><code>total</code></th><td>Number</td><td>Number of records in <code>items</code>.</td></tr>
            <tr><th scope="row"><code>items</code></th><td>Array</td><td>The resources, organisations or relationships themselves.</td></tr>
          </tbody>
        </table>
        <p className="api-inline-note">The catalogue endpoint instead returns <code>standardVersion</code>, <code>entities</code> and <code>relationships</code>, matching the <a href="/standard#record">resource specification</a>.</p>
      </section>

      <section id="usage" className="standard-section">
        <h2>Use the data</h2>
        <p>There is no server-side query, pagination or filtering endpoint in v1. Fetch a collection, then filter it in your own code. Stable entity URIs let you join <code>relationships[].subject</code> and <code>relationships[].object</code> back to resource identifiers.</p>
        <CodeExample label="Fetch and filter in JavaScript" children={javascriptExample} />
        <p>To show a connection responsibly, keep its <code>predicate</code>, <code>status</code> and <code>evidence</code>. A <code>cataloguedBy</code> link records provenance; it is not a scientific relationship.</p>
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
