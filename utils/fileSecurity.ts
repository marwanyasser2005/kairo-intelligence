export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 25_000_000;

export const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png']);

export const hasExpectedImageSignature = (
  bytes: Uint8Array,
  mimeType: string,
): boolean => {
  if (mimeType === 'image/jpeg') {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return signature.every((value, index) => bytes[index] === value);
  }
  return false;
};

export const validateImageFile = async (file: File): Promise<boolean> => {
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) return false;
  if (!SUPPORTED_IMAGE_TYPES.has(file.type.toLowerCase())) return false;
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!hasExpectedImageSignature(header, file.type.toLowerCase())) return false;

  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      const pixels = bitmap.width * bitmap.height;
      bitmap.close();
      return pixels > 0 && pixels <= MAX_IMAGE_PIXELS;
    } catch {
      return false;
    }
  }

  return true;
};
