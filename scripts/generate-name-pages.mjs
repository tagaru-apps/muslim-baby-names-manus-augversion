/**
 * Emits static, indexable individual-name documents after Vite builds the React bundle.
 * These pages contain semantic HTML plus the compiled client application for interactive navigation.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist", "public");
const assets = path.join(dist, "assets");
const data = JSON.parse(fs.readFileSync(path.join(root, "data", "muslim_names_source.json"), "utf8"));
const generatedCatalogue = fs.readFileSync(path.join(root, "client", "src", "lib", "names.ts"), "utf8");
const match = generatedCatalogue.match(/export const names: NameRecord\[\] = (\[[\s\S]*\]);\nexport const alphabet/);
if (!match) throw new Error("The generated catalogue could not be read. Run normalise-names.mjs first.");
const names = JSON.parse(match[1]);
const publicDomain = "https://muslim-babynames.com";
const date = new Date().toISOString().slice(0, 10);
const assetFiles = fs.readdirSync(assets);
const css = assetFiles.find((file) => /^index-.*\.css$/.test(file));
const js = assetFiles.find((file) => /^index-.*\.js$/.test(file));
if (!css || !js) throw new Error("Compiled Vite assets could not be located.");

const escape = (value) => String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const jsonEscape = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
const route = (slug) => `/name/${encodeURIComponent(slug)}`;
const write = (file, content) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content, "utf8"); };

const previewRecords = names.map((record) => ({
  slug: record.slug,
  name: record.name,
  arabic: record.arabic,
  phonetic: record.phonetic,
  meaning: record.meaning,
  origin: record.origin,
  gender: record.gender,
  isQuranic: Boolean(record.isQuranic),
}));
write(path.join(root, "dist", "name-preview-records.json"), JSON.stringify(previewRecords));

for (const record of names) {
  const canonical = `${publicDomain}${route(record.slug)}`;
  const title = `${record.name} Name Meaning, Origin & Arabic Spelling | Muslim Baby Names`;
  const description = `${record.name}: ${record.meaning}. Explore its Arabic spelling, heritage, pronunciation, and related names.`.slice(0, 158);
  const previewImage = `${publicDomain}/og/name/${encodeURIComponent(record.slug)}.png`;
  const previewAlt = `${record.name}${record.phonetic ? `, pronounced ${record.phonetic}` : ""}: ${record.meaning}`.slice(0, 420);
  const phoneticProperty = record.phonetic ? [{ "@type": "PropertyValue", name: "Phonetic pronunciation", value: record.phonetic, description: `Deterministic reader-friendly respelling (${record.phoneticConfidence} confidence)` }] : [];
  const originProperty = [{ "@type": "PropertyValue", name: "Linguistic origin", value: record.origin, description: record.originConfidence === "explicit" ? "Stated directly in the source record" : record.originConfidence === "inferred" ? "Inferred from source script or etymological signal" : "Not specified by the source record" }];
  const sourceReference = record.sourceUrl || "Takiuddin Ahmed — Muslim Names Dataset (CC0 1.0)";
  const structuredData = [
    { "@context": "https://schema.org", "@type": "Article", headline: `${record.name} name meaning`, description, mainEntityOfPage: canonical, about: { "@type": "DefinedTerm", name: record.name, description: record.meaning }, additionalProperty: [...phoneticProperty, ...originProperty], isBasedOn: sourceReference },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: publicDomain }, { "@type": "ListItem", position: 2, name: "Names", item: `${publicDomain}/search` }, { "@type": "ListItem", position: 3, name: record.name, item: canonical }] },
  ];
  const phoneticStatic = record.phonetic ? `<div><dt>Pronunciation</dt><dd>${escape(record.phonetic)}<small>Auto-generated reading guide</small></dd></div>` : "";
  const originStatic = `<div><dt>Origin</dt><dd>${escape(record.origin)}<small>${record.originConfidence === "explicit" ? "Source-stated" : record.originConfidence === "inferred" ? "Linguistic inference" : "Not specified by source"}</small></dd></div>`;
  const staticBody = `<main class="static-name-page"><nav aria-label="Breadcrumb"><a href="/">Home</a> <span>/</span> <a href="/search">Names</a> <span>/</span> <span>${escape(record.name)}</span></nav><p class="kicker">${escape(record.gender)} name</p><h1>${escape(record.name)}</h1><p class="arabic" lang="ar" dir="rtl">${escape(record.arabic)}</p><p class="meaning">${escape(record.meaning)}</p><dl><div><dt>Arabic spelling</dt><dd>${escape(record.arabic)}</dd></div>${phoneticStatic}${originStatic}<div><dt>Gender</dt><dd>${escape(record.gender)}</dd></div><div><dt>First letter</dt><dd>${escape(record.letter)}</dd></div></dl><section><h2>About ${escape(record.name)}</h2><p>${escape(record.description)}</p></section></main>`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escape(title)}</title><meta name="description" content="${escape(description)}" /><meta name="robots" content="index,follow" /><link rel="canonical" href="${canonical}" /><meta property="og:type" content="website" /><meta property="og:site_name" content="Muslim Baby Names" /><meta property="og:title" content="${escape(`${record.name} — Muslim Baby Names`)}" /><meta property="og:description" content="${escape(description)}" /><meta property="og:url" content="${canonical}" /><meta property="og:image" content="${previewImage}" /><meta property="og:image:secure_url" content="${previewImage}" /><meta property="og:image:type" content="image/png" /><meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" /><meta property="og:image:alt" content="${escape(previewAlt)}" /><meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${escape(`${record.name} — Muslim Baby Names`)}" /><meta name="twitter:description" content="${escape(description)}" /><meta name="twitter:image" content="${previewImage}" /><meta name="twitter:image:alt" content="${escape(previewAlt)}" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap" rel="stylesheet" /><link rel="stylesheet" href="/assets/${css}" /><script type="application/ld+json">${jsonEscape(structuredData)}</script><style>.static-name-page{max-width:70rem;margin:0 auto;padding:3rem 1.5rem;color:#153d2f;background:#faf7f0;font-family:'DM Sans',sans-serif}.static-name-page nav{font-size:.82rem;color:#547063}.static-name-page nav span{margin:0 .4rem}.static-name-page a{color:#0b6e4f}.static-name-page .kicker{margin-top:3rem;font-size:.7rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#a57f1f}.static-name-page h1,.static-name-page h2{font-family:Fraunces,Georgia,serif;letter-spacing:-.05em}.static-name-page h1{font-size:clamp(3.5rem,10vw,7rem);line-height:.9;margin:1rem 0}.static-name-page h2{font-size:2rem}.static-name-page .arabic{font-family:Amiri,serif;font-size:2.5rem;color:#0b6e4f}.static-name-page .meaning{font-family:Fraunces,Georgia,serif;font-size:1.7rem;max-width:42rem}.static-name-page dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));margin:3rem 0;border:1px solid rgba(21,61,47,.16)}.static-name-page dl div{padding:1rem;border:1px solid rgba(21,61,47,.1)}.static-name-page dt{font-size:.7rem;text-transform:uppercase;letter-spacing:.12em;color:#547063}.static-name-page dd{margin:.4rem 0 0;font-family:Fraunces,Georgia,serif;font-size:1.25rem}.static-name-page dd small{display:block;margin-top:.35rem;font-family:'DM Sans',sans-serif;font-size:.68rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#a57f1f}.static-name-page section{max-width:45rem;line-height:1.8}.static-name-page .source-note{margin-top:3rem;padding-top:1rem;border-top:1px solid #c9a227;color:#547063;font-size:.9rem}</style></head><body><div id="root">${staticBody}</div><script type="module" src="/assets/${js}"></script></body></html>`;
  write(path.join(dist, "name", record.slug, "index.html"), html);
}

const pinterestImportPages = [
  { asset: "meaning", title: "Muslim Baby Names by Meaning", description: "Explore Muslim baby names through meaning, Arabic spellings, and gentle pronunciation guides." },
  { asset: "girl-names", title: "Muslim Baby Girl Names With Meaning", description: "Discover Muslim girl names through meaning, heritage, Arabic spelling, and pronunciation guidance." },
  { asset: "boy-names", title: "Muslim Baby Boy Names With Meaning", description: "Browse Muslim boy names by meaning, first letter, and heritage." },
  { asset: "quranic-names", title: "Quranic Baby Names With Meaning", description: "Explore names with a Quranic connection alongside Arabic spellings, meanings, and pronunciation guidance." },
  { asset: "unique-names", title: "Unique Muslim Baby Names With Meaning", description: "Explore distinctive Muslim baby-name choices with depth, heritage, and meaning." },
];
for (const page of pinterestImportPages) {
  const canonical = `${publicDomain}/pinterest/pin/${page.asset}`;
  const image = `${publicDomain}/pinterest-assets/${page.asset}.png`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(page.title)} | Muslim Baby Names</title><meta name="description" content="${escape(page.description)}"><meta name="robots" content="index,follow"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:image" content="${image}"><meta property="og:image:secure_url" content="${image}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1000"><meta property="og:image:height" content="1500"><meta property="og:url" content="${canonical}"></head><body><main><h1>${escape(page.title)}</h1><p>${escape(page.description)}</p><img src="${image}" width="1000" height="1500" alt="${escape(page.title)} Pinterest creative"></main></body></html>`;
  write(path.join(dist, "pinterest", "pin", page.asset, "index.html"), html);
}

const categoryRoutes = ["/", "/boy-names", "/girl-names", "/quranic-names", "/unique-muslim-names", "/search", "/about", "/sources", "/favorites", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").flatMap((letter) => [`/boy-names/${letter.toLowerCase()}`, `/girl-names/${letter.toLowerCase()}`])];
const urlset = (entries) => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map((entry) => `  <url><loc>${publicDomain}${entry}</loc><lastmod>${date}</lastmod></url>`).join("\n")}\n</urlset>\n`;
write(path.join(dist, "sitemap-names.xml"), urlset(names.map((record) => route(record.slug))));
write(path.join(dist, "sitemap-categories.xml"), urlset(categoryRoutes));
write(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${publicDomain}/sitemap-names.xml</loc></sitemap>\n  <sitemap><loc>${publicDomain}/sitemap-categories.xml</loc></sitemap>\n</sitemapindex>\n`);
write(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /search\nDisallow: /admin\n\nSitemap: ${publicDomain}/sitemap.xml\n`);
console.log(`Generated ${names.length.toLocaleString()} indexable individual-name pages and XML sitemap files from ${data.length.toLocaleString()} source rows.`);
