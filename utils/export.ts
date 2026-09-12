import type { SdgNumber } from '../components/SdgBadge';

type JsPdfConstructor = typeof import('jspdf').jsPDF;
type JsPdfInstance = InstanceType<JsPdfConstructor>;

export interface KairoExportOptions {
  title?: string;
  subtitle?: string;
  sdgs?: SdgNumber[];
  language?: 'ar' | 'en';
}

interface GeneratedCanvas {
  canvas: HTMLCanvasElement;
  language: 'ar' | 'en';
  title: string;
}

const SDG_LABELS: Record<SdgNumber, { ar: string; en: string }> = {
  2: { ar: 'القضاء على الجوع', en: 'Zero Hunger' },
  3: { ar: 'الصحة الجيدة والرفاه', en: 'Good Health & Well-being' },
  6: { ar: 'المياه النظيفة والصرف الصحي', en: 'Clean Water & Sanitation' },
  7: { ar: 'طاقة نظيفة وبأسعار معقولة', en: 'Affordable & Clean Energy' },
  11: { ar: 'مدن ومجتمعات مستدامة', en: 'Sustainable Cities' },
  12: { ar: 'الاستهلاك والإنتاج المسؤولان', en: 'Responsible Consumption' },
  13: { ar: 'العمل المناخي', en: 'Climate Action' },
};

const sanitizeFilename = (filename: string) =>
  filename
    .trim()
    // Stripping ASCII control characters from report filenames is intentional.
    // eslint-disable-next-line no-control-regex
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/\s+/g, '_')
    .slice(0, 90) || 'environmental_report';

const downloadBlob = (blob: Blob, filename: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = objectUrl;
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
};

const waitWithTimeout = async (promise: Promise<unknown>, timeoutMs: number) => {
  let timeoutId: number | undefined;
  try {
    await Promise.race([
      promise,
      new Promise<void>((resolve) => {
        timeoutId = window.setTimeout(resolve, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
};

const makeText = (
  documentRef: Document,
  tag: keyof HTMLElementTagNameMap,
  text: string,
) => {
  const element = documentRef.createElement(tag);
  element.textContent = text;
  return element;
};

const applyStyles = (element: HTMLElement, styles: Partial<CSSStyleDeclaration>) => {
  Object.assign(element.style, styles);
  return element;
};

const ARABIC_TEXT = /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]/;

/** Keep exported text on the same font metrics and bidi rules as the live UI. */
const stabilizeExportTypography = (root: HTMLElement, language: 'ar' | 'en') => {
  root.style.fontFamily = language === 'ar'
    ? "'IBM Plex Sans Arabic', Arial, sans-serif"
    : "'Manrope', 'IBM Plex Sans Arabic', Arial, sans-serif";

  root.querySelectorAll<HTMLElement>('*').forEach((candidate) => {
    candidate.style.animation = 'none';
    candidate.style.transition = 'none';
    candidate.style.caretColor = 'transparent';

    if (!['svg', 'path'].includes(candidate.tagName.toLowerCase())) {
      candidate.style.fontFamily = 'inherit';
      candidate.style.fontKerning = 'normal';
      candidate.style.fontVariantLigatures = 'common-ligatures';
      candidate.style.textRendering = 'optimizeLegibility';
    }

    if (candidate.style.overflow === 'auto' || candidate.style.overflow === 'scroll') {
      candidate.style.overflow = 'visible';
    }

    const hasDirectText = Array.from(candidate.childNodes).some(
      (node) => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()),
    );
    if (!hasDirectText) return;

    const isArabicRun = ARABIC_TEXT.test(candidate.textContent || '');
    candidate.setAttribute('dir', isArabicRun ? 'rtl' : 'ltr');
    candidate.style.direction = isArabicRun ? 'rtl' : 'ltr';
    candidate.style.unicodeBidi = 'plaintext';
    candidate.style.letterSpacing = 'normal';
    candidate.style.wordSpacing = isArabicRun ? '0.09em' : '0.035em';
    candidate.style.overflowWrap = 'break-word';
    candidate.style.wordBreak = 'normal';
  });
};

const addExportHeader = (
  clonedDocument: Document,
  clonedElement: HTMLElement,
  options: KairoExportOptions,
  language: 'ar' | 'en',
) => {
  const isAr = language === 'ar';
  const title = options.title || (isAr ? 'تقرير Kairo البيئي' : 'Kairo environmental report');
  const generatedAt = new Intl.DateTimeFormat(isAr ? 'ar-EG' : 'en-GB', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date());

  const header = applyStyles(clonedDocument.createElement('header'), {
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
    marginBottom: '34px',
    padding: '26px 28px',
    border: '1px solid rgba(45, 212, 164, .24)',
    borderRadius: '24px',
    color: '#ecfdf5',
    background:
      'radial-gradient(circle at top right, rgba(45,212,164,.2), transparent 42%), linear-gradient(135deg, #0b2a22, #07110f)',
    boxShadow: '0 18px 55px rgba(0,0,0,.18)',
    direction: isAr ? 'rtl' : 'ltr',
  });
  header.setAttribute('data-kairo-export-header', 'true');

  const identityRow = applyStyles(clonedDocument.createElement('div'), {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
  });
  const identity = applyStyles(clonedDocument.createElement('div'), {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  });
  const logo = clonedDocument.createElement('img');
  logo.src = '/branding/kairo-logo-2026.png';
  logo.alt = 'KAIRO';
  applyStyles(logo, {
    width: '64px',
    height: '74px',
    objectFit: 'contain',
    flex: '0 0 auto',
  });
  const identityText = clonedDocument.createElement('div');
  const brand = makeText(clonedDocument, 'p', 'KAIRO');
  applyStyles(brand, {
    margin: '0',
    color: '#2dd4a4',
    fontSize: '13px',
    fontWeight: '900',
    letterSpacing: '.18em',
  });
  const descriptor = makeText(
    clonedDocument,
    'p',
    isAr ? 'منصة الذكاء البيئي المتكامل' : 'Integrated environmental intelligence',
  );
  applyStyles(descriptor, {
    margin: '5px 0 0',
    color: '#a7f3d0',
    fontSize: '12px',
    fontWeight: '700',
  });
  identityText.append(brand, descriptor);
  identity.append(logo, identityText);

  const reportMeta = makeText(
    clonedDocument,
    'div',
    `${isAr ? 'أُنشئ في' : 'Generated'} · ${generatedAt}`,
  );
  applyStyles(reportMeta, {
    color: '#94a3b8',
    fontSize: '11px',
    fontWeight: '700',
    textAlign: isAr ? 'left' : 'right',
  });
  identityRow.append(identity, reportMeta);

  const titleBlock = clonedDocument.createElement('div');
  const heading = makeText(clonedDocument, 'h1', title);
  applyStyles(heading, {
    margin: '0',
    color: '#ffffff',
    fontSize: '30px',
    fontWeight: '900',
    lineHeight: '1.35',
    letterSpacing: '-.02em',
  });
  titleBlock.append(heading);
  if (options.subtitle) {
    const subtitle = makeText(clonedDocument, 'p', options.subtitle);
    applyStyles(subtitle, {
      margin: '9px 0 0',
      maxWidth: '820px',
      color: '#cbd5e1',
      fontSize: '13px',
      lineHeight: '1.8',
    });
    titleBlock.append(subtitle);
  }

  header.append(identityRow, titleBlock);

  if (options.sdgs?.length) {
    const sdgWrap = applyStyles(clonedDocument.createElement('div'), {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '8px',
      paddingTop: '18px',
      borderTop: '1px solid rgba(255,255,255,.1)',
    });
    const sdgLead = makeText(
      clonedDocument,
      'span',
      isAr ? 'هذا النظام يخدم:' : 'This system serves:',
    );
    applyStyles(sdgLead, {
      color: '#94a3b8',
      fontSize: '11px',
      fontWeight: '800',
      marginInlineEnd: '4px',
    });
    sdgWrap.append(sdgLead);

    options.sdgs.forEach((sdg) => {
      const badge = makeText(
        clonedDocument,
        'span',
        isAr
          ? `هدف التنمية ${sdg.toLocaleString('ar-EG')} · ${SDG_LABELS[sdg].ar}`
          : `SDG ${sdg} · ${SDG_LABELS[sdg].en}`,
      );
      applyStyles(badge, {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '7px 10px',
        border: '1px solid rgba(45,212,164,.28)',
        borderRadius: '999px',
        color: '#d1fae5',
        background: 'rgba(45,212,164,.09)',
        fontSize: '10px',
        fontWeight: '800',
      });
      sdgWrap.append(badge);
    });
    header.append(sdgWrap);
  }

  const notice = applyStyles(clonedDocument.createElement('footer'), {
    marginTop: '34px',
    padding: '18px 22px',
    border: '1px solid rgba(100,116,139,.22)',
    borderRadius: '18px',
    color: '#64748b',
    background: 'rgba(148,163,184,.07)',
    fontSize: '10px',
    fontWeight: '700',
    lineHeight: '1.7',
    direction: isAr ? 'rtl' : 'ltr',
  });
  notice.textContent = isAr
    ? 'ملاحظة منهجية: يفرّق Kairo بين البيانات الحية، ومدخلات المستخدم، والمؤشرات المشتقة، والتقديرات، والتوقعات. يجب التحقق ميدانيًا من المؤشرات التقديرية قبل اتخاذ قرار تشغيلي حرج.'
    : 'Method note: Kairo distinguishes live data, user inputs, derived indicators, estimates, and forecasts. Validate estimated indicators in the field before making a critical operational decision.';

  clonedElement.prepend(header);
  clonedElement.append(notice);
};

const waitForDocumentAssets = async (element: HTMLElement) => {
  if ('fonts' in document) {
    await waitWithTimeout(document.fonts.ready.catch(() => undefined), 8_000);
  }
  const pendingImages = Array.from(element.querySelectorAll('img')).map(async (image) => {
    if (image.complete && image.naturalWidth > 0) return;
    if (typeof image.decode === 'function') {
      await image.decode().catch(() => undefined);
      if (image.complete) return;
    }
    await new Promise<void>((resolve) => {
      const done = () => resolve();
      image.addEventListener('load', done, { once: true });
      image.addEventListener('error', done, { once: true });
    });
  });
  await waitWithTimeout(Promise.allSettled(pendingImages), 10_000);
};

const generateCanvas = async (
  elementId: string,
  options: KairoExportOptions = {},
): Promise<GeneratedCanvas | null> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    return null;
  }

  const language = options.language || (document.documentElement.dir === 'rtl' ? 'ar' : 'en');
  const isLight =
    document.documentElement.classList.contains('light-mode') ||
    document.documentElement.dataset.theme === 'light';
  const originalHeight = element.style.height;
  const originalOverflow = element.style.overflow;

  try {
    // html2canvas-pro is API-compatible with html2canvas and supports the
    // OKLCH/LAB color functions emitted by Tailwind 4 and HeroUI.
    const { default: html2canvas } = await import('html2canvas-pro');
    element.classList.add('exporting');
    element.style.height = 'max-content';
    element.style.overflow = 'visible';
    await waitForDocumentAssets(element);

    const contentWidth = Math.max(element.scrollWidth, element.clientWidth, 960);
    const contentHeight = Math.max(element.scrollHeight, element.clientHeight);
    const maxSafeCanvasHeight = 25_000;
    const maxSafeCanvasPixels = 10_000_000;
    const pixelSafeScale = Math.sqrt(
      maxSafeCanvasPixels / Math.max(contentWidth * contentHeight, 1),
    );
    const scale = Math.max(
      1,
      Math.min(1.25, pixelSafeScale, maxSafeCanvasHeight / Math.max(contentHeight, 1)),
    );

    const renderCanvas = (renderScale: number) =>
      html2canvas(element, {
        scale: renderScale,
        useCORS: true,
        logging: false,
        allowTaint: false,
        imageTimeout: 12_000,
        removeContainer: true,
        backgroundColor: isLight ? '#f5f8f6' : '#07110f',
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: Math.max(document.documentElement.clientWidth, contentWidth + 96),
        width: contentWidth,
        ignoreElements: (candidate) => candidate.classList.contains('no-export'),
        onclone: (clonedDocument) => {
        const clonedElement = clonedDocument.getElementById(elementId);
        if (!clonedElement) return;

        clonedDocument.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        clonedDocument.documentElement.style.colorScheme = isLight ? 'light' : 'dark';
        clonedElement.style.boxSizing = 'border-box';
        clonedElement.style.width = `${contentWidth}px`;
        clonedElement.style.maxWidth = 'none';
        clonedElement.style.padding = '42px';
        clonedElement.style.margin = '0';
        clonedElement.style.height = 'max-content';
        clonedElement.style.overflow = 'visible';
        clonedElement.style.backgroundColor = isLight ? '#f5f8f6' : '#07110f';
        clonedElement.setAttribute('data-kairo-export-surface', language);

        clonedElement.querySelectorAll<HTMLElement>('.no-export').forEach((candidate) => {
          candidate.remove();
        });
        stabilizeExportTypography(clonedElement, language);

        clonedElement.querySelectorAll<SVGElement>('svg').forEach((svg) => {
          const box = svg.getBoundingClientRect();
          if (box.width > 0) svg.setAttribute('width', box.width.toString());
          if (box.height > 0) svg.setAttribute('height', box.height.toString());
        });

        addExportHeader(clonedDocument, clonedElement, options, language);
      },
      });

    let canvas: HTMLCanvasElement;
    try {
      canvas = await renderCanvas(scale);
    } catch (firstError) {
      if (scale <= 1) throw firstError;
      console.warn('Kairo export is retrying at a memory-safe resolution.', firstError);
      canvas = await renderCanvas(1);
    }

    if (!canvas.width || !canvas.height) {
      throw new Error('The generated report canvas is empty.');
    }

    return {
      canvas,
      language,
      title:
        options.title ||
        (language === 'ar' ? 'تقرير Kairo البيئي' : 'Kairo environmental report'),
    };
  } catch (error) {
    console.error('Canvas generation failed:', error);
    return null;
  } finally {
    element.style.height = originalHeight;
    element.style.overflow = originalOverflow;
    element.classList.remove('exporting');
  }
};

const addCanvasPage = (
  pdf: JsPdfInstance,
  source: HTMLCanvasElement,
  startY: number,
  sliceHeight: number,
  pageWidth: number,
  pageHeight: number,
  margin: number,
) => {
  const pageCanvas = document.createElement('canvas');
  pageCanvas.width = source.width;
  pageCanvas.height = sliceHeight;
  const context = pageCanvas.getContext('2d');
  if (!context) throw new Error('Canvas context is unavailable.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
  context.drawImage(
    source,
    0,
    startY,
    source.width,
    sliceHeight,
    0,
    0,
    source.width,
    sliceHeight,
  );

  const usableWidth = pageWidth - margin * 2;
  const renderedHeight = (sliceHeight * usableWidth) / source.width;
  pdf.addImage(
    pageCanvas.toDataURL('image/jpeg', 0.96),
    'JPEG',
    margin,
    margin,
    usableWidth,
    renderedHeight,
    undefined,
    'FAST',
  );
};

export const exportAsPdf = async (
  elementId: string,
  filename: string,
  options: KairoExportOptions = {},
): Promise<boolean> => {
  try {
    const generated = await generateCanvas(elementId, options);
    if (!generated) return false;

    const { canvas, language, title } = generated;
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 9;
    const footerHeight = 8;
    const usableHeight = pageHeight - margin * 2 - footerHeight;
    const sliceHeight = Math.max(
      1,
      Math.floor((usableHeight * canvas.width) / (pageWidth - margin * 2)),
    );
    const totalPages = Math.ceil(canvas.height / sliceHeight);

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
      if (pageIndex > 0) pdf.addPage();
      const startY = pageIndex * sliceHeight;
      const currentSliceHeight = Math.min(sliceHeight, canvas.height - startY);
      addCanvasPage(
        pdf,
        canvas,
        startY,
        currentSliceHeight,
        pageWidth,
        pageHeight,
        margin,
      );

      pdf.setDrawColor(220, 227, 224);
      pdf.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(90, 107, 101);
      pdf.text('KAIRO · Environmental Intelligence', margin, pageHeight - 5.7);
      pdf.text(
        `${pageIndex + 1} / ${totalPages}`,
        pageWidth - margin,
        pageHeight - 5.7,
        { align: 'right' },
      );
      pdf.setProperties({
        title,
        subject:
          language === 'ar'
            ? 'تقرير دعم قرار بيئي من منصة Kairo'
            : 'Environmental decision-support report from Kairo',
        author: 'KAIRO',
        creator: 'KAIRO Environmental Intelligence',
      });
    }

    const outputName = `Kairo_${sanitizeFilename(filename)}_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;
    downloadBlob(
      pdf.output('blob'),
      outputName,
    );
    return true;
  } catch (error) {
    console.error('Export PDF failed:', error);
    return false;
  }
};

export const exportAsPng = async (
  elementId: string,
  filename: string,
  options: KairoExportOptions = {},
): Promise<boolean> => {
  try {
    const generated = await generateCanvas(elementId, options);
    if (!generated) return false;

    const blob = await new Promise<Blob | null>((resolve) =>
      generated.canvas.toBlob(resolve, 'image/png', 1),
    );
    if (!blob) return false;

    downloadBlob(
      blob,
      `Kairo_${sanitizeFilename(filename)}_${new Date()
        .toISOString()
        .slice(0, 10)}.png`,
    );
    return true;
  } catch (error) {
    console.error('Export PNG failed:', error);
    return false;
  }
};
