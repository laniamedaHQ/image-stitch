import { CropRegion, ImageLayer, SmartStitchImage, SmartStitchLayoutItem } from '../types';

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
 * Loads a File object and returns a SmartStitchImage with dataUrl + dimensions.
 */
export const loadImageFile = (file: File): Promise<SmartStitchImage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        resolve({
          id: Math.random().toString(36).substring(2, 9),
          file,
          dataUrl,
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = reject;
      img.src = dataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Generates a justified-row layout stitch (Google Photos style).
 * Returns a PNG data URL.
 */
export const generateSmartStitch = async (
  images: SmartStitchImage[],
  settings: { containerWidth: number; targetRowHeight: number; spacing: number; backgroundColor: string }
): Promise<string> => {
  if (images.length === 0) return '';

  const { containerWidth, targetRowHeight, spacing, backgroundColor } = settings;

  // Build rows based on aspect ratios
  let rows: { img: SmartStitchImage; aspectRatio: number; scaledWidth: number }[][] = [];
  let currentRow: { img: SmartStitchImage; aspectRatio: number; scaledWidth: number }[] = [];
  let currentWidth = 0;

  for (const image of images) {
    const aspectRatio = image.width / image.height;
    const scaledWidth = targetRowHeight * aspectRatio;

    currentRow.push({ img: image, aspectRatio, scaledWidth });
    currentWidth += scaledWidth;

    const totalWidthWithSpacing = currentWidth + (currentRow.length - 1) * spacing;
    if (totalWidthWithSpacing >= containerWidth) {
      rows.push(currentRow);
      currentRow = [];
      currentWidth = 0;
    }
  }
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  // Calculate layout positions
  const layout: SmartStitchLayoutItem[] = [];
  let y = spacing;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const isLastRow = i === rows.length - 1;
    const rowAspectRatio = row.reduce((sum, item) => sum + item.aspectRatio, 0);
    const availableWidth = containerWidth - spacing * 2 - (row.length - 1) * spacing;

    let rowHeight: number;
    if (isLastRow && row.length > 0 && rowAspectRatio < (availableWidth / targetRowHeight) * 0.6) {
      rowHeight = targetRowHeight;
    } else {
      rowHeight = availableWidth / rowAspectRatio;
    }

    let x = spacing;
    for (const item of row) {
      const width = rowHeight * item.aspectRatio;
      layout.push({ img: item.img, x, y, width, height: rowHeight });
      x += width + spacing;
    }
    y += rowHeight + spacing;
  }

  const totalHeight = y;

  // Draw to canvas
  const canvas = document.createElement('canvas');
  canvas.width = containerWidth;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const drawPromises = layout.map(
    (item) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, item.x, item.y, item.width, item.height);
          resolve();
        };
        img.src = item.img.dataUrl;
      })
  );

  await Promise.all(drawPromises);
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