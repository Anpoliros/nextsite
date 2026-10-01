import type { AlphaAsciiMode, RgbColor } from "../types";

export type AsciiPreviewConfig = {
  columns: number;
  rows?: number;
  maxRows: number;
  charset: string;
  charsets: Record<string, string>;
  invert: boolean;
  contrast: number;
  gamma: number;
  autoLevels: {
    enabled: boolean;
    lowPercentile: number;
    highPercentile: number;
  };
  alpha: {
    enabled: boolean;
    mode: AlphaAsciiMode;
    threshold: number;
    emptyChar: string;
  };
  background: {
    enabled: boolean;
    color: RgbColor;
    maxVariance: number;
    emptyChar: string;
  };
  dither: boolean;
  charAspectRatio: number;
  trimTrailingWhitespace: boolean;
};

export type DeepPartial<T> = {
  [Key in keyof T]?: T[Key] extends readonly unknown[]
    ? T[Key]
    : T[Key] extends object
      ? DeepPartial<T[Key]>
      : T[Key];
};

export type AsciiPreviewConfigInput = DeepPartial<AsciiPreviewConfig>;
