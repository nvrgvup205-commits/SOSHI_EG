import { replaceExtension, scaledDimensions } from './productImage';

export type ImageFormat = 'webp' | 'jpeg' | 'png';

export interface CompressImageOptions {
  maxSize?: number;
  quality?: number;
  format?: ImageFormat;
  skipBelowBytes?: number;
  fallbackToOriginal?: boolean;
}

export interface CompressedImage {
  blob: Blob;
  file: File;
  mimeType: string;
  extension: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  wasCompressed: boolean;
}

export const DEFAULT_COMPRESS_OPTIONS: Required<CompressImageOptions> = {
  maxSize: 1200,
  quality: 88,
  format: 'webp',
  skipBelowBytes: 50 * 1024,
  fallbackToOriginal: true,
};

const MIME: Record<ImageFormat, string> = {
  webp: 'image/webp',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

const EXT: Record<ImageFormat, string> = {
  webp: '.webp',
  jpeg: '.jpg',
  png: '.png',
};

function blobToFile(blob: Blob, name: string, type: string): File {
  return new File([blob], name, { type, lastModified: Date.now() });
}

function originalFileResult(file: File, width: number, height: number): CompressedImage {
  const extension = file.name.includes('.') ? `.${file.name.split('.').pop()}` : '';
  return {
    blob: file,
    file,
    mimeType: file.type || 'application/octet-stream',
    extension,
    width,
    height,
    originalSize: file.size,
    compressedSize: file.size,
    wasCompressed: false,
  };
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error('Image compression failed.'));
          return;
        }
        resolve(result);
      },
      mimeType,
      quality
    );
  });
}

/**
 * Compress an image in the browser before uploading.
 * Falls back to the original file when compression would not reduce size.
 */
export async function compressImage(
  input: File | Blob,
  options: CompressImageOptions = {}
): Promise<CompressedImage> {
  const settings = { ...DEFAULT_COMPRESS_OPTIONS, ...options };
  const sourceFile =
    input instanceof File
      ? input
      : blobToFile(input, `upload-${Date.now()}.jpg`, input.type || 'image/jpeg');

  if (!sourceFile.type.startsWith('image/')) {
    throw new Error('Only image files can be compressed.');
  }

  if (sourceFile.type === 'image/gif' || sourceFile.type === 'image/svg+xml') {
    const bitmap = await createImageBitmap(sourceFile);
    const result = originalFileResult(sourceFile, bitmap.width, bitmap.height);
    bitmap.close();
    return result;
  }

  if (sourceFile.size <= settings.skipBelowBytes) {
    const bitmap = await createImageBitmap(sourceFile);
    const result = originalFileResult(sourceFile, bitmap.width, bitmap.height);
    bitmap.close();
    return result;
  }

  const bitmap = await createImageBitmap(sourceFile);
  const { width, height } = scaledDimensions(bitmap.width, bitmap.height, settings.maxSize);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Could not create canvas context for image compression.');
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const mimeType = MIME[settings.format];
  let blob: Blob;
  try {
    blob = await canvasToBlob(canvas, mimeType, settings.quality / 100);
  } catch {
    blob = await canvasToBlob(canvas, 'image/jpeg', settings.quality / 100);
  }

  if (settings.fallbackToOriginal && blob.size >= sourceFile.size) {
    const originalBitmap = await createImageBitmap(sourceFile);
    const result = originalFileResult(sourceFile, originalBitmap.width, originalBitmap.height);
    originalBitmap.close();
    return result;
  }

  const outputType = blob.type || mimeType;
  const extension = outputType === 'image/jpeg' ? '.jpg' : EXT[settings.format];
  const file = blobToFile(blob, replaceExtension(sourceFile.name, extension), outputType);

  return {
    blob,
    file,
    mimeType: outputType,
    extension,
    width,
    height,
    originalSize: sourceFile.size,
    compressedSize: blob.size,
    wasCompressed: true,
  };
}

export async function compressProductImages(file: File) {
  const [original, compressed, thumbnail] = await Promise.all([
    compressImage(file, { maxSize: 1600, quality: 90, format: 'webp' }),
    compressImage(file, { maxSize: 1200, quality: 88, format: 'webp' }),
    compressImage(file, { maxSize: 400, quality: 85, format: 'webp' }),
  ]);
  return {
    original: original.file,
    compressed: compressed.file,
    thumbnail: thumbnail.file,
  };
}
