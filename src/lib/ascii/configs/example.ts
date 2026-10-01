import type { AsciiPreviewConfigInput } from "./type";

const exampleAsciiConfig = {
  // 输出宽度，单位是终端字符列；数值越大细节越多。
  columns: 96,
  // 指定输出高度。通常省略，让程序根据图片比例和 charAspectRatio 自动推导。
  rows: undefined,
  // 自动推导高度时的上限，避免超出终端可视区域。
  maxRows: 48,
  // 当前使用的字符集名称，必须能在 charsets 中找到。
  charset: "visible",
  // 字符集从左到右表示由浅到深。visible 没有空格，适合观察边界。
  charsets: {
    visible: ".,:;irsXA253hMHGS#9B&@",
    minimal: " .:-=+*#%@",
    blocks: " .,:;irsXA253hMHGS#9B&@",
    solid: "  .:-=+*#%@",
  },
  // false 表示亮处使用更密的字符；深色终端里看照片通常保持 false。
  invert: false,
  // 对比度强度。1 接近原图；更大时边界更硬，更小时层次更柔。
  contrast: 5,
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
  // alpha 和背景抠图是两条独立规则。alpha 处理 PNG/WebP 的透明通道。
  alpha: {
    enabled: true,
    // threshold：低于阈值直接截断；density：半透明像素参与密度计算，边缘更柔。
    mode: "threshold",
    // 0 只截断完全透明；提高到 16/32 可清理半透明噪点。
    threshold: 0,
    // alpha 命中的空字符，独立于背景抠图的 emptyChar。
    emptyChar: " ",
  },
  // 背景色抠图独立于 alpha，适合白底 JPG/PNG。
  background: {
    enabled: false,
    // 要抠掉的目标背景色。
    color: {
      red: 255,
      green: 255,
      blue: 255,
    },
    // RGB 三通道平均平方误差上限。0 表示精确匹配；100 约等于每通道平均差 10。
    maxVariance: 160,
    // 背景色命中的空字符，独立于 alpha 的 emptyChar。
    emptyChar: " ",
  },
  // 开启 Floyd-Steinberg 抖动，低列数时层次更丰富，但纹理会更碎。
  dither: false,
  // 终端字符通常比图片像素更高更窄，用这个比例修正自动高度。
  charAspectRatio: 0.5,
  // 终端预览默认裁掉行尾空格；站内组件需要保持矩形时应关闭。
  trimTrailingWhitespace: true,
} satisfies AsciiPreviewConfigInput;

export default exampleAsciiConfig;
