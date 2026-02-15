import { CropRegion, ImageLayer } from '../types';

/**
 * Loads an image from a source string.
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Crops an image based on percentage coordinates.
 * Returns a Data URL.
 */
export const cropImage = async (
  imageSrc: string,
  crop: CropRegion,
  originalWidth: number,
  originalHeight: number
): Promise<string> => {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  
  // Calculate pixel values
  const pxX = (crop.x / 100) * originalWidth;
  const pxY = (crop.y / 100) * originalHeight;
  const pxW = (crop.width / 100) * originalWidth;
  const pxH = (crop.height / 100) * originalHeight;

  // Canvas dimensions must be integers
  canvas.width = Math.max(1, Math.round(pxW));
  canvas.height = Math.max(1, Math.round(pxH));
  
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // Draw the portion of the image
  ctx.drawImage(img, pxX, pxY, pxW, pxH, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
};

/**
 * Merges the original image with any replaced crop regions.
 */
export const generateCompositeImage = async (layer: ImageLayer): Promise<string> => {
  const baseImg = await loadImage(layer.src);
  const canvas = document.createElement('canvas');
  canvas.width = layer.width;
  canvas.height = layer.height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');

  // Draw base
  ctx.drawImage(baseImg, 0, 0);

  // Draw replacements
  for (const crop of layer.crops) {
    if (crop.replacementSrc) {
      const replacementImg = await loadImage(crop.replacementSrc);
      const pxX = (crop.x / 100) * layer.width;
      const pxY = (crop.y / 100) * layer.height;
      const pxW = (crop.width / 100) * layer.width;
      const pxH = (crop.height / 100) * layer.height;

      ctx.drawImage(replacementImg, pxX, pxY, pxW, pxH);
    }
  }

  return canvas.toDataURL('image/png');
};

/**
 * Automatically stitches images horizontally.
 * Scales all images to the height of the tallest image to ensure perfect alignment.
 */
export const generateStitchedCanvas = async (
  items: string[]
): Promise<string> => {
  if (items.length === 0) return '';

  const loadedImages = await Promise.all(items.map(src => loadImage(src)));

  // 1. Find the maximum height among all images
  const maxHeight = Math.max(...loadedImages.map(img => img.height));

  // 2. Calculate scaled widths and total width
  let totalWidth = 0;
  const dimensions = loadedImages.map(img => {
    // Aspect Ratio = Width / Height
    // New Width = Aspect Ratio * Target Height
    const aspectRatio = img.width / img.height;
    const newWidth = aspectRatio * maxHeight;
    totalWidth += newWidth;
    return { img, width: newWidth, height: maxHeight };
  });

  // 3. Create Canvas
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(totalWidth);
  canvas.height = Math.ceil(maxHeight);
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // 4. Draw Images
  let currentX = 0;
  for (const dim of dimensions) {
    ctx.drawImage(dim.img, currentX, 0, dim.width, dim.height);
    currentX += dim.width;
  }

  return canvas.toDataURL('image/png');
};