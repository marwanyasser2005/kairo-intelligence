import React from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import {
  absoluteSeoUrl,
  buildStructuredData,
  getSeoRoute,
  KAIRO_SITE_URL,
  KAIRO_SOCIAL_IMAGE,
  type SeoLanguage,
} from '../seo.config';

const upsertMeta = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.dataset.kairoSeoRuntime = 'true';
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value));
};

const upsertLink = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement('link');
    element.dataset.kairoSeoRuntime = 'true';
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value));
};

const SeoManager: React.FC = () => {
  const location = useLocation();
  const { language } = useApp();

  React.useEffect(() => {
    const route = getSeoRoute(location.pathname);
    const seoLanguage = language as SeoLanguage;
    const fallbackTitle = seoLanguage === 'ar' ? 'الصفحة غير موجودة | Kairo AI' : 'Page not found | Kairo AI';
    const fallbackDescription = seoLanguage === 'ar'
      ? 'الصفحة المطلوبة غير موجودة على منصة Kairo AI.'
      : 'The requested page could not be found on Kairo AI.';
    const copy = route?.[seoLanguage] ?? { title: fallbackTitle, description: fallbackDescription };
    const canonical = route ? absoluteSeoUrl(route.path, seoLanguage) : `${KAIRO_SITE_URL}${location.pathname}`;
    const robots = route
      ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      : 'noindex, nofollow';

    document.title = copy.title;
    upsertMeta('meta[name="description"]', { name: 'description', content: copy.description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: robots });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'Kairo AI' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: copy.title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: copy.description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: seoLanguage === 'ar' ? 'ar_EG' : 'en_US' });
    upsertMeta('meta[property="og:locale:alternate"]', { property: 'og:locale:alternate', content: seoLanguage === 'ar' ? 'en_US' : 'ar_EG' });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: KAIRO_SOCIAL_IMAGE });
    upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: seoLanguage === 'ar' ? 'شعار منصة Kairo AI للذكاء البيئي' : 'Kairo AI environmental intelligence logo' });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: copy.title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: copy.description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: KAIRO_SOCIAL_IMAGE });
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonical });

    if (route) {
      upsertLink('link[rel="alternate"][hreflang="ar"]', { rel: 'alternate', hreflang: 'ar', href: absoluteSeoUrl(route.path, 'ar') });
      upsertLink('link[rel="alternate"][hreflang="en"]', { rel: 'alternate', hreflang: 'en', href: absoluteSeoUrl(route.path, 'en') });
      upsertLink('link[rel="alternate"][hreflang="x-default"]', { rel: 'alternate', hreflang: 'x-default', href: absoluteSeoUrl(route.path, 'ar') });
    }

    let structuredData = document.head.querySelector<HTMLScriptElement>('#kairo-structured-data');
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.id = 'kairo-structured-data';
      structuredData.type = 'application/ld+json';
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = route ? JSON.stringify(buildStructuredData(route, seoLanguage)) : '';
  }, [language, location.pathname]);

  return null;
};

export default SeoManager;
