
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const generateCanvas = async (elementId: string): Promise<HTMLCanvasElement | null> => {
  const element = document.getElementById(elementId);
  if (!element) {
      console.error(`Element #${elementId} not found`);
      return null;
  }
  
  try {
      element.classList.add('exporting');
      const isLight = document.documentElement.classList.contains('light-mode');

      // Add a wrapper to ensure full capture if there's scrolling
      const originalHeight = element.style.height;
      element.style.height = 'max-content';

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true, 
        logging: false,
        allowTaint: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.offsetWidth, 
        ignoreElements: (el) => el.classList.contains('no-export'),
        onclone: (clonedDoc) => {
            const clonedEl = clonedDoc.getElementById(elementId);
            if (clonedEl) {
                clonedEl.style.padding = '40px';
                clonedEl.style.margin = '0';
                clonedEl.style.height = 'max-content';
                clonedEl.style.overflow = 'visible';
                
                // Force background to match theme securely so JPEG/PNG doesn't mess it up
                clonedEl.style.backgroundColor = isLight ? '#f8fafc' : '#020617';
                
                // Fix Arabic Typography and SVG Icons without touching colors/backgrounds
                const allElements = clonedEl.querySelectorAll('*');
                allElements.forEach((el: any) => {
                    if (el.tagName !== 'svg' && el.tagName !== 'path') {
                        el.style.fontFamily = "'Cairo', sans-serif";
                        el.style.letterSpacing = '0px'; 
                        el.style.fontVariantLigatures = 'normal'; // CRITICAL: Fixes Arabic disconnected letters
                        el.style.textRendering = 'geometricPrecision';
                    }
                });

                // specifically ensure SVGs are rendered correctly
                const svgs = clonedEl.querySelectorAll('svg');
                svgs.forEach(svg => {
                    svg.setAttribute('width', svg.getBoundingClientRect().width.toString());
                    svg.setAttribute('height', svg.getBoundingClientRect().height.toString());
                });
            }
        }
      });
      
      element.style.height = originalHeight;
      element.classList.remove('exporting');
      return canvas;
  } catch (err) {
      console.error("Canvas generation failed:", err);
      element.classList.remove('exporting');
      return null;
  }
};

export const exportAsPdf = async (elementId: string, filename: string): Promise<boolean> => {
    try {
        const canvas = await generateCanvas(elementId);
        if (!canvas) return false;

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Custom PDF size to perfectly match the canvas (no empty space, no cuts)
        const pdf = new jsPDF({
            orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
            unit: 'px',
            format: [imgWidth, imgHeight]
        });
        
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Kairo_${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
        return true;
    } catch (err) {
        console.error("Export PDF failed:", err);
        return false;
    }
};

export const exportAsPng = async (elementId: string, filename: string): Promise<boolean> => {
    try {
        const canvas = await generateCanvas(elementId);
        if (!canvas) return false;

        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Kairo_${filename}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = imgData;
        link.click();
        return true;
    } catch (err) {
        console.error("Export PNG failed:", err);
        return false;
    }
};

