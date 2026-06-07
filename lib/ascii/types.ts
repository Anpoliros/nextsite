export type AsciiCharset = string | readonly string[];

export type AlphaAsciiMode = "threshold" | "density";

export type RgbColor = {
  red: number;
  green: number;
  blue: number;
};

export type LuminanceGrid = {
  width: number;
  height: number;
  data: ArrayLike<number>;
  alpha?: ArrayLike<number>;
  backgroundMask?: ArrayLike<boolean>;
};

export type AsciiRenderOptions = {
  columns: number;
  rows?: number;
  maxRows?: number;
  charset: AsciiCharset;
  invert?: boolean;
  contrast?: number;
  gamma?: number;
  autoLevels?: {
    enabled?: boolean;
    lowPercentile?: number;
    highPercentile?: number;
  };
  dither?: boolean;
  charAspectRatio?: number;
  alpha?: {
    enabled?: boolean;
    mode?: AlphaAsciiMode;
    threshold?: number;
    emptyChar?: string;
  };
  background?: {
    enabled?: boolean;
    color?: RgbColor;
    maxVariance?: number;
    emptyChar?: string;
  };
  trimTrailingWhitespace?: boolean;
};

export type ImageAsciiOptions = Omit<AsciiRenderOptions, "rows" | "charset"> & {
  rows?: number;
  charset: string;
};
