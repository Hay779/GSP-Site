/**
 * Réduction des photos dans le navigateur avant l'envoi : une photo de téléphone
 * (3 à 10 Mo) devient un JPEG d'environ 300 à 600 Ko, lisible pour un diagnostic.
 * Ainsi le mail avec 6 photos reste sous les limites des messageries.
 */

export const MAX_PHOTO_EDGE = 1600;
export const PHOTO_QUALITY = 0.8;

/** Dimensions réduites en gardant les proportions (jamais agrandies). */
export function fitWithin(width: number, height: number, maxEdge = MAX_PHOTO_EDGE): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge || longest <= 0) return { width, height };
  const ratio = maxEdge / longest;
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}

export async function compressPhoto(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const size = fitWithin(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, size.width, size.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', PHOTO_QUALITY));
    return blob ?? file;
  } catch {
    return file;
  }
}
