import type { AsciiRenderOptions, LuminanceGrid } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeCharset(charset: AsciiRenderOptions["charset"]) {
  const chars = Array.isArray(charset) ? charset : Array.from(charset);

  if (chars.length < 2) {
    throw new Error("ASCII charset must contain at least two characters.");
  }

  return chars;
}

function adjustContrast(value: number, contrast: number) {
  const normalized = clamp(value / 255, 0, 1);

  if (contrast === 1) {
    return value;
  }

  if (contrast < 1) {
    return clamp((0.5 + (normalized - 0.5) * contrast) * 255, 0, 255);
  }

  const curved = 0.5 + Math.tanh((normalized - 0.5) * contrast) / (2 * Math.tanh(contrast / 2));

  return clamp(curved * 255, 0, 255);
}

function adjustGamma(value: number, gamma: number) {
  const normalized = clamp(value / 255, 0, 1);
  const corrected = gamma === 1 ? normalized : normalized ** (1 / gamma);

  return clamp(corrected * 255, 0, 255);
}

function getPercentile(sortedValues: number[], percentile: number) {
  const index = Math.round(clamp(percentile, 0, 1) * (sortedValues.length - 1));

  return sortedValues[index] ?? 0;
}

function normalizeLevels(values: number[], options: RequiredAsciiOptions) {
  if (!options.autoLevels.enabled || values.length === 0) {
    return values;
  }

  const sortedValues = [...values].sort((left, right) => left - right);
  const low = getPercentile(sortedValues, options.autoLevels.lowPercentile);
  const high = getPercentile(sortedValues, options.autoLevels.highPercentile);

  if (high <= low) {
    return values;
  }

  return values.map((value) => {
    return clamp(((value - low) / (high - low)) * 255, 0, 255);
  });
}

function prepareLuminanceValues(grid: LuminanceGrid, options: RequiredAsciiOptions) {
  const values = Array.from({ length: grid.width * grid.height }, (_, index) => grid.data[index] ?? 0);
  const leveledValues = normalizeLevels(values, options);

  return leveledValues.map((value) => adjustGamma(adjustContrast(value, options.contrast), options.gamma));
}

function luminanceToCharIndex(value: number, charCount: number, invert: boolean) {
  const normalized = clamp(value / 255, 0, 1);
  const visualValue = invert ? 1 - normalized : normalized;

  return clamp(Math.round(visualValue * (charCount - 1)), 0, charCount - 1);
}

function renderWithoutDither(grid: LuminanceGrid, chars: string[], options: RequiredAsciiOptions) {
  const values = prepareLuminanceValues(grid, options);
  const rows: string[] = [];

  for (let y = 0; y < grid.height; y += 1) {
    let row = "";

    for (let x = 0; x < grid.width; x += 1) {
      const offset = y * grid.width + x;
      row += chars[luminanceToCharIndex(values[offset] ?? 0, chars.length, options.invert)];
    }

    rows.push(row.trimEnd());
  }

  return rows.join("\n");
}

function renderWithDither(grid: LuminanceGrid, chars: string[], options: RequiredAsciiOptions) {
  const values = prepareLuminanceValues(grid, options);
  const rows: string[] = [];

  const spreadError = (x: number, y: number, error: number, factor: number) => {
    if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) {
      return;
    }

    const offset = y * grid.width + x;
    values[offset] = clamp(values[offset] + error * factor, 0, 255);
  };

  for (let y = 0; y < grid.height; y += 1) {
    let row = "";

    for (let x = 0; x < grid.width; x += 1) {
      const offset = y * grid.width + x;
      const current = values[offset] ?? 0;
      const charIndex = luminanceToCharIndex(current, chars.length, options.invert);
      const quantized = (charIndex / (chars.length - 1)) * 255;
      const target = options.invert ? 255 - quantized : quantized;
      const error = current - target;

      row += chars[charIndex];

      // Floyd-Steinberg 扩散，低列数预览时能保留更多层次。
      spreadError(x + 1, y, error, 7 / 16);
      spreadError(x - 1, y + 1, error, 3 / 16);
      spreadError(x, y + 1, error, 5 / 16);
      spreadError(x + 1, y + 1, error, 1 / 16);
    }

    rows.push(row.trimEnd());
  }

  return rows.join("\n");
}

type RequiredAsciiOptions = Required<Pick<AsciiRenderOptions, "contrast" | "gamma" | "invert" | "dither">> & {
  autoLevels: {
    enabled: boolean;
    lowPercentile: number;
    highPercentile: number;
  };
};

export function renderLuminanceGridToAscii(grid: LuminanceGrid, options: AsciiRenderOptions) {
  if (grid.width <= 0 || grid.height <= 0) {
    throw new Error("ASCII luminance grid must have a positive width and height.");
  }

  const chars = normalizeCharset(options.charset);
  const resolvedOptions: RequiredAsciiOptions = {
    contrast: options.contrast ?? 1,
    gamma: options.gamma ?? 1,
    invert: options.invert ?? false,
    dither: options.dither ?? false,
    autoLevels: {
      enabled: options.autoLevels?.enabled ?? true,
      lowPercentile: options.autoLevels?.lowPercentile ?? 0.02,
      highPercentile: options.autoLevels?.highPercentile ?? 0.98,
    },
  };

  return resolvedOptions.dither
    ? renderWithDither(grid, chars, resolvedOptions)
    : renderWithoutDither(grid, chars, resolvedOptions);
}

export function resolveAsciiRows(imageWidth: number, imageHeight: number, options: AsciiRenderOptions) {
  if (options.rows) {
    return options.maxRows ? Math.min(options.rows, options.maxRows) : options.rows;
  }

  const aspectRatio = imageHeight / Math.max(1, imageWidth);
  const charAspectRatio = options.charAspectRatio ?? 0.5;
  const rows = Math.max(1, Math.round(options.columns * aspectRatio * charAspectRatio));

  return options.maxRows ? Math.min(rows, options.maxRows) : rows;
}
