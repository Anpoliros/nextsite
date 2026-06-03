export type AsciiCharset = string | readonly string[];

export type LuminanceGrid = {
  width: number;
  height: number;
  data: ArrayLike<number>;
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
};

export type ImageAsciiOptions = Omit<AsciiRenderOptions, "rows" | "charset"> & {
  rows?: number;
  charset: string;
};
