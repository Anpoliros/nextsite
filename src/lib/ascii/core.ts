import type { AsciiRenderOptions, LuminanceGrid } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampByte(value: number) {
  return Math.round(clamp(value, 0, 255));
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

function normalizeLevels(values: number[], options: RequiredAsciiOptions, grid: LuminanceGrid) {
  if (!options.autoLevels.enabled || values.length === 0) {
    return values;
  }

  const visibleValues = values.filter((_, index) => getMaskChar(grid, index, options) === undefined);
  const sortedValues = (visibleValues.length > 0 ? visibleValues : values).sort((left, right) => left - right);
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
  const values = Array.from({ length: grid.width * grid.height }, (_, index) => {
    const value = grid.data[index] ?? 0;
    const alpha = grid.alpha?.[index] ?? 255;

    if (!options.alpha.enabled || options.alpha.mode !== "density" || alpha <= options.alpha.threshold) {
      return value;
    }

    const alphaRatio = clamp(alpha / 255, 0, 1);
    const emptyLuminance = options.invert ? 255 : 0;

    return value * alphaRatio + emptyLuminance * (1 - alphaRatio);
  });
  const leveledValues = normalizeLevels(values, options, grid);

  return leveledValues.map((value) => adjustGamma(adjustContrast(value, options.contrast), options.gamma));
}

function luminanceToCharIndex(value: number, charCount: number, invert: boolean) {
  const normalized = clamp(value / 255, 0, 1);
  const visualValue = invert ? 1 - normalized : normalized;

  return clamp(Math.round(visualValue * (charCount - 1)), 0, charCount - 1);
}

function getMaskChar(grid: LuminanceGrid, index: number, options: RequiredAsciiOptions) {
  const alpha = grid.alpha?.[index];

  if (options.alpha.enabled && alpha !== undefined && alpha <= options.alpha.threshold) {
    return options.alpha.emptyChar;
  }

  if (options.background.enabled && grid.backgroundMask?.[index]) {
    return options.background.emptyChar;
  }

  return undefined;
}

function finishRow(row: string, options: RequiredAsciiOptions) {
  return options.trimTrailingWhitespace ? row.trimEnd() : row;
}

function renderWithoutDither(grid: LuminanceGrid, chars: string[], options: RequiredAsciiOptions) {
  const values = prepareLuminanceValues(grid, options);
  const rows: string[] = [];

  for (let y = 0; y < grid.height; y += 1) {
    let row = "";

    for (let x = 0; x < grid.width; x += 1) {
      const offset = y * grid.width + x;
      const maskChar = getMaskChar(grid, offset, options);

      row += maskChar ?? chars[luminanceToCharIndex(values[offset] ?? 0, chars.length, options.invert)];
    }

    rows.push(finishRow(row, options));
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
      const maskChar = getMaskChar(grid, offset, options);

      if (maskChar !== undefined) {
        row += maskChar;
        continue;
      }

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

    rows.push(finishRow(row, options));
  }

  return rows.join("\n");
}

type RequiredAsciiOptions = Required<Pick<AsciiRenderOptions, "contrast" | "gamma" | "invert" | "dither">> & {
  autoLevels: {
    enabled: boolean;
    lowPercentile: number;
    highPercentile: number;
  };
  alpha: {
    enabled: boolean;
    mode: "threshold" | "density";
    threshold: number;
    emptyChar: string;
  };
  background: {
    enabled: boolean;
    emptyChar: string;
  };
  trimTrailingWhitespace: boolean;
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
    alpha: {
      enabled: options.alpha?.enabled ?? false,
      mode: options.alpha?.mode ?? "threshold",
      threshold: clampByte(options.alpha?.threshold ?? 0),
      emptyChar: options.alpha?.emptyChar ?? " ",
    },
    background: {
      enabled: options.background?.enabled ?? false,
      emptyChar: options.background?.emptyChar ?? " ",
    },
    trimTrailingWhitespace: options.trimTrailingWhitespace ?? true,
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
