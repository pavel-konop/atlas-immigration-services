import type { Area } from "react-easy-crop";

/** Longest edge of the exported crop is capped here; never upscaled beyond the source crop. */
export const MAX_EXPORT_EDGE = 1600;
export const WEBP_QUALITY = 0.85;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load the selected image."));
    img.src = src;
  });
}

/**
 * Crop `imageSrc` to the pixel area from react-easy-crop's `onCropComplete`,
 * downscale so the longest edge is at most MAX_EXPORT_EDGE (preserving the
 * crop's aspect ratio; never upscales), and export as a WebP Blob.
 */
export async function exportCroppedImage(imageSrc: string, cropPixels: Area): Promise<Blob> {
  const image = await loadImage(imageSrc);

  const scale = Math.min(1, MAX_EXPORT_EDGE / Math.max(cropPixels.width, cropPixels.height));
  const outputWidth = Math.max(1, Math.round(cropPixels.width * scale));
  const outputHeight = Math.max(1, Math.round(cropPixels.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not export the cropped image."))),
      "image/webp",
      WEBP_QUALITY
    );
  });
}
