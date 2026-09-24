import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  ExternalLink,
  FileText,
  Filter,
  Github,
  Info,
  Link2,
  List,
  LocateFixed,
  Minus,
  Network,
  Plus,
  Search,
  X,
} from "lucide-react";
import {
  buildResourceGraph,
  entities,
  facetAxis,
  filterOptions,
  fundingState,
  licenceLabel,
  predicateLabels,
  readableType,
  relationships,
  resourceRelations,
  resources,
  type Entity,
  type GraphLink,
  type GraphNode,
} from "./data";
import StandardPage from "./StandardPage";

type View = "resources" | "graph" | "standard";
type Filters = {
  types: string[];
  facets: string[];
  sources: string[];
  funding: string[];
  licenceKnown: boolean;
  connectedOnly: boolean;
};

const EMPTY_FILTERS: Filters = { types: [], facets: [], sources: [], funding: [], licenceKnown: false, connectedOnly: false };

const TYPE_COLOURS: Record<string, string> = {
  Publication: "#f96e81",
  Software: "#09a1a1",
  Protocol: "#5484a4",
  DataStandard: "#d396a6",
  GuidanceDocument: "#acc0d3",
  TrainingResource: "#f6c992",
  FundingOpportunity: "#f6c992",
  Organization: "#acc0d3",
};

function primaryType(entity: Entity) {
  return entity.types.find((type) => type !== "DataStandard") ?? entity.types[0];
}

function entityColour(entity: Entity) {
  return TYPE_COLOURS[primaryType(entity)] ?? "#25343d";
}

function endpointId(endpoint: string | GraphNode) {
  return typeof endpoint === "string" ? endpoint : endpoint.id;
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function formatMoney(entity: Entity) {
  const funding = entity.fundingOpportunity;
  if (!funding?.amount || !funding.currency) return null;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: funding.currency, maximumFractionDigits: 0 }).format(funding.amount);
}

function matchesFilters(entity: Entity, query: string, filters: Filters) {
  const needle = query.trim().toLowerCase();
  const searchable = [
    entity.name,
    entity.description,
    ...entity.types.map(readableType),
    ...(entity.facets ?? []).flatMap((facet) => [facet.label, facetAxis(facet)]),
    ...(entity.sources ?? []).map((source) => source.name),
  ].filter(Boolean).join(" ").toLowerCase();
  if (needle && !searchable.includes(needle)) return false;
  if (filters.types.length && !entity.types.some((type) => filters.types.includes(type))) return false;
  if (filters.facets.length && !(entity.facets ?? []).some((facet) => filters.facets.includes(`${facetAxis(facet)}|${facet.label}`))) return false;
  if (filters.sources.length && !(entity.sources ?? []).some((source) => filters.sources.includes(source.name))) return false;
  if (filters.funding.length && !filters.funding.includes(fundingState(entity) ?? "not-funding")) return false;
  if (filters.licenceKnown && !entity.license) return false;
  if (filters.connectedOnly && resourceRelations(entity.id).filter((relation) => relation.predicate !== "cataloguedBy").length === 0) return false;
  return true;
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function TypeMark({ entity }: { entity: Entity }) {
  return <span className="type-mark" style={{ "--mark-colour": entityColour(entity) } as React.CSSProperties} aria-hidden="true" />;
}

function FilterGroup({ title, children, open = true }: { title: string; children: React.ReactNode; open?: boolean }) {
  return <details className="filter-group" open={open}><summary>{title}<ChevronDown size={14} /></summary><div>{children}</div></details>;
}

function FilterOption({ checked, label, count, onChange }: { checked: boolean; label: string; count?: number; onChange: () => void }) {
  return <label className="filter-option"><input type="checkbox" checked={checked} onChange={onChange} /><span className="check-box">{checked && <Check size={11} />}</span><span>{label}</span>{count !== undefined && <small>{count}</small>}</label>;
}

function FiltersPanel({ filters, setFilters, visible, onClose }: { filters: Filters; setFilters: React.Dispatch<React.SetStateAction<Filters>>; visible: boolean; onClose: () => void }) {
  const typeCount = (type: string) => resources.filter((resource) => resource.types.includes(type)).length;
  const facetCount = (value: string) => resources.filter((resource) => (resource.facets ?? []).some((facet) => `${facetAxis(facet)}|${facet.label}` === value)).length;
  const sourceCount = (source: string) => resources.filter((resource) => (resource.sources ?? []).some((item) => item.name === source)).length;
  return <aside className={`filters-panel ${visible ? "is-open" : ""}`} aria-label="Filter resources">
    <div className="filters-title"><span><Filter size={15} /> Filters</span><button className="mobile-close" onClick={onClose} aria-label="Close filters"><X size={17} /></button></div>
    <FilterGroup title="Resource form">
      {filterOptions.types.map((type) => <FilterOption key={type} checked={filters.types.includes(type)} label={readableType(type)} count={typeCount(type)} onChange={() => setFilters((current) => ({ ...current, types: toggleValue(current.types, type) }))} />)}
    </FilterGroup>
    <FilterGroup title="Topic and scope">
      {filterOptions.facets.map((value) => {
        const [axis, label] = value.split("|");
        return <FilterOption key={value} checked={filters.facets.includes(value)} label={`${label} · ${axis}`} count={facetCount(value)} onChange={() => setFilters((current) => ({ ...current, facets: toggleValue(current.facets, value) }))} />;
      })}
    </FilterGroup>
    <FilterGroup title="Funding state" open={false}>
      {["open", "upcoming", "rolling", "closed"].map((state) => <FilterOption key={state} checked={filters.funding.includes(state)} label={state[0].toUpperCase() + state.slice(1)} onChange={() => setFilters((current) => ({ ...current, funding: toggleValue(current.funding, state) }))} />)}
    </FilterGroup>
    <FilterGroup title="Source catalogue" open={false}>
      {filterOptions.sources.map((source) => <FilterOption key={source} checked={filters.sources.includes(source)} label={source} count={sourceCount(source)} onChange={() => setFilters((current) => ({ ...current, sources: toggleValue(current.sources, source) }))} />)}
    </FilterGroup>
    <FilterGroup title="Record quality" open={false}>
      <FilterOption checked={filters.connectedOnly} label="Has curated connections" onChange={() => setFilters((current) => ({ ...current, connectedOnly: !current.connectedOnly }))} />
      <FilterOption checked={filters.licenceKnown} label="Licence recorded" onChange={() => setFilters((current) => ({ ...current, licenceKnown: !current.licenceKnown }))} />
    </FilterGroup>
  </aside>;
}

function ActiveFilters({ filters, setFilters }: { filters: Filters; setFilters: React.Dispatch<React.SetStateAction<Filters>> }) {
  const chips = [
    ...filters.types.map((value) => ({ key: `type:${value}`, label: readableType(value), clear: () => setFilters((current) => ({ ...current, types: current.types.filter((item) => item !== value) })) })),
    ...filters.facets.map((value) => ({ key: `facet:${value}`, label: value.split("|")[1], clear: () => setFilters((current) => ({ ...current, facets: current.facets.filter((item) => item !== value) })) })),
    ...filters.sources.map((value) => ({ key: `source:${value}`, label: value, clear: () => setFilters((current) => ({ ...current, sources: current.sources.filter((item) => item !== value) })) })),
    ...filters.funding.map((value) => ({ key: `funding:${value}`, label: `Funding: ${value}`, clear: () => setFilters((current) => ({ ...current, funding: current.funding.filter((item) => item !== value) })) })),
    ...(filters.connectedOnly ? [{ key: "connected", label: "Connected", clear: () => setFilters((current) => ({ ...current, connectedOnly: false })) }] : []),
    ...(filters.licenceKnown ? [{ key: "licence", label: "Licence recorded", clear: () => setFilters((current) => ({ ...current, licenceKnown: false })) }] : []),
  ];
  if (!chips.length) return null;
  return <div className="active-filters" aria-label="Active filters">{chips.map((chip) => <button key={chip.key} onClick={chip.clear}>{chip.label}<X size={12} /></button>)}<button className="clear-all" onClick={() => setFilters(EMPTY_FILTERS)}>Clear all</button></div>;
}

function ResourceRow({ entity, selected, onSelect }: { entity: Entity; selected: boolean; onSelect: (entity: Entity) => void }) {
  const relations = resourceRelations(entity.id).filter((relationship) => relationship.predicate !== "cataloguedBy");
  const funding = fundingState(entity);
  return <button className={`resource-row ${selected ? "is-selected" : ""}`} onClick={() => onSelect(entity)} aria-current={selected ? "true" : undefined}>
    <TypeMark entity={entity} />
    <span className="resource-copy">
      <span className="resource-kinds">{entity.types.map(readableType).join(" · ")}{funding && <b className={`funding-state state-${funding}`}>{funding}</b>}</span>
      <strong>{entity.name}</strong>
      {entity.description && <span className="resource-description">{entity.description}</span>}
      <span className="resource-tags">{(entity.facets ?? []).slice(0, 3).map((facet) => <span key={`${facet.scheme}-${facet.id}`}>{facet.label}</span>)}</span>
    </span>
    <span className="resource-meta"><span>{entity.sources?.[0]?.name ?? "Curated record"}</span><span><Link2 size={12} /> {relations.length}</span></span>
    <ChevronRight size={17} />
  </button>;
}

function EmptyResults({ onClear }: { onClear: () => void }) {
  return <div className="empty-results"><Search size={25} /><h2>No matching resources</h2><p>Remove a filter or try a broader method, pathogen or resource name.</p><button onClick={onClear}>Clear filters</button></div>;
}

function Connections({ entity, onSelect }: { entity: Entity; onSelect: (entity: Entity) => void }) {
  const connected = resourceRelations(entity.id).map((relationship) => {
    const outgoing = relationship.subject === entity.id;
    const other = entities.find((candidate) => candidate.id === (outgoing ? relationship.object : relationship.subject));
    return other ? { relationship, outgoing, other } : null;
  }).filter((item): item is NonNullable<typeof item> => item !== null);
  return <section className="detail-section"><h3>Connections <span>{connected.length}</span></h3>
    {connected.length === 0 ? <p className="detail-empty">No curated resource-to-resource connections yet.</p> : <div className="connection-list">{connected.map(({ relationship, outgoing, other }) => <button key={relationship.id} onClick={() => onSelect(other)}>
      <TypeMark entity={other} /><span><strong>{other.name}</strong><small>{outgoing ? "→" : "←"} {predicateLabels[relationship.predicate] ?? relationship.predicate}{relationship.status ? ` · ${relationship.status}` : ""}</small></span><ChevronRight size={14} />
    </button>)}</div>}
  </section>;
}

function Details({ entity, onSelect, onClose }: { entity: Entity | null; onSelect: (entity: Entity) => void; onClose: () => void }) {
  if (!entity) return <aside className="details-panel details-empty" aria-label="Resource details"><Info size={23} /><h2>Select a resource</h2><p>Open a result to inspect its scope, licence, provenance and evidence-backed connections.</p></aside>;
  const source = entity.sources?.[0];
  const funding = entity.fundingOpportunity;
  const state = fundingState(entity);
  return <aside className="details-panel" aria-label="Resource details" tabIndex={-1}>
    <div className="detail-topline"><span><TypeMark entity={entity} />{entity.types.map(readableType).join(" · ")}</span><button onClick={onClose} aria-label="Close details"><X size={17} /></button></div>
    <h2>{entity.name}</h2>
    {entity.description ? <p className="detail-description">{entity.description}</p> : <p className="detail-description is-muted">No description was supplied by the source catalogue.</p>}
    <dl className="facts">
      <div><dt>Resource form</dt><dd>{entity.types.map(readableType).join(", ")}</dd></div>
      {entity.datePublished && <div><dt>Published</dt><dd>{formatDate(entity.datePublished)}</dd></div>}
      <div><dt>Resource licence</dt><dd className={entity.license ? "" : "unknown"}>{entity.license ? <a href={entity.license} target="_blank" rel="noreferrer">{licenceLabel(entity.license)} <ExternalLink size={11} /></a> : "Not recorded"}</dd></div>
      {source?.sourceLicense && <div><dt>Source metadata licence</dt><dd><a href={source.sourceLicense} target="_blank" rel="noreferrer">{licenceLabel(source.sourceLicense)} <ExternalLink size={11} /></a></dd></div>}
      {state && <div><dt>Funding state</dt><dd><span className={`funding-state state-${state}`}>{state}</span></dd></div>}
      {funding?.opens && <div><dt>Opens</dt><dd>{formatDate(funding.opens)}</dd></div>}
      {funding?.closes && <div><dt>Closes</dt><dd>{formatDate(funding.closes)}</dd></div>}
      {formatMoney(entity) && <div><dt>Maximum award</dt><dd>{formatMoney(entity)}</dd></div>}
      {funding?.eligibility && <div><dt>Eligibility</dt><dd>{funding.eligibility}</dd></div>}
      <div><dt>Last checked</dt><dd>{funding?.lastChecked ? formatDate(funding.lastChecked) : source?.retrievedAt ? formatDate(source.retrievedAt) : "Curated record"}</dd></div>
    </dl>
    {(entity.facets?.length ?? 0) > 0 && <section className="detail-section"><h3>Scope</h3><div className="detail-tags">{entity.facets?.map((facet) => <span key={`${facet.scheme}-${facet.id}`}><small>{facetAxis(facet)}</small>{facet.label}</span>)}</div></section>}
    <Connections entity={entity} onSelect={onSelect} />
    {(entity.sources?.length ?? 0) > 0 && <section className="detail-section"><h3>Provenance <span>{entity.sources?.length}</span></h3>{entity.sources?.map((item) => <a key={`${item.name}-${item.sourceRecordId}`} href={item.sourceUrl} target="_blank" rel="noreferrer" className="provenance-link"><span><strong>{item.name}</strong><small>Record {item.sourceRecordId ?? "—"}</small></span><ArrowUpRight size={15} /></a>)}</section>}
    {entity.landingPage && <a className="open-resource" href={entity.landingPage} target="_blank" rel="noreferrer">Open canonical resource <ArrowUpRight size={17} /></a>}
  </aside>;
}

function CatalogueView({ results, selected, onSelect, filters, setFilters, filtersOpen, setFiltersOpen }: { results: Entity[]; selected: Entity | null; onSelect: (entity: Entity) => void; filters: Filters; setFilters: React.Dispatch<React.SetStateAction<Filters>>; filtersOpen: boolean; setFiltersOpen: (open: boolean) => void }) {
  return <main className="catalogue-workspace">
    <FiltersPanel filters={filters} setFilters={setFilters} visible={filtersOpen} onClose={() => setFiltersOpen(false)} />
    <section className="results-panel" aria-label="Resource results">
      <div className="results-heading"><div><h1>Resources</h1><p>{results.length} of {resources.length} records</p></div><button className="mobile-filter" onClick={() => setFiltersOpen(true)}><Filter size={15} /> Filters</button></div>
      <ActiveFilters filters={filters} setFilters={setFilters} />
      <div className="results-list">{results.length ? results.map((entity) => <ResourceRow key={entity.id} entity={entity} selected={selected?.id === entity.id} onSelect={onSelect} />) : <EmptyResults onClear={() => setFilters(EMPTY_FILTERS)} />}</div>
    </section>
    <Details entity={selected} onSelect={onSelect} onClose={() => onSelect(selected!)} />
  </main>;
}

function drawGraphNode(node: GraphNode, context: CanvasRenderingContext2D, scale: number, selectedId: string | null, neighbours: Set<string> | null) {
  const x = node.x ?? 0; const y = node.y ?? 0;
  const selected = selectedId === node.id;
  const dimmed = neighbours && !neighbours.has(node.id);
  const radius = node.kind === "organization" ? 8 : 6;
  context.save(); context.globalAlpha = dimmed ? 0.2 : 1;
  context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2); context.fillStyle = entityColour(node.entity); context.fill();
  context.strokeStyle = "#ffffff"; context.lineWidth = 1.4; context.stroke();
  if (selected) { context.beginPath(); context.arc(x, y, radius + 3, 0, Math.PI * 2); context.strokeStyle = "#f96e81"; context.lineWidth = 2 / scale; context.stroke(); }
  if (scale > 0.92 || selected || node.kind === "organization") {
    const label = node.name.length > 28 ? `${node.name.slice(0, 26)}…` : node.name;
    const fontSize = Math.max(8.5 / scale, 4.1); context.font = `600 ${fontSize}px "IBM Plex Sans"`;
    context.textAlign = "left"; context.textBaseline = "middle"; context.fillStyle = "#25343d"; context.fillText(label, x + radius + 2, y);
  }
  context.restore();
}

function GraphView({ results, selected, onSelect, filters, setFilters, filtersOpen, setFiltersOpen }: { results: Entity[]; selected: Entity | null; onSelect: (entity: Entity) => void; filters: Filters; setFilters: React.Dispatch<React.SetStateAction<Filters>>; filtersOpen: boolean; setFiltersOpen: (open: boolean) => void }) {
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphLink>>();
  const graphWrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 650 });
  const [predicate, setPredicate] = useState("all");
  const [includeCatalogueLinks, setIncludeCatalogueLinks] = useState(false);
  const [showUnconnected, setShowUnconnected] = useState(false);
  const resultIds = useMemo(() => new Set(results.map((entity) => entity.id)), [results]);
  const graph = useMemo(() => {
    const built = buildResourceGraph(resultIds, includeCatalogueLinks);
    const links = predicate === "all" ? built.links : built.links.filter((link) => link.relationship.predicate === predicate);
    const ids = new Set(links.flatMap((link) => [endpointId(link.source), endpointId(link.target)]));
    return { nodes: showUnconnected ? built.nodes : built.nodes.filter((node) => ids.has(node.id)), links };
  }, [resultIds, includeCatalogueLinks, predicate, showUnconnected]);
  const selectedId = selected?.id ?? null;
  const neighbours = useMemo(() => {
    if (!selectedId) return null;
    const values = new Set([selectedId]);
    for (const link of graph.links) {
      const source = endpointId(link.source); const target = endpointId(link.target);
      if (source === selectedId) values.add(target);
      if (target === selectedId) values.add(source);
    }
    return values;
  }, [selectedId, graph.links]);
  const predicates = [...new Set(relationships.filter((relation) => includeCatalogueLinks || relation.predicate !== "cataloguedBy").map((relation) => relation.predicate))].sort();

  useEffect(() => {
    const element = graphWrapRef.current; if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element); return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const forceGraph = graphRef.current;
    const charge = forceGraph?.d3Force("charge") as { strength?: (value: number) => unknown } | undefined;
    const link = forceGraph?.d3Force("link") as { distance?: (value: number) => unknown } | undefined;
    charge?.strength?.(-55);
    link?.distance?.(62);
    forceGraph?.d3ReheatSimulation();
  }, [graph.nodes.length, graph.links.length]);
  useEffect(() => { const timer = window.setTimeout(() => graphRef.current?.zoomToFit(600, size.width < 600 ? 70 : 54), 450); return () => window.clearTimeout(timer); }, [graph.nodes.length, graph.links.length, size.width]);
  useEffect(() => {
    const node = graph.nodes.find((item) => item.id === selectedId);
    if (node && typeof node.x === "number" && typeof node.y === "number") { graphRef.current?.centerAt(node.x, node.y, 450); graphRef.current?.zoom(2, 450); }
  }, [selectedId, graph.nodes]);

  return <main className="graph-workspace">
    <FiltersPanel filters={filters} setFilters={setFilters} visible={filtersOpen} onClose={() => setFiltersOpen(false)} />
    <section className="graph-stage" aria-label="Evidence-backed resource graph">
      <div className="graph-toolbar">
        <div className="graph-count"><CircleDot size={15} /><span>{graph.nodes.length} nodes</span><span>{graph.links.length} curated connections</span></div>
        <div className="graph-controls">
          <label>Relationship<select value={predicate} onChange={(event) => setPredicate(event.target.value)}><option value="all">All useful relationships</option>{predicates.map((value) => <option key={value} value={value}>{predicateLabels[value] ?? value}</option>)}</select></label>
          <label className="catalogue-toggle"><input type="checkbox" checked={includeCatalogueLinks} onChange={(event) => setIncludeCatalogueLinks(event.target.checked)} /> Include catalogue links</label>
          <label className="unconnected-toggle"><input type="checkbox" checked={showUnconnected} onChange={(event) => setShowUnconnected(event.target.checked)} /> Show unconnected</label>
          <button onClick={() => graphRef.current?.zoom((graphRef.current?.zoom() ?? 1) * 1.25, 180)} aria-label="Zoom in"><Plus size={16} /></button>
          <button onClick={() => graphRef.current?.zoom((graphRef.current?.zoom() ?? 1) / 1.25, 180)} aria-label="Zoom out"><Minus size={16} /></button>
          <button onClick={() => graphRef.current?.zoomToFit(500, size.width < 600 ? 70 : 54)} aria-label="Fit graph"><LocateFixed size={16} /><span>Fit</span></button>
          <button className="mobile-filter" onClick={() => setFiltersOpen(true)}><Filter size={15} /></button>
        </div>
      </div>
      <div className="graph-canvas" ref={graphWrapRef}>
        <ForceGraph2D<GraphNode, GraphLink>
          ref={graphRef}
          graphData={graph}
          width={size.width}
          height={size.height}
          backgroundColor="#ffffff"
          nodeLabel={(node) => `${node.name} — ${node.entity.types.map(readableType).join(", ")}`}
          nodeCanvasObject={(node, context, scale) => drawGraphNode(node, context, scale, selectedId, neighbours)}
          nodePointerAreaPaint={(node, colour, context) => { context.fillStyle = colour; context.beginPath(); context.arc(node.x ?? 0, node.y ?? 0, 11, 0, Math.PI * 2); context.fill(); }}
          linkColor={(link) => !neighbours ? "rgba(84,132,164,.48)" : neighbours.has(endpointId(link.source)) && neighbours.has(endpointId(link.target)) ? "rgba(84,132,164,.78)" : "rgba(84,132,164,.06)"}
          linkWidth={(link) => selectedId && (endpointId(link.source) === selectedId || endpointId(link.target) === selectedId) ? 2 : 1}
          linkDirectionalArrowLength={4}
          linkLabel={(link) => `${link.predicate} · ${link.relationship.status ?? "unreviewed"}`}
          onNodeClick={(node) => onSelect(node.entity)}
          onEngineStop={() => {
            const node = graph.nodes.find((item) => item.id === selectedId);
            if (node && typeof node.x === "number" && typeof node.y === "number") {
              graphRef.current?.centerAt(node.x, node.y, 400);
              graphRef.current?.zoom(2, 400);
            } else graphRef.current?.zoomToFit(500, size.width < 600 ? 70 : 54);
          }}
          cooldownTicks={120}
          d3AlphaDecay={0.03}
          d3VelocityDecay={0.34}
          minZoom={0.4}
          maxZoom={7}
        />
      </div>
      <div className="graph-help"><span>Edges are curated assertions, not shared categories.</span><span><i /> directed relationship · select a node to isolate neighbours</span></div>
    </section>
    <Details entity={selected} onSelect={onSelect} onClose={() => onSelect(selected!)} />
  </main>;
}

export default function App() {
  const viewFromPath = (): View => window.location.pathname === "/standard" ? "standard" : window.location.pathname === "/graph" ? "graph" : "resources";
  const [view, setView] = useState<View>(viewFromPath);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const selected = entities.find((entity) => entity.id === selectedId) ?? null;
  const results = useMemo(() => resources.filter((entity) => matchesFilters(entity, query, filters)).sort((a, b) => {
    const fundingA = fundingState(a); const fundingB = fundingState(b);
    if (fundingA === "open" && fundingB !== "open") return -1;
    if (fundingB === "open" && fundingA !== "open") return 1;
    return a.name.localeCompare(b.name);
  }), [query, filters]);
  const activeFilterCount = filters.types.length + filters.facets.length + filters.sources.length + filters.funding.length + Number(filters.licenceKnown) + Number(filters.connectedOnly);

  function select(entity: Entity) { setSelectedId((current) => current === entity.id ? null : entity.id); }
  function navigate(next: View) {
    const path = next === "resources" ? "/" : `/${next}`;
    window.history.pushState({}, "", path);
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    const onPopState = () => setView(viewFromPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return <div className={`app-shell ${view === "standard" ? "is-standard" : ""}`}>
    <header className="topbar">
      <a className="brand" href="/" onClick={(event) => { event.preventDefault(); navigate("resources"); }} aria-label="Glitter resource knowledgebase"><span className="brand-mark"><i /><i /><i /></span><strong>glitter</strong><span>pathogen genomics knowledgebase</span></a>
      <nav aria-label="Primary navigation">
        <button className={view === "resources" ? "is-active" : ""} onClick={() => navigate("resources")}><List size={15} /> Resources</button>
        <button className={view === "graph" ? "is-active" : ""} onClick={() => navigate("graph")}><Network size={15} /> Graph</button>
        <button className={view === "standard" ? "is-active" : ""} onClick={() => navigate("standard")}><FileText size={15} /> Standard</button>
        <a href="https://github.com/happykhan/glitter" target="_blank" rel="noreferrer"><Github size={15} /> GitHub</a>
      </nav>
    </header>
    {view !== "standard" && <section className="search-band" aria-label="Search resources">
      <Search size={20} />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search protocols, software, papers, standards and funding calls" aria-label="Search resources" />
      {query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={17} /></button>}
      <button className="search-filter-button" onClick={() => setFiltersOpen(true)}><Filter size={15} /> Filters{activeFilterCount > 0 && <b>{activeFilterCount}</b>}</button>
    </section>}
    {view === "resources" ? <CatalogueView results={results} selected={selected} onSelect={select} filters={filters} setFilters={setFilters} filtersOpen={filtersOpen} setFiltersOpen={setFiltersOpen} /> : view === "graph" ? <GraphView results={results} selected={selected} onSelect={select} filters={filters} setFilters={setFilters} filtersOpen={filtersOpen} setFiltersOpen={setFiltersOpen} /> : <StandardPage />}
    <footer className="statusbar"><span><span className="status-dot" /> Public-health genomics resources</span><span>{resources.length} resources · {relationships.filter((relationship) => relationship.predicate !== "cataloguedBy").length} useful connections</span><span>Source provenance and licence uncertainty retained</span></footer>
  </div>;
}
