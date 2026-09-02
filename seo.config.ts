export const KAIRO_SITE_URL = 'https://www.kairo-ai.tech';
export const KAIRO_SOCIAL_IMAGE = `${KAIRO_SITE_URL}/branding/kairo-logo-2026.png`;

export type SeoLanguage = 'ar' | 'en';

export interface LocalizedSeoCopy {
  title: string;
  description: string;
}

export interface SeoRoute {
  path: string;
  changeFrequency: 'weekly' | 'monthly' | 'yearly';
  priority: number;
  ar: LocalizedSeoCopy;
  en: LocalizedSeoCopy;
}

export const SEO_ROUTES: SeoRoute[] = [
  {
    path: '/', changeFrequency: 'weekly', priority: 1,
    ar: { title: 'Kairo AI | منصة الذكاء البيئي القابل للتفسير', description: 'حوّل بيانات المياه والطاقة والغذاء والتنقل وجودة الهواء والنفايات الإلكترونية إلى قرارات بيئية قابلة للقياس والتنفيذ مع Kairo AI.' },
    en: { title: 'Kairo AI | Explainable Environmental Intelligence', description: 'Turn water, energy, food, mobility, air-quality and e-waste data into measurable, explainable environmental decisions with Kairo AI.' },
  },
  {
    path: '/dashboard', changeFrequency: 'weekly', priority: 0.9,
    ar: { title: 'لوحة الذكاء البيئي | Kairo AI', description: 'تابع مؤشرات الاستدامة والنتائج والتوصيات القابلة للتنفيذ عبر لوحة موحدة للمياه والطاقة والغذاء والتنقل وجودة الهواء.' },
    en: { title: 'Environmental Intelligence Dashboard | Kairo AI', description: 'Track sustainability scores, evidence and actionable recommendations across water, energy, food, mobility and air quality in one dashboard.' },
  },
  {
    path: '/proof', changeFrequency: 'weekly', priority: 0.9,
    ar: { title: 'إثبات الأثر والوفر البيئي | Kairo AI', description: 'وثّق الإجراء وقارن خط الأساس بالمتابعة واحسب الوفر المالي والبيئي مع بصمة دليل ومراجعة ذكية قابلة للتكرار.' },
    en: { title: 'Environmental Impact and Savings Proof | Kairo AI', description: 'Document an action, compare baseline and follow-up periods, calculate financial and environmental savings, and create a repeatable evidence pack.' },
  },
  {
    path: '/systems/water-scarcity', changeFrequency: 'weekly', priority: 0.9,
    ar: { title: 'تحليل ندرة المياه والتسرب | Kairo AI', description: 'قيّم كفاءة استهلاك المياه ومخاطر التسرب وقارن الأداء بالمؤشرات المرجعية للحصول على إجراءات توفير دقيقة وقابلة للتنفيذ.' },
    en: { title: 'Water Scarcity and Leak Intelligence | Kairo AI', description: 'Assess water efficiency and leak risk, compare performance with benchmarks, and receive precise, actionable water-saving recommendations.' },
  },
  {
    path: '/systems/food-security', changeFrequency: 'weekly', priority: 0.9,
    ar: { title: 'تحليل هدر الغذاء والأمن الغذائي | Kairo AI', description: 'قِس هدر الطعام وتكلفته وأثره، وحدد نقاط الفقد داخل المنزل أو المؤسسة بخطة تحسين مستندة إلى بيانات قابلة للقياس.' },
    en: { title: 'Food Waste and Food Security Intelligence | Kairo AI', description: 'Measure food waste, cost and impact, identify loss points at home or work, and build a data-led improvement plan.' },
  },
  {
    path: '/energy', changeFrequency: 'weekly', priority: 0.9,
    ar: { title: 'تحليل كفاءة الطاقة والانبعاثات | Kairo AI', description: 'حلّل استهلاك الكهرباء والتكلفة والبصمة الكربونية، واكتشف فرص التوفير ذات الأولوية عبر توصيات ذكية قابلة للتنفيذ.' },
    en: { title: 'Energy Efficiency and Emissions Intelligence | Kairo AI', description: 'Analyse electricity use, cost and carbon impact, then prioritise high-value efficiency actions with explainable AI recommendations.' },
  },
  {
    path: '/transport', changeFrequency: 'weekly', priority: 0.9,
    ar: { title: 'تحليل التنقل والبصمة الكربونية | Kairo AI', description: 'احسب تكلفة التنقل والوقت والانبعاثات، وقارن بدائل الرحلات للحصول على مسار أكثر كفاءة واستدامة يناسب احتياجاتك.' },
    en: { title: 'Mobility and Transport Impact Intelligence | Kairo AI', description: 'Calculate travel cost, time and emissions, compare mobility alternatives, and choose a more efficient and sustainable route.' },
  },
  {
    path: '/systems/urban-exposure', changeFrequency: 'weekly', priority: 0.85,
    ar: { title: 'تحليل التعرض الحضري وجودة الهواء | Kairo AI', description: 'قدّر التعرض لتلوث الهواء وفق الموقع والوقت وطريقة التنقل، واحصل على إرشادات عملية لتقليل المخاطر اليومية.' },
    en: { title: 'Urban Exposure and Air Quality Analysis | Kairo AI', description: 'Estimate air-pollution exposure by location, time and travel mode, with practical guidance to reduce daily health risk.' },
  },
  {
    path: '/systems/ewaste', changeFrequency: 'weekly', priority: 0.85,
    ar: { title: 'تحليل وإعادة تدوير النفايات الإلكترونية | Kairo AI', description: 'قيّم الأجهزة الإلكترونية وحدد خيارات الإصلاح وإعادة الاستخدام والتدوير لزيادة القيمة وتقليل الأثر البيئي بأمان.' },
    en: { title: 'E-waste Recycling and Circularity Intelligence | Kairo AI', description: 'Assess electronics and identify repair, reuse and recycling options to recover value and reduce environmental impact safely.' },
  },
  {
    path: '/monitor', changeFrequency: 'weekly', priority: 0.85,
    ar: { title: 'Kairo Signals | الرصد والاستباق البيئي', description: 'راقب إشارات جودة الهواء والطاقة والمياه والغذاء، واكتشف التغيرات والمخاطر مبكراً عبر مؤشرات بيئية قابلة للتفسير.' },
    en: { title: 'Kairo Signals | Environmental Foresight Monitor', description: 'Monitor air, energy, water and food signals, detect changes early, and understand environmental risk through explainable indicators.' },
  },
  {
    path: '/scenarios', changeFrequency: 'monthly', priority: 0.8,
    ar: { title: 'محاكي سيناريوهات الاستدامة | Kairo AI', description: 'قارن سيناريوهات خفض المياه والطاقة والانبعاثات قبل التنفيذ، وافهم الأثر المالي والبيئي المتوقع لكل قرار.' },
    en: { title: 'Sustainability Scenario Simulator | Kairo AI', description: 'Compare water, energy and emissions reduction scenarios before acting, with clear financial and environmental impact estimates.' },
  },
  {
    path: '/action', changeFrequency: 'monthly', priority: 0.8,
    ar: { title: 'خطة العمل البيئية الذكية | Kairo AI', description: 'حوّل نتائج تحليلك إلى خارطة طريق مرتبة بالأولوية مع خطوات عملية ومؤشرات متابعة لتحسين الأداء البيئي.' },
    en: { title: 'Smart Environmental Action Plan | Kairo AI', description: 'Turn analysis results into a prioritised roadmap with practical actions and progress indicators for better environmental performance.' },
  },
  {
    path: '/impact', changeFrequency: 'monthly', priority: 0.75,
    ar: { title: 'منهجية قياس الأثر البيئي | Kairo AI', description: 'تعرّف على منهجية Kairo لربط البيانات بالأدلة وحساب الأثر وبناء توصيات بيئية قابلة للتفسير والتحقق.' },
    en: { title: 'Environmental Impact Methodology | Kairo AI', description: 'Explore how Kairo connects data, evidence and impact calculations to produce explainable, verifiable environmental recommendations.' },
  },
  {
    path: '/learn', changeFrequency: 'monthly', priority: 0.7,
    ar: { title: 'تعلّم الاستدامة والذكاء البيئي | Kairo AI', description: 'أدلة مبسطة لفهم المياه والغذاء والطاقة والكربون والاستدامة وتحويل المعرفة إلى قرارات يومية أفضل.' },
    en: { title: 'Learn Sustainability and Environmental Intelligence | Kairo AI', description: 'Clear guides to water, food, energy, carbon and sustainability that help turn environmental knowledge into better daily decisions.' },
  },
  {
    path: '/about', changeFrequency: 'monthly', priority: 0.7,
    ar: { title: 'عن Kairo AI | ذكاء بيئي للقرارات المؤثرة', description: 'تعرّف على رؤية Kairo AI لبناء قرارات بيئية مفهومة وقابلة للقياس للأفراد والمؤسسات والمجتمعات والمدن.' },
    en: { title: 'About Kairo AI | Intelligence for Environmental Decisions', description: 'Discover Kairo AI’s vision for measurable, understandable environmental decisions for people, organisations, communities and cities.' },
  },
  {
    path: '/csr', changeFrequency: 'monthly', priority: 0.7,
    ar: { title: 'لوحة الاستدامة والمسؤولية المؤسسية | Kairo AI', description: 'اعرض مؤشرات الانبعاثات والأهداف والثقة في الأدلة لمساعدة المؤسسات على متابعة الأداء وتجنب الادعاءات البيئية غير الموثقة.' },
    en: { title: 'CSR and Sustainability Dashboard | Kairo AI', description: 'Track emissions, targets and evidence confidence to support credible corporate sustainability reporting and reduce greenwashing risk.' },
  },
  {
    path: '/exposure', changeFrequency: 'monthly', priority: 0.65,
    ar: { title: 'تقرير التعرض البيئي | Kairo AI', description: 'افهم مستوى التعرض البيئي وعوامل الخطر والتوصيات الوقائية من خلال تقرير مبسط ومدعوم بالمؤشرات.' },
    en: { title: 'Environmental Exposure Report | Kairo AI', description: 'Understand environmental exposure, risk factors and preventive recommendations through a clear, indicator-led report.' },
  },
  {
    path: '/water', changeFrequency: 'monthly', priority: 0.6,
    ar: { title: 'دليل المياه والاستدامة | Kairo AI', description: 'تعلّم أساسيات استهلاك المياه والكفاءة وتقليل الفاقد، ثم انتقل إلى التحليل العملي باستخدام أدوات Kairo AI.' },
    en: { title: 'Water and Sustainability Guide | Kairo AI', description: 'Learn the fundamentals of water use, efficiency and loss reduction, then apply them with Kairo AI analysis tools.' },
  },
  {
    path: '/food', changeFrequency: 'monthly', priority: 0.6,
    ar: { title: 'دليل الغذاء وتقليل الهدر | Kairo AI', description: 'تعرّف على أسباب هدر الغذاء وطرق القياس والتقليل، وحوّل المعرفة إلى سلوك يومي أكثر كفاءة واستدامة.' },
    en: { title: 'Food Waste Reduction Guide | Kairo AI', description: 'Learn why food waste happens, how to measure it and which practical habits improve food efficiency and sustainability.' },
  },
  {
    path: '/co2', changeFrequency: 'monthly', priority: 0.6,
    ar: { title: 'دليل البصمة الكربونية والانبعاثات | Kairo AI', description: 'افهم مصادر ثاني أكسيد الكربون وكيفية حساب البصمة الكربونية وتقليلها من خلال قرارات واضحة قابلة للقياس.' },
    en: { title: 'Carbon Footprint and Emissions Guide | Kairo AI', description: 'Understand carbon sources, how footprints are calculated, and which measurable decisions can reduce emissions.' },
  },
  {
    path: '/sustainability', changeFrequency: 'monthly', priority: 0.6,
    ar: { title: 'دليل الاستدامة العملية | Kairo AI', description: 'اكتشف مبادئ الاستدامة وكيفية موازنة الأثر البيئي والاقتصادي والاجتماعي في القرارات اليومية والمؤسسية.' },
    en: { title: 'Practical Sustainability Guide | Kairo AI', description: 'Explore sustainability principles and balance environmental, economic and social impact in everyday and organisational decisions.' },
  },
  {
    path: '/architecture', changeFrequency: 'monthly', priority: 0.5,
    ar: { title: 'البنية التقنية للذكاء البيئي | Kairo AI', description: 'نظرة على بنية Kairo التقنية وكيفية تنظيم البيانات والنماذج والأدلة لتقديم تحليلات بيئية موثوقة وآمنة.' },
    en: { title: 'Environmental Intelligence Architecture | Kairo AI', description: 'Explore how Kairo organises data, models and evidence to deliver secure, reliable environmental intelligence.' },
  },
  {
    path: '/architecture/tokenrouter', changeFrequency: 'monthly', priority: 0.4,
    ar: { title: 'بنية توجيه نماذج الذكاء الاصطناعي | Kairo AI', description: 'شرح لبنية توجيه النماذج في Kairo وآليات اختيار المسار المناسب والتحقق من المخرجات وحماية الطلبات.' },
    en: { title: 'AI Model Routing Architecture | Kairo AI', description: 'Learn how Kairo routes AI requests, selects suitable models, validates outputs and protects the application gateway.' },
  },
  {
    path: '/saas-roadmap', changeFrequency: 'monthly', priority: 0.4,
    ar: { title: 'خارطة طريق منصة Kairo AI', description: 'استكشف خارطة تطوير Kairo كمنصة ذكاء بيئي قابلة للتوسع للأفراد والمؤسسات والمجتمعات والمدن.' },
    en: { title: 'Kairo AI Platform Roadmap', description: 'Explore Kairo’s roadmap as a scalable environmental intelligence platform for people, organisations, communities and cities.' },
  },
];

export const normalizeSeoPath = (path: string) => {
  const withoutQuery = path.split(/[?#]/, 1)[0] || '/';
  const withoutLanguage = withoutQuery.replace(/^\/en(?=\/|$)/, '') || '/';
  if (withoutLanguage === '/') return '/';
  return withoutLanguage.replace(/\/+$/, '');
};

export const getSeoRoute = (path: string) =>
  SEO_ROUTES.find((route) => route.path === normalizeSeoPath(path));

export const localizedPath = (path: string, language: SeoLanguage) => {
  const normalized = normalizeSeoPath(path);
  if (language === 'ar') return normalized;
  return normalized === '/' ? '/en' : `/en${normalized}`;
};

export const absoluteSeoUrl = (path: string, language: SeoLanguage) =>
  `${KAIRO_SITE_URL}${localizedPath(path, language)}`;

export const buildStructuredData = (route: SeoRoute, language: SeoLanguage) => {
  const copy = route[language];
  const url = absoluteSeoUrl(route.path, language);
  const languageCode = language === 'ar' ? 'ar-EG' : 'en';
  const homeName = language === 'ar' ? 'الرئيسية' : 'Home';

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': `${KAIRO_SITE_URL}/#organization`,
      name: 'Kairo AI',
      alternateName: 'KAIRO Intelligence',
      url: KAIRO_SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: KAIRO_SOCIAL_IMAGE,
        width: 822,
        height: 938,
      },
      description: route['en'].description,
    },
    {
      '@type': 'WebSite',
      '@id': `${KAIRO_SITE_URL}/#website`,
      url: KAIRO_SITE_URL,
      name: 'Kairo AI',
      publisher: { '@id': `${KAIRO_SITE_URL}/#organization` },
      inLanguage: ['ar-EG', 'en'],
    },
    {
      '@type': 'WebApplication',
      '@id': `${KAIRO_SITE_URL}/#application`,
      name: 'Kairo AI',
      url: KAIRO_SITE_URL,
      applicationCategory: 'Environmental intelligence application',
      operatingSystem: 'Any modern web browser',
      browserRequirements: 'Requires JavaScript',
      isAccessibleForFree: true,
      publisher: { '@id': `${KAIRO_SITE_URL}/#organization` },
      inLanguage: ['ar-EG', 'en'],
    },
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: copy.title,
      description: copy.description,
      isPartOf: { '@id': `${KAIRO_SITE_URL}/#website` },
      about: { '@id': `${KAIRO_SITE_URL}/#application` },
      inLanguage: languageCode,
      primaryImageOfPage: { '@type': 'ImageObject', url: KAIRO_SOCIAL_IMAGE },
      breadcrumb: { '@id': `${url}#breadcrumb` },
    },
  ];

  const breadcrumbItems: Record<string, unknown>[] = [
    { '@type': 'ListItem', position: 1, name: homeName, item: absoluteSeoUrl('/', language) },
  ];
  if (route.path !== '/') {
    breadcrumbItems.push({ '@type': 'ListItem', position: 2, name: copy.title.replace(/\s*\|\s*Kairo AI$/i, ''), item: url });
  }
  graph.push({
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: breadcrumbItems,
  });

  return { '@context': 'https://schema.org', '@graph': graph };
};
