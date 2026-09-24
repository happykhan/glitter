import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import { ArrowUpRight, Check, ChevronRight, CircleDot, Crosshair, Github, LocateFixed, Minus, Network, Plus, Search, X } from "lucide-react";
import { buildKnowledgeGraph, kindLabels, readableType, resources, type GraphKind, type GraphLink, type GraphNode } from "./data";

const PALETTE: Record<GraphKind, string> = {
  resource: "#25343d",
  catalogue: "#f6c992",
  type: "#5484a4",
  target: "#09a1a1",
  method: "#d396a6",
  application: "#f0525c",
  organization: "#acc0d3",
};

const graph = buildKnowledgeGraph();

function endpointId(endpoint: string | GraphNode) {
  return typeof endpoint === "string" ? endpoint : endpoint.id;
}

function neighboursOf(nodeId: string) {
  return new Set(graph.links.flatMap((link) => {
    const source = endpointId(link.source);
    const target = endpointId(link.target);
    if (source === nodeId) return [target];
    if (target === nodeId) return [source];
    return [];
  }));
}

function nodeRadius(node: GraphNode) {
  if (node.kind === "resource") return 5.2;
  if (node.kind === "catalogue" || node.kind === "organization") return 8;
  return 6.4 + Math.min(node.resourceCount ?? 0, 8) * 0.35;
}

function licenceLabel(url: string) {
  if (/creativecommons\.org\/licenses\/by\/4\.0/.test(url)) return "CC BY 4.0";
  try { return new URL(url).hostname; } catch { return url; }
}

function drawNode(node: GraphNode, context: CanvasRenderingContext2D, scale: number, selectedId: string | null, hoveredId: string | null, visible: Set<string> | null, compact: boolean) {
  const x = node.x ?? 0;
  const y = node.y ?? 0;
  const radius = nodeRadius(node);
  const dimmed = visible && !visible.has(node.id);
  context.save();
  context.globalAlpha = dimmed ? 0.12 : 1;
  if (selectedId === node.id) {
    context.beginPath();
    context.arc(x, y, radius + 4.5, 0, Math.PI * 2);
    context.strokeStyle = "#f0525c";
    context.lineWidth = 2.2 / scale;
    context.stroke();
  }
  context.fillStyle = PALETTE[node.kind];
  context.strokeStyle = "#ffffff";
  context.lineWidth = 1.4 / scale;
  context.beginPath();
  if (node.kind === "catalogue") {
    context.moveTo(x, y - radius);
    context.lineTo(x + radius, y);
    context.lineTo(x, y + radius);
    context.lineTo(x - radius, y);
    context.closePath();
  } else if (node.kind === "type") {
    context.rect(x - radius, y - radius, radius * 2, radius * 2);
  } else {
    context.arc(x, y, radius, 0, Math.PI * 2);
  }
  context.fill();
  context.stroke();
  const compactLabel = !compact || node.kind === "catalogue";
  const shouldLabel = (node.kind !== "resource" && compactLabel) || selectedId === node.id || hoveredId === node.id || scale > 2.4;
  if (shouldLabel && !dimmed) {
    const fontSize = Math.max(10 / scale, node.kind === "resource" ? 4.1 : 4.7);
    const limit = compact ? 24 : 44;
    const label = node.name.length > limit ? `${node.name.slice(0, limit - 2)}…` : node.name;
    context.font = `${node.kind === "resource" ? 500 : 600} ${fontSize}px "IBM Plex Sans"`;
    const width = context.measureText(label).width;
    const placeLeft = compact && x > 0;
    const labelX = placeLeft ? x - radius - 3 - width : x + radius + 3;
    const labelY = y + fontSize * 0.34;
    context.fillStyle = "rgba(247, 244, 237, 0.94)";
    context.fillRect(labelX - 1.5, labelY - fontSize + 1, width + 3, fontSize + 2);
    context.fillStyle = "#25343d";
    context.fillText(label, labelX, labelY);
  }
  context.restore();
}

function drawLinkPredicate(link: GraphLink, context: CanvasRenderingContext2D, scale: number, selectedId: string | null) {
  if (!selectedId || (endpointId(link.source) !== selectedId && endpointId(link.target) !== selectedId)) return;
  const source = typeof link.source === "string" ? null : link.source;
  const target = typeof link.target === "string" ? null : link.target;
  if (!source || !target || source.x == null || source.y == null || target.x == null || target.y == null) return;
  const outgoing = source.id === selectedId;
  const label = `${outgoing ? "→" : "←"} ${link.predicate}${link.explicit ? " · verified" : ""}`;
  const fontSize = Math.max(10 / scale, 4.5);
  const x = (source.x + target.x) / 2;
  const y = (source.y + target.y) / 2;
  context.save();
  context.font = `500 ${fontSize}px "IBM Plex Sans"`;
  const width = context.measureText(label).width;
  context.fillStyle = "rgba(247,244,237,.96)";
  context.fillRect(x - width / 2 - 2, y - fontSize + 1, width + 4, fontSize + 3);
  context.fillStyle = link.explicit ? "#b42f3a" : "#52636d";
  context.textAlign = "center";
  context.fillText(label, x, y + fontSize * .35);
  context.restore();
}

function SearchRail({ query, setQuery, selectedId, onSelect, activeKinds, toggleKind }: {
  query: string;
  setQuery: (value: string) => void;
  selectedId: string | null;
  onSelect: (node: GraphNode) => void;
  activeKinds: GraphKind[];
  toggleKind: (kind: GraphKind) => void;
}) {
  const [resultsOpen, setResultsOpen] = useState(false);
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return graph.nodes
      .filter((node) => activeKinds.includes(node.kind))
      .filter((node) => !needle || node.name.toLowerCase().includes(needle) || node.entity?.description?.toLowerCase().includes(needle))
      .sort((a, b) => {
        if ((a.kind === "resource") !== (b.kind === "resource")) return a.kind === "resource" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }, [query, activeKinds]);
  const kindOrder: GraphKind[] = ["resource", "catalogue", "type", "target", "method", "application", "organization"];
  return (
    <aside className="search-rail" aria-label="Find nodes">
      <div className="rail-heading"><h1>Resource graph</h1><span>{graph.nodes.length} nodes · {graph.links.length} relationships</span></div>
      <label className="graph-search">
        <Search size={17} aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the graph" />
        {query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={15} /></button>}
      </label>
      <div className="kind-filters" aria-label="Node types">
        {kindOrder.map((kind) => (
          <button key={kind} onClick={() => toggleKind(kind)} aria-pressed={activeKinds.includes(kind)}>
            <span className={`legend-shape kind-${kind}`} />{kindLabels[kind]}{activeKinds.includes(kind) && <Check size={13} />}
          </button>
        ))}
      </div>
      <button className="mobile-results-toggle" onClick={() => setResultsOpen(!resultsOpen)} aria-expanded={resultsOpen} aria-controls="graph-node-list">
        {resultsOpen ? "Hide node index" : `Browse all ${results.length} nodes`} <ChevronRight size={14} />
      </button>
      <div id="graph-node-list" className={`result-list ${query ? "has-query" : ""} ${resultsOpen ? "is-open" : ""}`} aria-live="polite">
        <div className="result-list-heading"><span>Matches</span><span>{results.length}</span></div>
        {results.map((node) => (
          <button key={node.id} data-node-id={node.id} onClick={() => onSelect(node)} className={selectedId === node.id ? "is-selected" : ""}>
            <span className={`result-dot kind-${node.kind}`} />
            <span><strong>{node.name}</strong><small>{kindLabels[node.kind]}</small></span>
            <ChevronRight size={15} />
          </button>
        ))}
        {results.length === 0 && <p className="empty-copy">No nodes match this search and filter combination.</p>}
      </div>
    </aside>
  );
}

function Inspector({ node, onSelect, onClose }: { node: GraphNode | null; onSelect: (node: GraphNode) => void; onClose: () => void }) {
  if (!node) return (
    <aside className="inspector inspector-empty" aria-label="Graph selection">
      <Crosshair size={20} /><h2>Select a node</h2>
      <p>Choose any resource or concept to isolate its immediate neighbourhood and inspect the evidence behind each connection.</p>
    </aside>
  );
  const entity = node.entity;
  const source = entity?.sources?.[0] ?? node.source;
  const connected = graph.links
    .filter((link) => endpointId(link.source) === node.id || endpointId(link.target) === node.id)
    .map((link) => {
      const outgoing = endpointId(link.source) === node.id;
      const candidate = graph.nodes.find((item) => item.id === (outgoing ? endpointId(link.target) : endpointId(link.source)));
      return candidate ? { node: candidate, predicate: link.predicate, outgoing, explicit: link.explicit } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => Number(b.node.kind === "resource") - Number(a.node.kind === "resource"));
  return (
    <aside className="inspector" aria-label="Selected node details" tabIndex={-1}>
      <div className="inspector-topline">
        <span><span className={`legend-shape kind-${node.kind}`} />{kindLabels[node.kind]}</span>
        <button onClick={onClose} aria-label="Close details"><X size={17} /></button>
      </div>
      <h2>{node.name}</h2>
      {entity?.description && <p className="inspector-description">{entity.description}</p>}
      {!entity?.description && node.kind === "resource" && <p className="inspector-description is-muted">No description was supplied by the source catalogue.</p>}
      {entity && (
        <dl className="facts">
          <div><dt>Resource form</dt><dd>{entity.types.map((type) => readableType(type)).join(", ")}</dd></div>
          <div><dt>Resource licence</dt><dd className="unknown">Not recorded</dd></div>
          {source?.sourceLicense && <div><dt>Source metadata licence</dt><dd><a href={source.sourceLicense} target="_blank" rel="noreferrer">{licenceLabel(source.sourceLicense)} <ArrowUpRight size={11} /></a></dd></div>}
          <div><dt>Last retrieved</dt><dd>{source?.retrievedAt ?? "Curated record"}</dd></div>
        </dl>
      )}
      {source && (
        <section className="inspector-section"><h3>Provenance</h3>
          <a href={source.sourceUrl} target="_blank" rel="noreferrer" className="provenance-link">
            <span><strong>{source.name}</strong><small>Source record {source.sourceRecordId ?? "—"}</small></span><ArrowUpRight size={16} />
          </a>
        </section>
      )}
      <section className="inspector-section"><h3>Connected nodes <span>{connected.length}</span></h3>
        <div className="connected-list">
          {connected.map(({ node: candidate, predicate, outgoing, explicit }) => (
            <button key={`${candidate.id}-${predicate}`} data-node-id={candidate.id} onClick={() => onSelect(candidate)}>
              <span className={`result-dot kind-${candidate.kind}`} />
              <span><strong>{candidate.name}</strong><small>{outgoing ? "→" : "←"} {predicate}{explicit ? " · verified link" : ""}</small></span><ChevronRight size={14} />
            </button>
          ))}
        </div>
      </section>
      {entity?.landingPage && <a className="open-resource" href={entity.landingPage} target="_blank" rel="noreferrer">Open resource <ArrowUpRight size={17} /></a>}
    </aside>
  );
}

export default function App() {
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphLink>>();
  const graphWrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 700 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeKinds, setActiveKinds] = useState<GraphKind[]>(["resource", "catalogue", "type", "target", "method", "application", "organization"]);
  const selected = graph.nodes.find((node) => node.id === selectedId) ?? null;
  const visible = selectedId ? new Set([selectedId, ...neighboursOf(selectedId)]) : null;
  const displayedGraph = useMemo(() => {
    const allowed = new Set(graph.nodes.filter((node) => activeKinds.includes(node.kind)).map((node) => node.id));
    return { nodes: graph.nodes.filter((node) => allowed.has(node.id)), links: graph.links.filter((link) => allowed.has(endpointId(link.source)) && allowed.has(endpointId(link.target))) };
  }, [activeKinds]);

  useEffect(() => {
    const element = graphWrapRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => graphRef.current?.zoomToFit(700, size.width < 600 ? 100 : 68), 650);
    return () => window.clearTimeout(timer);
  }, [activeKinds, size.width]);
  useEffect(() => {
    if (selectedId) document.querySelector<HTMLElement>(".inspector:not(.inspector-empty)")?.focus({ preventScroll: true });
  }, [selectedId]);

  function selectNode(node: GraphNode) {
    setSelectedId(node.id);
    if (typeof node.x === "number" && typeof node.y === "number") {
      graphRef.current?.centerAt(node.x, node.y, 550);
      graphRef.current?.zoom(2.1, 550);
    }
  }
  function toggleKind(kind: GraphKind) {
    setActiveKinds((current) => current.includes(kind) ? current.filter((item) => item !== kind) : [...current, kind]);
  }
  function closeInspector() {
    const previous = selectedId;
    setSelectedId(null);
    window.setTimeout(() => document.querySelector<HTMLElement>(`[data-node-id="${CSS.escape(previous ?? "")}"]`)?.focus({ preventScroll: true }), 0);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Glitter resource graph"><span className="brand-mark"><i /><i /><i /></span><strong>glitter</strong><span>pathogen genomics knowledgebase</span></a>
        <nav aria-label="Primary navigation">
          <a className="is-active" href="#graph"><Network size={15} /> Graph</a>
          <a href="https://github.com/happykhan/glitter/blob/main/docs/model.md" target="_blank" rel="noreferrer">Data model</a>
          <a href="https://github.com/happykhan/glitter" target="_blank" rel="noreferrer"><Github size={15} /> GitHub</a>
        </nav>
      </header>
      <main className="graph-app" id="graph">
        <SearchRail query={query} setQuery={setQuery} selectedId={selectedId} onSelect={selectNode} activeKinds={activeKinds} toggleKind={toggleKind} />
        <section className="graph-stage" aria-label="Interactive resource knowledge graph">
          <div className="graph-toolbar">
            <div><CircleDot size={15} /><span>{displayedGraph.nodes.length} nodes</span><span>{displayedGraph.links.length} relationships</span></div>
            <div>
              <button onClick={() => graphRef.current?.zoom((graphRef.current?.zoom() ?? 1) * 1.25, 200)} aria-label="Zoom in"><Plus size={16} /></button>
              <button onClick={() => graphRef.current?.zoom((graphRef.current?.zoom() ?? 1) / 1.25, 200)} aria-label="Zoom out"><Minus size={16} /></button>
              <button onClick={() => { setSelectedId(null); graphRef.current?.zoomToFit(600, size.width < 600 ? 100 : 68); }} aria-label="Fit graph"><LocateFixed size={16} /><span>Fit graph</span></button>
            </div>
          </div>
          <div className="graph-canvas" ref={graphWrapRef}>
            <ForceGraph2D<GraphNode, GraphLink>
              ref={graphRef}
              graphData={displayedGraph}
              width={size.width}
              height={size.height}
              backgroundColor="#ffffff"
              nodeLabel={(node) => `${node.name} — ${kindLabels[node.kind]}`}
              nodeCanvasObject={(node, context, scale) => drawNode(node, context, scale, selectedId, hoveredId, visible, size.width < 600)}
              nodePointerAreaPaint={(node, color, context) => { context.fillStyle = color; context.beginPath(); context.arc(node.x ?? 0, node.y ?? 0, nodeRadius(node) + 4, 0, Math.PI * 2); context.fill(); }}
              linkColor={(link) => {
                if (!visible) return link.explicit ? "rgba(203,74,56,.7)" : "rgba(23,35,47,.18)";
                return visible.has(endpointId(link.source)) && visible.has(endpointId(link.target)) ? "rgba(23,35,47,.58)" : "rgba(23,35,47,.035)";
              }}
              linkWidth={(link) => link.explicit ? 1.8 : selectedId && (endpointId(link.source) === selectedId || endpointId(link.target) === selectedId) ? 1.25 : 0.65}
              linkDirectionalArrowLength={(link) => link.explicit ? 3.5 : 0}
              linkLabel={(link) => link.predicate}
              onRenderFramePost={(context, scale) => graph.links.forEach((link) => drawLinkPredicate(link, context, scale, selectedId))}
              onNodeClick={(node) => selectNode(node)}
              onNodeHover={(node) => setHoveredId(node?.id ?? null)}
              onBackgroundClick={() => setSelectedId(null)}
              cooldownTicks={140}
              d3AlphaDecay={0.025}
              d3VelocityDecay={0.32}
              minZoom={0.35}
              maxZoom={8}
            />
          </div>
          <div className="graph-help"><span>Drag nodes · scroll to zoom · select to isolate</span><span className="edge-key"><i /> metadata relationship <i /> verified assertion</span></div>
        </section>
        <Inspector node={selected} onSelect={selectNode} onClose={closeInspector} />
      </main>
      <footer className="statusbar"><span><span className="status-dot" /> Live prototype</span><span>{resources.length} resources from 3 source catalogues</span><span>Imported metadata remains traceable to source</span></footer>
    </div>
  );
}
