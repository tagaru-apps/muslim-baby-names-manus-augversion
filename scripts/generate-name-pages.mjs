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

for (const record of names) {
  const canonical = `${publicDomain}${route(record.slug)}`;
  const title = `${record.name} Name Meaning, Origin & Arabic Spelling | Muslim Baby Names`;
  const description = `${record.name}: ${record.meaning}. Explore the Arabic spelling, gender, related names, and source notes.`.slice(0, 158);
  const structuredData = [
    { "@context": "https://schema.org", "@type": "Article", headline: `${record.name} name meaning`, description, mainEntityOfPage: canonical, about: { "@type": "DefinedTerm", name: record.name, description: record.meaning }, isBasedOn: "Takiuddin Ahmed — Muslim Names Dataset (CC0 1.0)" },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: publicDomain }, { "@type": "ListItem", position: 2, name: "Names", item: `${publicDomain}/search` }, { "@type": "ListItem", position: 3, name: record.name, item: canonical }] },
  ];
  const staticBody = `<main class="static-name-page"><nav aria-label="Breadcrumb"><a href="/">Home</a> <span>/</span> <a href="/search">Names</a> <span>/</span> <span>${escape(record.name)}</span></nav><p class="kicker">${escape(record.gender)} name · Source-indexed record</p><h1>${escape(record.name)}</h1><p class="arabic" lang="ar" dir="rtl">${escape(record.arabic)}</p><p class="meaning">${escape(record.meaning)}</p><dl><div><dt>Arabic spelling</dt><dd>${escape(record.arabic)}</dd></div><div><dt>Gender</dt><dd>${escape(record.gender)}</dd></div><div><dt>First letter</dt><dd>${escape(record.letter)}</dd></div><div><dt>Source</dt><dd>Muslim Names Dataset (CC0 1.0)</dd></div></dl><section><h2>About ${escape(record.name)}</h2><p>${escape(record.description)}</p></section><p class="source-note">Meaning and Arabic spelling are sourced from the Muslim Names Dataset. See <a href="/sources">Sources &amp; methodology</a> for data limitations.</p></main>`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escape(title)}</title><meta name="description" content="${escape(description)}" /><meta name="robots" content="index,follow" /><link rel="canonical" href="${canonical}" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap" rel="stylesheet" /><link rel="stylesheet" href="/assets/${css}" /><script type="application/ld+json">${jsonEscape(structuredData)}</script><style>.static-name-page{max-width:70rem;margin:0 auto;padding:3rem 1.5rem;color:#153d2f;background:#faf7f0;font-family:'DM Sans',sans-serif}.static-name-page nav{font-size:.82rem;color:#547063}.static-name-page nav span{margin:0 .4rem}.static-name-page a{color:#0b6e4f}.static-name-page .kicker{margin-top:3rem;font-size:.7rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#a57f1f}.static-name-page h1,.static-name-page h2{font-family:Fraunces,Georgia,serif;letter-spacing:-.05em}.static-name-page h1{font-size:clamp(3.5rem,10vw,7rem);line-height:.9;margin:1rem 0}.static-name-page h2{font-size:2rem}.static-name-page .arabic{font-family:Amiri,serif;font-size:2.5rem;color:#0b6e4f}.static-name-page .meaning{font-family:Fraunces,Georgia,serif;font-size:1.7rem;max-width:42rem}.static-name-page dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));margin:3rem 0;border:1px solid rgba(21,61,47,.16)}.static-name-page dl div{padding:1rem;border:1px solid rgba(21,61,47,.1)}.static-name-page dt{font-size:.7rem;text-transform:uppercase;letter-spacing:.12em;color:#547063}.static-name-page dd{margin:.4rem 0 0;font-family:Fraunces,Georgia,serif;font-size:1.25rem}.static-name-page section{max-width:45rem;line-height:1.8}.static-name-page .source-note{margin-top:3rem;padding-top:1rem;border-top:1px solid #c9a227;color:#547063;font-size:.9rem}</style></head><body><div id="root">${staticBody}</div><script type="module" src="/assets/${js}"></script></body></html>`;
  write(path.join(dist, "name", record.slug, "index.html"), html);
}

const categoryRoutes = ["/", "/boy-names", "/girl-names", "/quranic-names", "/unique-muslim-names", "/search", "/about", "/sources", "/favorites", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").flatMap((letter) => [`/boy-names/${letter.toLowerCase()}`, `/girl-names/${letter.toLowerCase()}`])];
const urlset = (entries) => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map((entry) => `  <url><loc>${publicDomain}${entry}</loc><lastmod>${date}</lastmod></url>`).join("\n")}\n</urlset>\n`;
write(path.join(dist, "sitemap-names.xml"), urlset(names.map((record) => route(record.slug))));
write(path.join(dist, "sitemap-categories.xml"), urlset(categoryRoutes));
write(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${publicDomain}/sitemap-names.xml</loc></sitemap>\n  <sitemap><loc>${publicDomain}/sitemap-categories.xml</loc></sitemap>\n</sitemapindex>\n`);
write(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /search\nDisallow: /admin\n\nSitemap: ${publicDomain}/sitemap.xml\n`);
console.log(`Generated ${names.length.toLocaleString()} indexable individual-name pages and XML sitemap files from ${data.length.toLocaleString()} source rows.`);
