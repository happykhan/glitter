#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const endpoint = "https://pha4ge.org/wp-json/wp/v2/pages/10874";
const sourceUrl = "https://pha4ge.org/research/guidance-documents-standards/";
const organisationId = "https://pha4ge.org/";
const output = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../data/seed/pha4ge-guidance.json",
);

const response = await fetch(endpoint, {
  headers: { "user-agent": "Glitter resource importer/0.1" },
});
if (!response.ok) throw new Error(`PHA4GE returned HTTP ${response.status}`);

// Some WordPress configurations prepend generated Elementor CSS to REST JSON.
const body = await response.text();
const jsonStart = body.indexOf('{"id":10874');
if (jsonStart < 0) throw new Error("Could not locate the PHA4GE page JSON");
const page = JSON.parse(body.slice(jsonStart));

const decode = (value) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&#038;|&amp;/g, "&")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8212;|&mdash;/g, "—")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const classify = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes("hamronization")) return ["Software", "DataStandard"];
  if (lower.includes("contextual data") || lower.includes("metadata standard")) {
    return ["DataStandard"];
  }
  if (lower.includes("proposed standards")) {
    return ["GuidanceDocument", "DataStandard"];
  }
  return ["GuidanceDocument"];
};

const facets = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes("mpox") || lower.includes("monkeypox")) {
    return [{ scheme: "Glitter target", id: "mpox-virus", label: "Mpox virus" }];
  }
  if (lower.includes("sars-cov-2") || lower.includes("covid-19")) {
    return [{ scheme: "Glitter target", id: "sars-cov-2", label: "SARS-CoV-2" }];
  }
  if (lower.includes("wastewater")) {
    return [{ scheme: "Glitter application", id: "wastewater-surveillance", label: "Wastewater surveillance" }];
  }
  if (lower.includes("amr") || lower.includes("hamronization")) {
    return [{ scheme: "Glitter application", id: "antimicrobial-resistance", label: "Antimicrobial resistance" }];
  }
  return [{ scheme: "Glitter method stage", id: "bioinformatics", label: "Bioinformatics" }];
};

const cards = page.content.rendered
  .split('<div class="premium-blog-post-outer-container"')
  .slice(1)
  .flatMap((chunk) => {
    const heading = chunk.match(/<h3[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/h3>/i);
    const paragraph = chunk.match(/<p class="premium-blog-post-content">([\s\S]*?)<\/p>/i);
    if (!heading) return [];
    return [{ url: heading[1].replace(/&amp;/g, "&"), title: decode(heading[2]), description: paragraph ? decode(paragraph[1]) : undefined }];
  });

const uniqueCards = [...new Map(cards.map((card) => [card.url, card])).values()];
if (uniqueCards.length === 0) throw new Error("No PHA4GE resource cards found");

const retrievedAt = new Date().toISOString().slice(0, 10);
const sourceUpdatedAt = `${page.modified_gmt}Z`;
const sourceRevision = page.modified;
const source = {
  name: "PHA4GE Guidance Documents & Standards",
  sourceUrl,
  sourceRecordId: String(page.id),
  retrievedAt,
  sourceUpdatedAt,
  sourceRevision,
};

const entities = [
  {
    id: organisationId,
    types: ["Organization"],
    name: "Public Health Alliance for Genomic Epidemiology",
    landingPage: organisationId,
  },
  ...uniqueCards.map((card) => ({
    id: card.url,
    types: classify(card.title),
    name: card.title,
    ...(card.description ? { description: card.description } : {}),
    landingPage: card.url,
    ...(card.url === "https://github.com/pha4ge/hAMRonization" ? { license: "https://spdx.org/licenses/LGPL-3.0.html" } : {}),
    facets: facets(card.title),
    sources: [source],
    status: "active",
  })),
];

const relationships = uniqueCards.map((card, index) => ({
  id: `https://w3id.org/glitter/assertion/pha4ge-catalogued-${index + 1}`,
  subject: card.url,
  predicate: "cataloguedBy",
  object: organisationId,
  evidence: [{ source: sourceUrl, locator: card.title }],
  assertedOn: retrievedAt,
  status: "verified",
}));

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(
  output,
  `${JSON.stringify({ standardVersion: "0.1.0", entities, relationships }, null, 2)}\n`,
);
console.log(`Imported ${uniqueCards.length} PHA4GE resources into ${output}`);
