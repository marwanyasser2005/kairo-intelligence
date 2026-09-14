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

/**
 * Product tier. Three core capabilities cover the decisions every audience
 * starts from (live early warning, water, energy); four support capabilities
 * extend the picture; scenarios is a comparison tool layered over results.
 */
export type CapabilityTier = 'core' | 'support' | 'tool';

export interface KairoCapability {
  id: CapabilityId;
  tier: CapabilityTier;
  tierReason: LocalizedText;
  title: LocalizedText;
  shortDescription: LocalizedText;
  purpose: LocalizedText;
  outcome: LocalizedText;
  audiences: AudienceId[];
  path: string;
  accent: 'emerald' | 'blue' | 'amber' | 'violet' | 'cyan';
}

export const TIER_LABELS: Record<CapabilityTier, LocalizedText> = {
  core: { ar: 'أساسية', en: 'Core' },
  support: { ar: 'مساندة', en: 'Support' },
  tool: { ar: 'أداة قرار', en: 'Decision tool' },
};

export const localize = (text: LocalizedText, language: KairoLanguage) => text[language];

export const audienceProfiles: AudienceProfile[] = [
  {
    id: 'individual',
    label: { ar: 'الأفراد والأسر', en: 'Individuals & families' },
    shortLabel: { ar: 'أفراد وأسر', en: 'People' },
    description: {
      ar: 'قرارات يومية أوضح تساعدك تقلل الفاتورة والهدر والتعرض البيئي.',
      en: 'Clearer daily decisions that reduce bills, waste, and environmental exposure.',
    },
    value: {
      ar: 'خطوات عملية تقدر تنفذها، مع أثر مالي وبيئي واضح وسهل المتابعة.',
      en: 'Practical personal actions with understandable financial and environmental value.',
    },
  },
  {
    id: 'community',
    label: { ar: 'المجتمع والفرق الميدانية', en: 'Communities & field teams' },
    shortLabel: { ar: 'مجتمع وميدان', en: 'Community' },
    description: {
      ar: 'رصد محلي أوضح يساعد الفرق ترتب أولويات التدخل بشكل عادل.',
      en: 'Local observation, clearer reporting, and fairer intervention priorities.',
    },
    value: {
      ar: 'يجمع الإشارات المتفرقة في صورة واحدة تساعدكم تتصرفوا بدري وبثقة أكبر.',
      en: 'Turn scattered signals into a shared picture that supports earlier action.',
    },
  },
  {
    id: 'education',
    label: { ar: 'المدارس والجامعات والباحثون', en: 'Schools, universities & researchers' },
    shortLabel: { ar: 'تعليم وبحث', en: 'Education' },
    description: {
      ar: 'تعلم تطبيقي، بيانات قابلة للتفسير، وسيناريوهات يمكن توثيقها ومناقشتها.',
      en: 'Applied learning, explainable data, and documented scenario experiments.',
    },
    value: {
      ar: 'يربط العلوم البيئية بسلوك حقيقي ونتائج تقدروا تناقشوها وتقيسوها.',
      en: 'Connect environmental science to real behavior and measurable outcomes.',
    },
  },
  {
    id: 'business',
    label: { ar: 'الشركات والمنشآت', en: 'Businesses & facilities' },
    shortLabel: { ar: 'شركات ومنشآت', en: 'Business' },
    description: {
      ar: 'كفاءة تشغيلية أعلى، تكلفة أقل، ودليل أوضح على أثر الاستدامة.',
      en: 'Higher operational efficiency, lower cost, and better sustainability evidence.',
    },
    value: {
      ar: 'يساعدكم تحددوا مصادر الهدر وترتبوا الاستثمار حسب العائد والمخاطر.',
      en: 'Identify waste sources and prioritize investment by return and risk.',
    },
  },
  {
    id: 'government',
    label: { ar: 'المدن والجهات العامة', en: 'Cities & public authorities' },
    shortLabel: { ar: 'مدن وجهات عامة', en: 'Public sector' },
    description: {
      ar: 'رؤية مكانية موحدة تساعد على التخطيط وتوجيه الموارد والاستجابة في الوقت المناسب.',
      en: 'A unified spatial view for planning, resource allocation, and response.',
    },
    value: {
      ar: 'قرارات أبكر وأكثر شفافية، مع فرق واضح بين القياس الحقيقي والتقدير.',
      en: 'Earlier, more transparent decisions with a clear line between measurement and estimation.',
    },
  },
];

export const kairoCapabilities: KairoCapability[] = [  {
    id: 'water',
    tier: 'core',
    tierReason: { ar: 'أعلى أثر أمني ومالي، بمحرك حساب حتمي وتوثيق واضح.', en: 'Highest security and financial impact with a deterministic engine.' },
    title: { ar: 'ذكاء المياه والندرة', en: 'Water & scarcity intelligence' },
    shortDescription: {
      ar: 'يفهم استهلاكك والهدر وحالة الشبكة، ويقول لك تبدأ الفحص أو التحسين منين.',
      en: 'Analyzes use, waste, and network context to reveal where priority starts.',
    },
    purpose: {
      ar: 'يساعدك تقلل الفاقد والتكلفة، وتربط استخدامك اليومي بأمن المياه.',
      en: 'Reduce losses, protect cost, and connect daily behavior to water security.',
    },
    outcome: {
      ar: 'درجة كفاءة، هدر تقديري، أولوية للفحص، وخطة تحسين يمكن التحقق منها.',
      en: 'Efficiency score, waste estimate, leak indicators, and a verifiable improvement plan.',
    },
    audiences: ['individual', 'community', 'education', 'business', 'government'],
    path: '/systems/water-scarcity',
    accent: 'blue',
  },
  {
    id: 'energy',
    tier: 'core',
    tierReason: { ar: 'فاتورة شهرية لكل مستخدم مع وفر مباشر قابل للمتابعة.', en: 'A monthly bill for every user with directly verifiable savings.' },
    title: { ar: 'ذكاء الطاقة', en: 'Energy intelligence' },
    shortDescription: {
      ar: 'يفسر استهلاكك وتكلفته وكفاءة الأجهزة، بدل ما تفضل الفاتورة مجرد رقم.',
      en: 'Explains consumption, cost, and appliance efficiency beyond the utility bill.',
    },
    purpose: {
      ar: 'يساعدك تخفض تكلفة التشغيل والانبعاثات من غير ما تضحي بالراحة أو الإنتاج.',
      en: 'Lower operating cost and emissions without unnecessary impact on comfort or productivity.',
    },
    outcome: {
      ar: 'درجة كفاءة، أكبر مصادر الاستهلاك، وفرص توفير مرتبة حسب الأولوية.',
      en: 'Efficiency score, major consumption sources, and prioritized saving opportunities.',
    },
    audiences: ['individual', 'education', 'business', 'government'],
    path: '/energy',
    accent: 'amber',
  },
  {
    id: 'food',
    tier: 'core',
    tierReason: { ar: 'نظام الموارد الثالث بعد المياه والطاقة، بأثر مالي مباشر وأولوية وطنية.', en: 'The third resource system after water and energy, with direct financial and national impact.' },
    title: { ar: 'الأمن الغذائي وتقليل الفاقد', en: 'Food security & waste reduction' },
    shortDescription: {
      ar: 'يربط عادات الشراء والاستهلاك بالهدر والتكلفة والمياه والانبعاثات.',
      en: 'Connects purchasing and consumption behavior to supply chains, water, and emissions.',
    },
    purpose: {
      ar: 'يساعدك تقلل الطعام المهدَر وتكلفته، وتحسن استخدام الموارد في البيت أو المؤسسة.',
      en: 'Reduce wasted food and cost while improving resource efficiency from homes to institutions.',
    },
    outcome: {
      ar: 'يعرفك نقطة الفاقد، أثرها المالي والبيئي، وخطوات عملية للشراء والتخزين والاستهلاك.',
      en: 'Loss-point diagnosis, financial and environmental impact, and purchasing and storage actions.',
    },
    audiences: ['individual', 'education', 'business', 'government'],
    path: '/systems/food-security',
    accent: 'emerald',
  },
  {
    id: 'foresight',
    tier: 'support',
    tierReason: { ar: 'طبقة إشارات حية تمتد فوق الخواص الأساسية وتدعم القرار الوقائي.', en: 'A live signal layer spanning the core capabilities and supporting preventive decisions.' },
    title: {
      ar: 'KAIRO SIGNALS · الاستباق البيئي',
      en: 'KAIRO SIGNALS · Environmental foresight',
    },
    shortDescription: {
      ar: 'يتابع اتجاهات الهواء ومؤشرات المياه حسب الموقع، علشان تقدر تتحرك قبل ما يزيد الأثر.',
      en: 'Tracks air trends and location-aware water-risk indicators before impacts escalate.',
    },
    purpose: {
      ar: 'يديك وقتًا كافيًا لاتخاذ إجراء وقائي مبني على دليل واضح ومفهوم.',
      en: 'Give people, teams, and authorities time for preventive action based on understandable evidence.',
    },
    outcome: {
      ar: 'توقع 24 ساعة، أولوية فحص المياه، مستوى الثقة، والعوامل التي أثرت في النتيجة.',
      en: 'A 24-hour forecast window, water inspection priority, confidence, and result drivers.',
    },
    audiences: ['individual', 'community', 'education', 'business', 'government'],
    path: '/monitor',
    accent: 'emerald',
  },
  {
    id: 'mobility',
    tier: 'support',
    tierReason: { ar: 'قرار يومي متكرر، وأثره متوسط ويحتاج نمط رحلات.', en: 'A frequent daily decision with medium impact that needs trip patterns.' },
    title: { ar: 'التنقل منخفض الأثر', en: 'Low-impact mobility' },
    shortDescription: {
      ar: 'يقارن رحلاتك من ناحية التكلفة والوقت والانبعاثات.',
      en: 'Compares travel patterns through cost, time, and carbon.',
    },
    purpose: {
      ar: 'يساعدك تختار بدائل تنقل واقعية تقلل التكلفة والانبعاثات وتوفر الوقت.',
      en: 'Choose realistic mobility alternatives that reduce cost and emissions and support urban planning.',
    },
    outcome: {
      ar: 'بصمة شهرية، درجة كفاءة للتنقل، وبدائل واضحة تناسب نمط رحلاتك.',
      en: 'Monthly footprint, mobility efficiency, and clear alternatives for each trip pattern.',
    },
    audiences: ['individual', 'community', 'business', 'government'],
    path: '/transport',
    accent: 'violet',
  },
  {
    id: 'exposure',
    tier: 'support',
    tierReason: { ar: 'صحي ووقائي بطبيعته، ونتيجته تقديرية لا قياس حسّاس.', en: 'Health-oriented by nature; its result is contextual, not a sensor reading.' },
    title: { ar: 'التعرض الحضري وجودة الهواء', en: 'Urban exposure & air quality' },
    shortDescription: {
      ar: 'يحوّل بيانات الموقع والهواء إلى صورة بسيطة تشرح تعرضك اليومي.',
      en: 'Turns location and air data into an understandable view of daily exposure.',
    },
    purpose: {
      ar: 'يساعد الفئات الحساسة والفرق والجهات تقلل التعرض وتختار وقت ومكان التدخل.',
      en: 'Help sensitive groups, communities, and authorities reduce exposure and plan interventions.',
    },
    outcome: {
      ar: 'مؤشر تعرض تقديري، أسباب واضحة، وتوصيات عملية للوقت والمكان.',
      en: 'Exposure index, factor explanation, and practical time- and location-based guidance.',
    },
    audiences: ['individual', 'community', 'education', 'business', 'government'],
    path: '/systems/urban-exposure',
    accent: 'cyan',
  },
  {
    id: 'ewaste',
    tier: 'support',
    tierReason: { ar: 'قرار متقطع لكنه عالي القيمة لحظة اتخاذه.', en: 'An occasional decision, but high value at the moment it is taken.' },
    title: { ar: 'ReKairo للاقتصاد الدائري', en: 'ReKairo circular economy' },
    shortDescription: {
      ar: 'يقيّم حالة جهازك وعمره المتبقي، ويقترح أفضل مسار: استخدام، إصلاح، بيع أو تدوير.',
      en: 'Evaluates device life and the best repair, reuse, or recycling path.',
    },
    purpose: {
      ar: 'يساعدك تطوّل عمر الجهاز، تسترد جزءًا من قيمته، وتقلل المخلفات الإلكترونية الخطرة.',
      en: 'Extend device life, recover value, and reduce hazardous electronic waste.',
    },
    outcome: {
      ar: 'توصية واضحة للجهاز، قيمة تقديرية، وأثر دائري يمكنك متابعته.',
      en: 'Device-path recommendation, potential value, and traceable circular impact.',
    },
    audiences: ['individual', 'community', 'education', 'business'],
    path: '/systems/ewaste',
    accent: 'emerald',
  },
  {
    id: 'scenarios',
    tier: 'tool',
    tierReason: { ar: 'أداة مقارنة تعمل فوق نتائج الخواص الأخرى.', en: 'A comparison tool layered on top of the other results.' },
    title: { ar: 'مختبر السيناريوهات', en: 'Scenario lab' },
    shortDescription: {
      ar: 'يقارن اختياراتك قبل التنفيذ، ويوضح كيف كل افتراض يغيّر النتيجة.',
      en: 'Compares choices before implementation and exposes how assumptions affect results.',
    },
    purpose: {
      ar: 'يساعدك تقلل مخاطرة القرار وتختار التدخل الأعلى أثرًا حسب الموارد المتاحة.',
      en: 'Reduce decision risk and select the highest-impact intervention within available resources.',
    },
    outcome: {
      ar: 'مقارنة واضحة للتكلفة والموارد والانبعاثات، مع إظهار كل الافتراضات.',
      en: 'A consistent comparison of cost, resources, and carbon with visible assumptions.',
    },
    audiences: ['education', 'business', 'government'],
    path: '/scenarios',
    accent: 'violet',
  },
];

export const getAudienceProfile = (id: AudienceId) =>
  audienceProfiles.find((audience) => audience.id === id);

export const coreCapabilities = kairoCapabilities.filter((capability) => capability.tier === 'core');
export const supportCapabilities = kairoCapabilities.filter((capability) => capability.tier === 'support');

export const groupCapabilitiesByTier = (capabilities: KairoCapability[]) => ({
  core: capabilities.filter((capability) => capability.tier === 'core'),
  support: capabilities.filter((capability) => capability.tier === 'support'),
  tool: capabilities.filter((capability) => capability.tier === 'tool'),
});
