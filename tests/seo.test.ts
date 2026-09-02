import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  absoluteSeoUrl,
  buildStructuredData,
  SEO_ROUTES,
} from '../seo.config';

const read = (file: string) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');

test('SEO routes have unique crawlable URLs and useful localized metadata', () => {
  const paths = SEO_ROUTES.map((route) => route.path);
  assert.equal(new Set(paths).size, paths.length);
  assert.ok(paths.every((path) => path === '/' || /^\/[a-z0-9/-]+$/.test(path)));

  for (const language of ['ar', 'en'] as const) {
    const titles = SEO_ROUTES.map((route) => route[language].title);
    const descriptions = SEO_ROUTES.map((route) => route[language].description);
    assert.equal(new Set(titles).size, titles.length, `${language} titles must be unique`);
    assert.equal(new Set(descriptions).size, descriptions.length, `${language} descriptions must be unique`);
    assert.ok(titles.every((title) => title.length >= 20 && title.length <= 70));
    assert.ok(descriptions.every((description) => description.length >= 70 && description.length <= 180));
  }
});

test('localized URLs, canonical URLs and structured data stay on the official origin', () => {
  for (const route of SEO_ROUTES) {
    assert.equal(absoluteSeoUrl(route.path, 'ar').startsWith('https://www.kairo-ai.tech/'), true);
    assert.match(absoluteSeoUrl(route.path, 'en'), /^https:\/\/www\.kairo-ai\.tech\/en(?:\/|$)/);

    for (const language of ['ar', 'en'] as const) {
      const schema = buildStructuredData(route, language);
      assert.equal(schema['@context'], 'https://schema.org');
      assert.ok(Array.isArray(schema['@graph']));
      const serialized = JSON.stringify(schema);
      assert.match(serialized, /Organization/);
      assert.match(serialized, /WebSite/);
      assert.match(serialized, /WebApplication/);
      assert.match(serialized, /WebPage/);
      assert.match(serialized, /BreadcrumbList/);
    }
  }
});

test('the app uses History routing and manages metadata without raw HTML injection', async () => {
  const [app, entry, manager] = await Promise.all([
    read('App.tsx'),
    read('index.tsx'),
    read('components/SeoManager.tsx'),
  ]);
  assert.match(app, /BrowserRouter as Router/);
  assert.doesNotMatch(app, /HashRouter/);
  assert.match(entry, /legacyRoute/);
  assert.match(manager, /canonical/);
  assert.match(manager, /hreflang/);
  assert.match(manager, /application\/ld\+json/);
  assert.doesNotMatch(manager, /dangerouslySetInnerHTML/);
});

test('the production build generates indexable HTML, sitemap, robots and a noindex 404', async () => {
  const [html, generator, manifest, vercel] = await Promise.all([
    read('index.html'),
    read('scripts/generateSeoAssets.ts'),
    read('public/site.webmanifest'),
    read('vercel.json'),
  ]);
  assert.match(html, /KAIRO_SEO_START/);
  assert.match(html, /rel="canonical"/);
  assert.match(html, /hreflang="x-default"/);
  assert.match(html, /twitter:card/);
  assert.match(generator, /sitemap\.xml/);
  assert.match(generator, /robots\.txt/);
  assert.match(generator, /noindex, nofollow/);
  assert.equal(JSON.parse(manifest).start_url, '/');
  assert.equal(JSON.parse(vercel).cleanUrls, true);
});
