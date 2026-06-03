const asciiCharsets = {
  // 从左到右表示由浅到深。visible 没有空格，适合观察边界和调试转换效果。
  visible: ".,:;irsXA253hMHGS#9B&@",
  // 保留空白背景，终端效果更轻，但图片边缘会更依赖对比度。
  minimal: " .:-=+*#%@",
  // 层次最多，适合人物或插画；字母会带来更强的纹理感。
  blocks: " .,:;irsXA253hMHGS#9B&@",
  // 高反差预览用，字符少，形状更硬。
  solid: "  .:-=+*#%@",
} as const;

type AsciiCharsetName = keyof typeof asciiCharsets;

type AsciiConfig = {
  terminal: {
    columns: number;
    maxRows: number;
    charset: AsciiCharsetName;
    invert: boolean;
    contrast: number;
    gamma: number;
    autoLevels: {
      enabled: boolean;
      lowPercentile: number;
      highPercentile: number;
    };
    dither: boolean;
    charAspectRatio: number;
  };
  charsets: typeof asciiCharsets;
};

// 字符画默认参数：终端预览和后续站内占位都从这里取基础配置
export const asciiConfig = {
  terminal: {
    // 输出宽度，单位是终端字符列；数值越大细节越多。
    columns: 96,
    // 自动推导高度时的上限，避免超出终端可视区域。
    maxRows: 48,
    // 使用上方 charsets 中的字符集。字符集从左到右对应由浅到深。
    charset: "visible",
    // false 表示亮处使用更密的字符；深色终端里看照片通常保持 false。
    invert: false,
    // 对比度强度。1 接近原图；更大时边界更硬，更小时层次更柔。
    contrast: 2.0,
    // 中间调校正。大于 1 会提亮中间调，小于 1 会压暗中间调。
    gamma: 1,
    // 自动拉伸亮度分布，让输出尽量使用完整字符集，避免整片挤在少数字符上。
    autoLevels: {
      enabled: true,
      // 忽略最暗的少量像素，减少极端噪点影响。
      lowPercentile: 0.02,
      // 忽略最亮的少量像素，保留主体区域的层次。
      highPercentile: 0.98,
    },
    // 开启 Floyd-Steinberg 抖动，低列数时层次更丰富，但纹理会更碎。
    dither: false,
    // 终端字符通常比图片像素更高更窄，用这个比例修正自动高度。
    charAspectRatio: 0.5,
  },
  charsets: asciiCharsets,
} satisfies AsciiConfig;
