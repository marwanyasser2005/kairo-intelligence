import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  absoluteSeoUrl,
  SEO_ROUTES,
  type SeoLanguage,
  type SeoRoute,
} from '../seo.config';

const projectRoot = path.resolve(import.meta.dirname, '..');
const distDirectory = path.join(projectRoot, 'dist');

const outputPathFor = (route: SeoRoute, language: SeoLanguage) => {
  if (route.path === '/' && language === 'ar') return path.join(distDirectory, 'index.html');
  if (route.path === '/' && language === 'en') return path.join(distDirectory, 'en.html');
  const relative = route.path.replace(/^\//, '');
  return path.join(distDirectory, language === 'en' ? 'en' : '', `${relative}.html`);
};

const tagContent = (html: string, expression: RegExp, label: string) => {
  const value = html.match(expression)?.[1];
  assert.ok(value, `Missing ${label}`);
  return value;
};

const seenTitles = new Set<string>();
const seenDescriptions = new Set<string>();

for (const route of SEO_ROUTES) {
  for (const language of ['ar', 'en'] as const) {
    const filePath = outputPathFor(route, language);
    const html = await readFile(filePath, 'utf8');
    const copy = route[language];
    const canonical = absoluteSeoUrl(route.path, language);
    const title = tagContent(html, /<title>([^<]+)<\/title>/, `${filePath} title`);
    const description = tagContent(
      html,
      /<meta name="description" content="([^"]+)"\s*\/>/,
      `${filePath} description`,
    );
    const structuredData = tagContent(
      html,
      /<script id="kairo-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/,
      `${filePath} structured data`,
    );

    assert.equal(title, copy.title);
    assert.equal(description, copy.description);
    assert.match(html, new RegExp(`<link rel="canonical" href="${canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
    assert.match(html, /<meta name="robots" content="index, follow,/);
    assert.match(html, /<meta property="og:title"/);
    assert.match(html, /<meta name="twitter:card" content="summary_large_image"/);
    assert.match(html, new RegExp(`<html lang="${language}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">`));
    assert.match(html, /<main class="kairo-static-shell">/);
    assert.match(html, /<h1>[^<]+<\/h1>/);
    assert.match(html, /<nav aria-label=/);
    assert.match(html, /<a href="\//);
    assert.doesNotMatch(html, /href="[^"]*#\//);
    assert.doesNotThrow(() => JSON.parse(structuredData));
    assert.equal(seenTitles.has(title), false, `Duplicate title: ${title}`);
    assert.equal(seenDescriptions.has(description), false, `Duplicate description: ${description}`);
    seenTitles.add(title);
    seenDescriptions.add(description);
  }
}

const sitemap = await readFile(path.join(distDirectory, 'sitemap.xml'), 'utf8');
const sitemapUrlCount = (sitemap.match(/<url>/g) ?? []).length;
assert.equal(sitemapUrlCount, SEO_ROUTES.length * 2);
for (const route of SEO_ROUTES) {
  assert.match(sitemap, new RegExp(`<loc>${absoluteSeoUrl(route.path, 'ar').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>`));
  assert.match(sitemap, new RegExp(`<loc>${absoluteSeoUrl(route.path, 'en').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>`));
}

const robots = await readFile(path.join(distDirectory, 'robots.txt'), 'utf8');
assert.match(robots, /User-agent: \*/);
assert.match(robots, /Disallow: \/api\//);
assert.match(robots, /Sitemap: https:\/\/www\.kairo-ai\.tech\/sitemap\.xml/);

const notFound = await readFile(path.join(distDirectory, '404.html'), 'utf8');
assert.match(notFound, /<meta name="robots" content="noindex, nofollow"/);

console.log(JSON.stringify({
  ok: true,
  localizedPages: SEO_ROUTES.length * 2,
  uniqueTitles: seenTitles.size,
  uniqueDescriptions: seenDescriptions.size,
  sitemapUrls: sitemapUrlCount,
  structuredData: 'valid-json',
  legacyFragmentLinks: 0,
}, null, 2));
