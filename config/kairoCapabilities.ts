export type KairoLanguage = 'ar' | 'en';

export type AudienceId =
  | 'individual'
  | 'community'
  | 'education'
  | 'business'
  | 'government';

export type CapabilityId =
  | 'foresight'
  | 'water'
  | 'food'
  | 'energy'
  | 'mobility'
  | 'exposure'
  | 'ewaste'
  | 'scenarios';

export interface LocalizedText {
  ar: string;
  en: string;
}

export interface AudienceProfile {
  id: AudienceId;
  label: LocalizedText;
  shortLabel: LocalizedText;
  description: LocalizedText;
  value: LocalizedText;
}

export interface KairoCapability {
  id: CapabilityId;
  title: LocalizedText;
  shortDescription: LocalizedText;
  purpose: LocalizedText;
  outcome: LocalizedText;
  audiences: AudienceId[];
  path: string;
  accent: 'emerald' | 'blue' | 'amber' | 'violet' | 'cyan';
}

export const localize = (text: LocalizedText, language: KairoLanguage) => text[language];

export const audienceProfiles: AudienceProfile[] = [
  {
    id: 'individual',
    label: { ar: 'الأفراد والأسر', en: 'Individuals & families' },
    shortLabel: { ar: 'أفراد وأسر', en: 'People' },
    description: {
      ar: 'قرارات يومية أوضح تقلل الفاتورة والهدر والتعرض البيئي.',
      en: 'Clearer daily decisions that reduce bills, waste, and environmental exposure.',
    },
    value: {
      ar: 'خطوات شخصية قابلة للتنفيذ مع أثر مالي وبيئي مفهوم.',
      en: 'Practical personal actions with understandable financial and environmental value.',
    },
  },
  {
    id: 'community',
    label: { ar: 'المجتمع والفرق الميدانية', en: 'Communities & field teams' },
    shortLabel: { ar: 'مجتمع وميدان', en: 'Community' },
    description: {
      ar: 'رصد محلي وبلاغات أوضح وترتيب عادل لأولويات التدخل.',
      en: 'Local observation, clearer reporting, and fairer intervention priorities.',
    },
    value: {
      ar: 'تحويل الإشارات المتفرقة إلى صورة مشتركة تساعد على التصرف مبكرًا.',
      en: 'Turn scattered signals into a shared picture that supports earlier action.',
    },
  },
  {
    id: 'education',
    label: { ar: 'المدارس والجامعات والباحثون', en: 'Schools, universities & researchers' },
    shortLabel: { ar: 'تعليم وبحث', en: 'Education' },
    description: {
      ar: 'تعلم تطبيقي وبيانات قابلة للتفسير وتجارب سيناريوهات موثقة.',
      en: 'Applied learning, explainable data, and documented scenario experiments.',
    },
    value: {
      ar: 'ربط العلوم البيئية بسلوك حقيقي ونتائج يمكن مناقشتها وقياسها.',
      en: 'Connect environmental science to real behavior and measurable outcomes.',
    },
  },
  {
    id: 'business',
    label: { ar: 'الشركات والمنشآت', en: 'Businesses & facilities' },
    shortLabel: { ar: 'شركات ومنشآت', en: 'Business' },
    description: {
      ar: 'كفاءة تشغيلية أعلى، تكلفة أقل، وأدلة أفضل للاستدامة.',
      en: 'Higher operational efficiency, lower cost, and better sustainability evidence.',
    },
    value: {
      ar: 'تحديد مصادر الهدر وترتيب الاستثمار حسب العائد والمخاطر.',
      en: 'Identify waste sources and prioritize investment by return and risk.',
    },
  },
  {
    id: 'government',
    label: { ar: 'المدن والجهات العامة', en: 'Cities & public authorities' },
    shortLabel: { ar: 'مدن وجهات عامة', en: 'Public sector' },
    description: {
      ar: 'رؤية مكانية موحدة تساعد في التخطيط وتوجيه الموارد والاستجابة.',
      en: 'A unified spatial view for planning, resource allocation, and response.',
    },
    value: {
      ar: 'قرارات أسبق وأكثر شفافية مع فصل واضح بين القياس والتقدير.',
      en: 'Earlier, more transparent decisions with a clear line between measurement and estimation.',
    },
  },
];

export const kairoCapabilities: KairoCapability[] = [
  {
    id: 'foresight',
    title: { ar: 'الاستباق البيئي', en: 'Environmental foresight' },
    shortDescription: {
      ar: 'يتابع اتجاهات الهواء ومؤشرات مخاطر المياه حسب الموقع قبل تصاعد الأثر.',
      en: 'Tracks air trends and location-aware water-risk indicators before impacts escalate.',
    },
    purpose: {
      ar: 'منح الأفراد والفرق والجهات وقتًا لاتخاذ إجراء وقائي مبني على دليل مفهوم.',
      en: 'Give people, teams, and authorities time for preventive action based on understandable evidence.',
    },
    outcome: {
      ar: 'نافذة توقع 24 ساعة، أولوية فحص المياه، مستوى ثقة، وعوامل تشرح النتيجة.',
      en: 'A 24-hour forecast window, water inspection priority, confidence, and result drivers.',
    },
    audiences: ['individual', 'community', 'education', 'business', 'government'],
    path: '/monitor',
    accent: 'emerald',
  },
  {
    id: 'water',
    title: { ar: 'ذكاء المياه والندرة', en: 'Water & scarcity intelligence' },
    shortDescription: {
      ar: 'يحلل الاستهلاك والهدر وعوامل الشبكة ليكشف أين تبدأ الأولوية.',
      en: 'Analyzes use, waste, and network context to reveal where priority starts.',
    },
    purpose: {
      ar: 'تقليل الفاقد وحماية التكلفة وربط السلوك اليومي بأمن المياه.',
      en: 'Reduce losses, protect cost, and connect daily behavior to water security.',
    },
    outcome: {
      ar: 'درجة كفاءة، تقدير للهدر، مؤشرات تسريب، وخطة تحسين قابلة للتحقق.',
      en: 'Efficiency score, waste estimate, leak indicators, and a verifiable improvement plan.',
    },
    audiences: ['individual', 'community', 'education', 'business', 'government'],
    path: '/systems/water-scarcity',
    accent: 'blue',
  },
  {
    id: 'food',
    title: { ar: 'الأمن الغذائي وتقليل الفاقد', en: 'Food security & waste reduction' },
    shortDescription: {
      ar: 'يربط عادات الشراء والاستهلاك بسلسلة الإمداد والمياه والانبعاثات.',
      en: 'Connects purchasing and consumption behavior to supply chains, water, and emissions.',
    },
    purpose: {
      ar: 'تقليل الطعام المهدَر وتكلفته وتحسين كفاءة الموارد من المنزل إلى المؤسسة.',
      en: 'Reduce wasted food and cost while improving resource efficiency from homes to institutions.',
    },
    outcome: {
      ar: 'تشخيص لنقطة الفاقد، أثر مالي وبيئي، وتوصيات شراء وتخزين واستهلاك.',
      en: 'Loss-point diagnosis, financial and environmental impact, and purchasing and storage actions.',
    },
    audiences: ['individual', 'education', 'business', 'government'],
    path: '/systems/food-security',
    accent: 'emerald',
  },
  {
    id: 'energy',
    title: { ar: 'ذكاء الطاقة', en: 'Energy intelligence' },
    shortDescription: {
      ar: 'يفسر الاستهلاك والتكلفة وكفاءة الأجهزة بدل الاكتفاء برقم الفاتورة.',
      en: 'Explains consumption, cost, and appliance efficiency beyond the utility bill.',
    },
    purpose: {
      ar: 'خفض تكلفة التشغيل والانبعاثات دون التأثير غير الضروري على الراحة أو الإنتاج.',
      en: 'Lower operating cost and emissions without unnecessary impact on comfort or productivity.',
    },
    outcome: {
      ar: 'درجة كفاءة، مصادر الاستهلاك الأعلى، وفرص توفير مرتبة حسب الأولوية.',
      en: 'Efficiency score, major consumption sources, and prioritized saving opportunities.',
    },
    audiences: ['individual', 'education', 'business', 'government'],
    path: '/energy',
    accent: 'amber',
  },
  {
    id: 'mobility',
    title: { ar: 'التنقل منخفض الأثر', en: 'Low-impact mobility' },
    shortDescription: {
      ar: 'يقارن أنماط الرحلات بالتكلفة والزمن والكربون.',
      en: 'Compares travel patterns through cost, time, and carbon.',
    },
    purpose: {
      ar: 'اختيار بدائل تنقل واقعية تقلل التكلفة والانبعاثات وتدعم التخطيط الحضري.',
      en: 'Choose realistic mobility alternatives that reduce cost and emissions and support urban planning.',
    },
    outcome: {
      ar: 'بصمة شهرية، كفاءة تنقل، وبدائل واضحة لكل نمط رحلة.',
      en: 'Monthly footprint, mobility efficiency, and clear alternatives for each trip pattern.',
    },
    audiences: ['individual', 'community', 'business', 'government'],
    path: '/transport',
    accent: 'violet',
  },
  {
    id: 'exposure',
    title: { ar: 'التعرض الحضري وجودة الهواء', en: 'Urban exposure & air quality' },
    shortDescription: {
      ar: 'يحوّل بيانات الموقع والهواء إلى صورة مفهومة للتعرض اليومي.',
      en: 'Turns location and air data into an understandable view of daily exposure.',
    },
    purpose: {
      ar: 'مساعدة الفئات الحساسة والمجتمعات والجهات على تقليل التعرض وتخطيط التدخل.',
      en: 'Help sensitive groups, communities, and authorities reduce exposure and plan interventions.',
    },
    outcome: {
      ar: 'مؤشر تعرض، تفسير للعوامل، وتوصيات زمنية ومكانية قابلة للتطبيق.',
      en: 'Exposure index, factor explanation, and practical time- and location-based guidance.',
    },
    audiences: ['individual', 'community', 'education', 'business', 'government'],
    path: '/systems/urban-exposure',
    accent: 'cyan',
  },
  {
    id: 'ewaste',
    title: { ar: 'ReKairo للاقتصاد الدائري', en: 'ReKairo circular economy' },
    shortDescription: {
      ar: 'يقيم العمر المتبقي للأجهزة وأفضل مسار للإصلاح أو إعادة الاستخدام أو التدوير.',
      en: 'Evaluates device life and the best repair, reuse, or recycling path.',
    },
    purpose: {
      ar: 'إطالة عمر الأجهزة واسترداد قيمتها وتقليل المخلفات الإلكترونية الخطرة.',
      en: 'Extend device life, recover value, and reduce hazardous electronic waste.',
    },
    outcome: {
      ar: 'توصية مصير الجهاز، قيمة محتملة، وأثر دائري قابل للتتبع.',
      en: 'Device-path recommendation, potential value, and traceable circular impact.',
    },
    audiences: ['individual', 'community', 'education', 'business'],
    path: '/systems/ewaste',
    accent: 'emerald',
  },
  {
    id: 'scenarios',
    title: { ar: 'مختبر السيناريوهات', en: 'Scenario lab' },
    shortDescription: {
      ar: 'يقارن الخيارات قبل التنفيذ ويكشف أثر الافتراضات على النتيجة.',
      en: 'Compares choices before implementation and exposes how assumptions affect results.',
    },
    purpose: {
      ar: 'تقليل مخاطرة القرار واختيار التدخل الأعلى أثرًا ضمن الموارد المتاحة.',
      en: 'Reduce decision risk and select the highest-impact intervention within available resources.',
    },
    outcome: {
      ar: 'مقارنة موحدة للتكلفة والموارد والكربون مع افتراضات ظاهرة.',
      en: 'A consistent comparison of cost, resources, and carbon with visible assumptions.',
    },
    audiences: ['education', 'business', 'government'],
    path: '/scenarios',
    accent: 'violet',
  },
];

export const getAudienceProfile = (id: AudienceId) =>
  audienceProfiles.find((audience) => audience.id === id);
