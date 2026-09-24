import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Database,
  FileCheck2,
  FlaskConical,
  Github,
  Menu,
  Network,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  entities,
  readableType,
  relationships,
  resourceTypes,
  sourceNames,
  stageFor,
  stages,
  type Entity,
  type Stage,
} from "./data";

const typeIcons: Record<string, typeof BookOpen> = {
  DataStandard: FileCheck2,
  Protocol: FlaskConical,
  GuidanceDocument: BookOpen,
  Software: Github,
  TrainingResource: Database,
};

const typeLabels: Record<string, string> = {
  DataStandard: "Standard",
  Protocol: "Protocol",
  GuidanceDocument: "Guidance",
  Software: "Software",
  TrainingResource: "Training",
};

const catalogueEntities = entities.filter((entity) => entity.types[0] !== "Organization");

function SourceMark({ name }: { name: string }) {
  const initials = name.startsWith("IPSN") ? "IPSN" : name.startsWith("GHRU") ? "GHRU" : "P4G";
  return <span className="source-mark" title={name} aria-label={`Source: ${name}`}>{initials}</span>;
}

function ResourceNode({ entity, active, onSelect }: { entity: Entity; active: boolean; onSelect: () => void }) {
  const Icon = typeIcons[entity.types[0]] ?? BookOpen;
  return (
    <button
      className={`resource-node type-${entity.types[0]} ${active ? "is-active" : ""}`}
      onClick={onSelect}
      aria-pressed={active}
      data-resource-id={entity.id}
    >
      <span className="node-symbol"><Icon aria-hidden="true" size={16} strokeWidth={1.8} /></span>
      <span className="node-copy">
        <span className="node-type">{typeLabels[entity.types[0]] ?? readableType(entity.types[0])}</span>
        <span className="node-name">{entity.name}</span>
      </span>
      {entity.sources?.[0] && <SourceMark name={entity.sources[0].name} />}
    </button>
  );
}

function DetailPanel({ entity, onClose, panelRef }: { entity: Entity; onClose: () => void; panelRef: React.RefObject<HTMLElement> }) {
  const source = entity.sources?.[0];
  const related = relationships
    .filter((relationship) => relationship.subject === entity.id || relationship.object === entity.id)
    .map((relationship) => ({
      ...relationship,
      target: entities.find((candidate) => candidate.id === (relationship.subject === entity.id ? relationship.object : relationship.subject)),
    }))
    .filter((relationship) => relationship.target);

  return (
    <aside className="detail-panel" aria-label="Selected resource details" ref={panelRef} tabIndex={-1}>
      <div className="detail-topline">
        <button className="icon-button" onClick={onClose} aria-label="Close resource details"><X size={19} /></button>
      </div>
      <div className="detail-types">
        {entity.types.map((type) => <span key={type}>{typeLabels[type] ?? readableType(type)}</span>)}
      </div>
      <h2>{entity.name}</h2>
      <p className="detail-description">{entity.description ?? "No description was supplied by the source catalogue."}</p>

      <div className="detail-facts">
        <div>
          <span>Pathway stage</span>
          <strong>{stageFor(entity)}</strong>
        </div>
        <div>
          <span>Resource licence</span>
          <strong className="licence-unknown">Not recorded</strong>
        </div>
        {source?.sourceLicense && (
          <div>
            <span>Source metadata licence</span>
            <strong>{source.sourceLicense}</strong>
          </div>
        )}
        <div>
          <span>Last retrieved</span>
          <strong>{source?.retrievedAt ?? "Curated record"}</strong>
        </div>
      </div>

      {(entity.facets?.length ?? 0) > 0 && (
        <div className="detail-section">
          <h3>Scope</h3>
          <div className="facet-list">{entity.facets?.map((facet) => <span key={`${facet.scheme}-${facet.id}`}>{facet.label}</span>)}</div>
        </div>
      )}

      <div className="detail-section">
        <h3>Provenance</h3>
        {source ? (
          <a className="source-link" href={source.sourceUrl} target="_blank" rel="noreferrer">
            <SourceMark name={source.name} />
            <span><strong>{source.name}</strong><small>Source record {source.sourceRecordId ?? "—"}</small></span>
            <ArrowUpRight size={17} />
          </a>
        ) : <p>No imported-source provenance recorded.</p>}
      </div>

      {source && (
        <div className="detail-section">
          <h3>Connections</h3>
          <div className="relationship">
            <Network size={16} />
            <span><small>Catalogued by</small>{source.name}</span>
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="detail-section">
          <h3>Explicit graph links</h3>
          {related.map((relationship) => (
            <div className="relationship" key={relationship.id}>
              <Network size={16} />
              <span><small>{readableType(relationship.predicate)}</small>{relationship.target?.name}</span>
            </div>
          ))}
        </div>
      )}

      <a className="primary-link" href={entity.landingPage ?? entity.id} target="_blank" rel="noreferrer">
        Open the resource <ArrowUpRight size={18} />
      </a>
    </aside>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [source, setSource] = useState("All sources");
  const [selectedId, setSelectedId] = useState(catalogueEntities[0]?.id ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(() => !window.matchMedia("(max-width: 760px)").matches);
  const [navOpen, setNavOpen] = useState(false);
  const detailRef = useRef<HTMLElement>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return catalogueEntities.filter((entity) => {
      const searchText = `${entity.name} ${entity.description ?? ""} ${(entity.facets ?? []).map((facet) => facet.label).join(" ")}`.toLowerCase();
      const typeMatch = selectedTypes.length === 0 || entity.types.some((type) => selectedTypes.includes(type));
      const sourceMatch = source === "All sources" || entity.sources?.some((item) => item.name === source);
      return (!needle || searchText.includes(needle)) && typeMatch && sourceMatch;
    });
  }, [query, selectedTypes, source]);

  const selected = filtered.find((entity) => entity.id === selectedId) ?? filtered[0];
  const grouped = useMemo(() => Object.fromEntries(stages.map((stage) => [stage, filtered.filter((entity) => stageFor(entity) === stage)])) as Record<Stage, Entity[]>, [filtered]);

  function toggleType(type: string) {
    setSelectedTypes((current) => current.includes(type) ? current.filter((item) => item !== type) : [...current, type]);
  }

  function selectResource(entity: Entity) {
    setSelectedId(entity.id);
    setDetailOpen(true);
  }

  useEffect(() => {
    if (detailOpen) detailRef.current?.focus({ preventScroll: true });
  }, [detailOpen, selected?.id]);

  function closeDetail() {
    setDetailOpen(false);
    window.setTimeout(() => {
      const trigger = document.querySelector<HTMLElement>(`[data-resource-id="${CSS.escape(selected?.id ?? "")}"]`);
      trigger?.focus({ preventScroll: true });
    }, 0);
  }

  const clearFilters = () => {
    setQuery("");
    setSelectedTypes([]);
    setSource("All sources");
  };

  return (
    <div className="app-shell">
      <header className="masthead">
        <a className="brand" href="#atlas" aria-label="Glitter home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>glitter</span>
        </a>
        <nav aria-label="Primary navigation" className={navOpen ? "is-open" : ""}>
          <a className="is-current" href="#atlas">Resource atlas</a>
          <a href="#about">About the standard</a>
          <a href="https://github.com/happykhan/glitter" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} /></a>
        </nav>
        <button className="mobile-menu" aria-label={navOpen ? "Close navigation" : "Open navigation"} aria-expanded={navOpen} onClick={() => setNavOpen(!navOpen)}>
          {navOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <main id="atlas">
        <section className="atlas-intro">
          <div>
            <h1>Find the next resource<br />your WGS pathway needs.</h1>
          </div>
          <div className="atlas-summary">
            <p>Move from planning to sharing. Follow standards, protocols, guidance, software and training back to their source.</p>
            <div className="summary-measures">
              <span><strong>{catalogueEntities.length}</strong> resources</span>
              <span><strong>{sourceNames.length}</strong> source catalogues</span>
              <span><strong>{relationships.length}</strong> verified links</span>
            </div>
          </div>
        </section>

        <section className="atlas-workspace" aria-label="Resource atlas">
          <div className="atlas-controls">
            <div className="search-control">
              <Search size={19} aria-hidden="true" />
              <input aria-label="Search resources" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search methods, pathogens or resources" />
              {query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={17} /></button>}
            </div>
            <button className={`filter-trigger ${filtersOpen ? "is-active" : ""}`} onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen} aria-controls="atlas-filters">
              <SlidersHorizontal size={18} /> Filters
              {(selectedTypes.length > 0 || source !== "All sources") && <span>{selectedTypes.length + (source !== "All sources" ? 1 : 0)}</span>}
            </button>
            <div className="result-count" aria-live="polite"><strong>{filtered.length}</strong> shown</div>
          </div>

          <div id="atlas-filters" className={`filter-drawer ${filtersOpen ? "is-open" : ""}`}>
            <div>
              <span className="filter-label">Resource form</span>
              <div className="filter-options">
                {resourceTypes.map((type) => (
                  <button key={type} onClick={() => toggleType(type)} className={selectedTypes.includes(type) ? "is-selected" : ""}>
                    {selectedTypes.includes(type) && <Check size={14} />} {typeLabels[type]}
                  </button>
                ))}
              </div>
            </div>
            <label>
              <span className="filter-label">Source catalogue</span>
              <select value={source} onChange={(event) => setSource(event.target.value)}>
                <option>All sources</option>
                {sourceNames.map((name) => <option key={name}>{name}</option>)}
              </select>
            </label>
            <button className="clear-button" onClick={clearFilters}>Clear all</button>
          </div>

          <div className={`atlas-layout ${detailOpen && selected ? "has-detail" : ""}`}>
            <div className="pathway" aria-label="Resources by WGS pathway stage">
              <div className="route-line" aria-hidden="true" />
              {stages.map((stage, stageIndex) => (
                <section className="stage" key={stage} style={{ "--stage-index": stageIndex } as React.CSSProperties}>
                  <header>
                    <span className="stage-stop" aria-hidden="true" />
                    <div><span>Stage {stageIndex + 1}</span><h2>{stage}</h2></div>
                    <strong>{grouped[stage].length}</strong>
                  </header>
                  <div className="stage-resources">
                    {grouped[stage].map((entity) => (
                      <ResourceNode key={entity.id} entity={entity} active={selected?.id === entity.id} onSelect={() => selectResource(entity)} />
                    ))}
                    {grouped[stage].length === 0 && <p className="stage-empty">No matching resources</p>}
                  </div>
                </section>
              ))}
              {filtered.length === 0 && (
                <div className="empty-state">
                  <CircleHelp size={28} />
                  <h2>No route matches those filters</h2>
                  <p>Try removing a resource form, source or search term.</p>
                  <button onClick={clearFilters}>Reset the atlas</button>
                </div>
              )}
            </div>
            {detailOpen && selected && <DetailPanel entity={selected} onClose={closeDetail} panelRef={detailRef} />}
          </div>
        </section>

        <section className="about-strip" id="about">
          <div>
            <ShieldCheck size={27} />
            <h2>Traceable by design</h2>
          </div>
          <p>Every imported record keeps its source catalogue, retrieval date and stated source licence. Unknown resource licences stay unknown rather than being guessed.</p>
          <a href="https://github.com/happykhan/glitter" target="_blank" rel="noreferrer">Read the draft model <ChevronRight size={17} /></a>
        </section>
      </main>

      <footer>
        <span>Glitter v0.1 discussion prototype</span>
        <span>Built for interoperable pathogen genomics</span>
      </footer>
    </div>
  );
}
