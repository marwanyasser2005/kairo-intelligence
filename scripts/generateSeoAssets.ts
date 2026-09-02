import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  absoluteSeoUrl,
  buildStructuredData,
  KAIRO_SITE_URL,
  KAIRO_SOCIAL_IMAGE,
  SEO_ROUTES,
  type SeoLanguage,
  type SeoRoute,
} from '../seo.config';

const projectRoot = path.resolve(import.meta.dirname, '..');
const distDirectory = path.join(projectRoot, 'dist');
const templatePath = path.join(distDirectory, 'index.html');
const template = await readFile(templatePath, 'utf8');

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const safeJson = (value: unknown) => JSON.stringify(value).replaceAll('<', '\\u003c');

const seoMarkup = (route: SeoRoute, language: SeoLanguage) => {
  const copy = route[language];
  const canonical = absoluteSeoUrl(route.path, language);
  const isArabic = language === 'ar';
  const imageAlt = isArabic
    ? 'شعار منصة Kairo AI للذكاء البيئي'
    : 'Kairo AI environmental intelligence logo';

  return `<!-- KAIRO_SEO_START -->
    <title>${escapeHtml(copy.title)}</title>
    <meta name="description" content="${escapeHtml(copy.description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${canonical}" />
    <link rel="alternate" hreflang="ar" href="${absoluteSeoUrl(route.path, 'ar')}" />
    <link rel="alternate" hreflang="en" href="${absoluteSeoUrl(route.path, 'en')}" />
    <link rel="alternate" hreflang="x-default" href="${absoluteSeoUrl(route.path, 'ar')}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Kairo AI" />
    <meta property="og:title" content="${escapeHtml(copy.title)}" />
    <meta property="og:description" content="${escapeHtml(copy.description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:locale" content="${isArabic ? 'ar_EG' : 'en_US'}" />
    <meta property="og:locale:alternate" content="${isArabic ? 'en_US' : 'ar_EG'}" />
    <meta property="og:image" content="${KAIRO_SOCIAL_IMAGE}" />
    <meta property="og:image:secure_url" content="${KAIRO_SOCIAL_IMAGE}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="822" />
    <meta property="og:image:height" content="938" />
    <meta property="og:image:alt" content="${imageAlt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(copy.title)}" />
    <meta name="twitter:description" content="${escapeHtml(copy.description)}" />
    <meta name="twitter:image" content="${KAIRO_SOCIAL_IMAGE}" />
    <script id="kairo-structured-data" type="application/ld+json">${safeJson(buildStructuredData(route, language))}</script>
    <!-- KAIRO_SEO_END -->`;
};

const staticMarkup = (route: SeoRoute, language: SeoLanguage) => {
  const copy = route[language];
  const isArabic = language === 'ar';
  const title = copy.title.replace(/\s*\|\s*Kairo AI$/i, '');
  const links = isArabic
    ? [
        ['/dashboard', 'لوحة الذكاء البيئي'],
        ['/systems/water-scarcity', 'تحليل المياه'],
        ['/energy', 'كفاءة الطاقة'],
        ['/transport', 'تحليل التنقل'],
        ['/about', 'عن Kairo AI'],
      ]
    : [
        ['/en/dashboard', 'Intelligence dashboard'],
        ['/en/systems/water-scarcity', 'Water intelligence'],
        ['/en/energy', 'Energy efficiency'],
        ['/en/transport', 'Mobility analysis'],
        ['/en/about', 'About Kairo AI'],
      ];
  const navigation = links
    .map(([href, label]) => `<a href="${href}">${label}</a>`)
    .join('\n          ');

  return `<!-- KAIRO_STATIC_START -->
      <main class="kairo-static-shell">
        <img src="/branding/kairo-logo-transparent.svg" width="96" height="110" alt="Kairo AI" />
        <p class="kairo-static-kicker">KAIRO INTELLIGENCE</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(copy.description)}</p>
        <nav aria-label="${isArabic ? 'الصفحات الرئيسية' : 'Primary pages'}">
          ${navigation}
        </nav>
      </main>
      <!-- KAIRO_STATIC_END -->`;
};

const renderHtml = (route: SeoRoute, language: SeoLanguage) => {
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const languageCode = language === 'ar' ? 'ar' : 'en';
  const withLanguage = template.replace(
    /<html\s+lang="[^"]+"\s+dir="[^"]+">/,
    `<html lang="${languageCode}" dir="${direction}">`,
  );
  const withSeo = withLanguage.replace(
    /<!-- KAIRO_SEO_START -->[\s\S]*?<!-- KAIRO_SEO_END -->/,
    seoMarkup(route, language),
  );
  if (withSeo === withLanguage) {
    throw new Error('SEO markers were not preserved in the Vite HTML output.');
  }
  const rendered = withSeo.replace(
    /<!-- KAIRO_STATIC_START -->[\s\S]*?<!-- KAIRO_STATIC_END -->/,
    staticMarkup(route, language),
  );
  if (rendered === withSeo) {
    throw new Error('Static content markers were not preserved in the Vite HTML output.');
  }
  return rendered;
};

const outputPathFor = (route: SeoRoute, language: SeoLanguage) => {
  if (route.path === '/' && language === 'ar') return templatePath;
  if (route.path === '/' && language === 'en') return path.join(distDirectory, 'en.html');
  const relative = route.path.replace(/^\//, '');
  return path.join(distDirectory, language === 'en' ? 'en' : '', `${relative}.html`);
};

for (const route of SEO_ROUTES) {
  for (const language of ['ar', 'en'] as const) {
    const outputPath = outputPathFor(route, language);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, renderHtml(route, language), 'utf8');
  }
}

const notFoundHtml = template
  .replace(
    /<!-- KAIRO_SEO_START -->[\s\S]*?<!-- KAIRO_SEO_END -->/,
    `<!-- KAIRO_SEO_START -->
    <title>Page not found | Kairo AI</title>
    <meta name="description" content="The requested page could not be found on Kairo AI." />
    <meta name="robots" content="noindex, nofollow" />
    <!-- KAIRO_SEO_END -->`,
  )
  .replace(
    /<!-- KAIRO_STATIC_START -->[\s\S]*?<!-- KAIRO_STATIC_END -->/,
    `<!-- KAIRO_STATIC_START -->
      <main class="kairo-static-shell">
        <p class="kairo-static-kicker">404</p>
        <h1>Page not found</h1>
        <p>The requested page could not be found on Kairo AI.</p>
        <nav aria-label="Primary pages"><a href="/">Return home</a></nav>
      </main>
      <!-- KAIRO_STATIC_END -->`,
  );
await writeFile(path.join(distDirectory, '404.html'), notFoundHtml, 'utf8');

const lastModified = new Date().toISOString().slice(0, 10);
const sitemapEntries = SEO_ROUTES.map((route) => {
  const arabicUrl = absoluteSeoUrl(route.path, 'ar');
  const englishUrl = absoluteSeoUrl(route.path, 'en');
  return [
    { location: arabicUrl, language: 'ar', alternate: englishUrl },
    { location: englishUrl, language: 'en', alternate: arabicUrl },
  ].map(({ location, language, alternate }) => `  <url>
    <loc>${location}</loc>
    <xhtml:link rel="alternate" hreflang="${language}" href="${location}" />
    <xhtml:link rel="alternate" hreflang="${language === 'ar' ? 'en' : 'ar'}" href="${alternate}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${arabicUrl}" />
    <lastmod>${lastModified}</lastmod>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`).join('\n');
}).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntries}
</urlset>
`;
await writeFile(path.join(distDirectory, 'sitemap.xml'), sitemap, 'utf8');

const robots = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${KAIRO_SITE_URL}/sitemap.xml
`;
await writeFile(path.join(distDirectory, 'robots.txt'), robots, 'utf8');

console.log(`Generated SEO HTML for ${SEO_ROUTES.length * 2} localized URLs.`);
