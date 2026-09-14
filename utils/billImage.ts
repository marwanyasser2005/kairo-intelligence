/**
 * Client-side bill image preparation. Vision models read a bounded resolution
 * well, so we downscale very large photos and re-encode them as JPEG before
 * upload. This keeps the request small (faster OCR, lower failure rate) while
 * preserving the text legibility that matters for meter readings.
 */
export const MAX_OCR_EDGE = 1600;
export const OCR_JPEG_QUALITY = 0.9;
/** Images below this size are already cheap to upload. */
export const KEEP_ORIGINAL_BYTES = 900 * 1024;

export interface FitResult {
  width: number;
  height: number;
  scale: number;
  resized: boolean;
}

/** Pure geometry helper so the resize rule stays testable without a DOM. */
export const fitWithin = (width: number, height: number, maxEdge: number): FitResult => {
  const safeWidth = Number.isFinite(width) && width > 0 ? Math.round(width) : 1;
  const safeHeight = Number.isFinite(height) && height > 0 ? Math.round(height) : 1;
  if (!Number.isFinite(maxEdge) || maxEdge <= 0) {
    return { width: safeWidth, height: safeHeight, scale: 1, resized: false };
  }
  const longest = Math.max(safeWidth, safeHeight);
  if (longest <= maxEdge) {
    return { width: safeWidth, height: safeHeight, scale: 1, resized: false };
  }
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(safeWidth * scale)),
    height: Math.max(1, Math.round(safeHeight * scale)),
    scale,
    resized: true,
  };
};

export interface PreparedBillImage {
  base64: string;
  mimeType: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  resized: boolean;
  bytes: number;
}

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('The selected image could not be read.'));
    reader.readAsDataURL(file);
  });

const base64FromDataUrl = (dataUrl: string) => dataUrl.split(',')[1] ?? '';

 const estimateBase64Bytes = (base64: string) => Math.round((base64.length * 3) / 4);

export const prepareBillImage = async (file: File): Promise<PreparedBillImage> => {
  const dataUrl = await readAsDataUrl(file);
  const originalBase64 = base64FromDataUrl(dataUrl);

  const fallback = (): PreparedBillImage => ({
    base64: originalBase64,
    mimeType: file.type || 'image/jpeg',
    width: 0,
    height: 0,
    originalWidth: 0,
    originalHeight: 0,
    resized: false,
    bytes: estimateBase64Bytes(originalBase64),
  });

  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') {
    return fallback();
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return fallback();
  }

  const originalWidth = bitmap.width;
  const originalHeight = bitmap.height;
  const fit = fitWithin(originalWidth, originalHeight, MAX_OCR_EDGE);

  if (!fit.resized && file.size <= KEEP_ORIGINAL_BYTES) {
    bitmap.close();
    return {
      base64: originalBase64,
      mimeType: file.type || 'image/jpeg',
      width: originalWidth,
      height: originalHeight,
      originalWidth,
      originalHeight,
      resized: false,
      bytes: estimateBase64Bytes(originalBase64),
    };
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = fit.width;
    canvas.height = fit.height;
    const context = canvas.getContext('2d');
    if (!context) {
      bitmap.close();
      return fallback();
    }
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, fit.width, fit.height);
    context.drawImage(bitmap, 0, 0, fit.width, fit.height);
    bitmap.close();

    const encoded = canvas.toDataURL('image/jpeg', OCR_JPEG_QUALITY);
    const base64 = base64FromDataUrl(encoded);
    if (!base64) return fallback();

    return {
      base64,
      mimeType: 'image/jpeg',
      width: fit.width,
      height: fit.height,
      originalWidth,
      originalHeight,
      resized: fit.resized,
      bytes: estimateBase64Bytes(base64),
    };
  } catch {
    try {
      bitmap.close();
    } catch {
      // The bitmap may already be closed; nothing else to release here.
    }
    return fallback();
  }
};
