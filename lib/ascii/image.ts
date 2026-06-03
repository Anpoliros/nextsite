import sharp from "sharp";
import { renderLuminanceGridToAscii, resolveAsciiRows } from "./core";
import type { ImageAsciiOptions, LuminanceGrid } from "./types";

export async function loadImageAsLuminanceGrid(filePath: string, options: ImageAsciiOptions): Promise<LuminanceGrid> {
  const image = sharp(filePath, { limitInputPixels: 40_000_000 });
  const metadata = await image.metadata();
  const sourceWidth = metadata.width ?? options.columns;
  const sourceHeight = metadata.height ?? options.rows ?? options.columns;
  const rows = resolveAsciiRows(sourceWidth, sourceHeight, options);
  const data = await image
    .resize(options.columns, rows, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer();

  return {
    width: options.columns,
    height: rows,
    data,
  };
}

export async function renderImageFileToAscii(filePath: string, options: ImageAsciiOptions) {
  const grid = await loadImageAsLuminanceGrid(filePath, options);

  return renderLuminanceGridToAscii(grid, options);
}
