import { useState } from "react";
import { ArrowUpRight, ChevronRight, Info, Search } from "lucide-react";
import questionData from "../content/questions.json";
import { entities, readableType, type Entity } from "./data";

type Question = (typeof questionData)[number];

export default function QuestionsPage({ onOpenResource }: { onOpenResource: (entity: Entity) => void }) {
  const [activeId, setActiveId] = useState<string>(questionData[0].id);
  const active = questionData.find((item) => item.id === activeId) as Question;
  return <main className="questions-page">
    <aside className="questions-index" aria-label="Practical questions">
      <div className="questions-index-heading"><strong>Questions people ask</strong><span>Choose a question to see a route through the catalogue.</span><select className="questions-mobile-select" aria-label="Choose a practical question" value={activeId} onChange={(event) => setActiveId(event.target.value)}>{questionData.map((item) => <option value={item.id} key={item.id}>{item.question}</option>)}</select></div>
      {questionData.map((item) => <button key={item.id} className={active.id === item.id ? "is-active" : ""} onClick={() => setActiveId(item.id)} aria-current={active.id === item.id ? "true" : undefined}>{item.question}<ChevronRight size={15} /></button>)}
      <p>These are editorial reading routes, not new knowledge-graph edges. The graph only draws verified relationships.</p>
    </aside>
    <article className="question-article" key={active.id}>
      <header><h1>{active.question}</h1><p>{active.answer}</p></header>
      <div className="question-clarify"><Info size={18} /><div><strong>First clarify</strong><p>{active.askFirst}</p></div></div>
      <section className="question-route" aria-label="Suggested resources"><h2>Where to start</h2>{active.steps.map((step, index) => <div className="question-step" key={step.title}><div className="question-step-heading"><span>{index + 1}</span><h3>{step.title}</h3></div><div className="question-resource-list">{step.resourceIds.map((id) => {
        const entity = entities.find((candidate) => candidate.id === id);
        return entity ? <button key={id} onClick={() => onOpenResource(entity)}><span><small>{entity.types.map(readableType).join(" · ")}</small><strong>{entity.name}</strong><small>{entity.sources?.[0]?.name ?? "Curated record"} · inspect provenance and licence</small></span><ArrowUpRight size={17} /></button> : null;
      })}</div></div>)}</section>
      <section className="question-gap"><strong>What Glitter cannot answer yet</strong><p>{active.gap}</p></section>
      <p className="question-next"><Search size={16} /> Need a different resource? Use <a href="/">catalogue search</a> to explore the full collection.</p>
    </article>
  </main>;
}
