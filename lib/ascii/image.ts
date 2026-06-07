import sharp from "sharp";
import { renderLuminanceGridToAscii, resolveAsciiRows } from "./core";
import type { ImageAsciiOptions, LuminanceGrid, RgbColor } from "./types";

const SUPPORTED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".svg"]);

function getFileExtension(filePath: string) {
  const match = filePath.toLowerCase().match(/\.[^.]+$/);

  return match?.[0] ?? "";
}

function assertSupportedImageExtension(filePath: string) {
  const extension = getFileExtension(filePath);

  if (!SUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
    throw new Error(`Unsupported image format "${extension || "unknown"}". Supported: jpg, jpeg, png, webp, svg.`);
  }
}

function getLuminance(red: number, green: number, blue: number) {
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function getColorVariance(red: number, green: number, blue: number, color: RgbColor) {
  return ((red - color.red) ** 2 + (green - color.green) ** 2 + (blue - color.blue) ** 2) / 3;
}

function createGridFromRgba(data: Buffer, width: number, height: number, options: ImageAsciiOptions): LuminanceGrid {
  const size = width * height;
  const luminance = new Uint8Array(size);
  const alpha = new Uint8Array(size);
  const backgroundMask = options.background?.enabled ? new Array<boolean>(size).fill(false) : undefined;
  const maxVariance = options.background?.maxVariance ?? 0;

  for (let index = 0; index < size; index += 1) {
    const offset = index * 4;
    const red = data[offset] ?? 0;
    const green = data[offset + 1] ?? 0;
    const blue = data[offset + 2] ?? 0;

    luminance[index] = Math.round(getLuminance(red, green, blue));
    alpha[index] = data[offset + 3] ?? 255;

    if (backgroundMask && options.background?.color) {
      backgroundMask[index] = getColorVariance(red, green, blue, options.background.color) <= maxVariance;
    }
  }

  return {
    width,
    height,
    data: luminance,
    alpha,
    backgroundMask,
  };
}

export async function loadImageAsLuminanceGrid(filePath: string, options: ImageAsciiOptions): Promise<LuminanceGrid> {
  assertSupportedImageExtension(filePath);

  const image = sharp(filePath, { limitInputPixels: 40_000_000 });
  const metadata = await image.metadata();
  const sourceWidth = metadata.width ?? options.columns;
  const sourceHeight = metadata.height ?? options.rows ?? options.columns;
  const rows = resolveAsciiRows(sourceWidth, sourceHeight, options);
  const data = await image
    .resize(options.columns, rows, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer();

  return createGridFromRgba(data, options.columns, rows, options);
}

export async function renderImageFileToAscii(filePath: string, options: ImageAsciiOptions) {
  const grid = await loadImageAsLuminanceGrid(filePath, options);

  return renderLuminanceGridToAscii(grid, options);
}
