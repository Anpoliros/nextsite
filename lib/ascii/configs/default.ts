import type { AsciiPreviewConfig } from "./type";

export const asciiCharsets = {
  visible: ".,:;irsXA253hMHGS#9B&@",
  minimal: " .:-=+*#%@",
  blocks: " .,:;irsXA253hMHGS#9B&@",
  solid: "  .:-=+*#%@",
} as const;

const defaultAsciiConfig = {
  columns: 96,
  maxRows: 48,
  charset: "visible",
  charsets: asciiCharsets,
  invert: false,
  contrast: 5,
  gamma: 1,
  autoLevels: {
    enabled: true,
    lowPercentile: 0.02,
    highPercentile: 0.98,
  },
  alpha: {
    enabled: true,
    mode: "threshold",
    threshold: 0,
    emptyChar: " ",
  },
  background: {
    enabled: false,
    color: {
      red: 255,
      green: 255,
      blue: 255,
    },
    maxVariance: 160,
    emptyChar: " ",
  },
  dither: false,
  charAspectRatio: 0.5,
  trimTrailingWhitespace: true,
} satisfies AsciiPreviewConfig;

export default defaultAsciiConfig;
