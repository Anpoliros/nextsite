import path from 'path';

/**
 * Markdown 解析器全局配置
 */
export const mdConfig = {
  // Markdown 原片存放的绝对路径
  contentDir: path.join(process.cwd(), 'content'),
  
  // 转换规则设置（通过在此处控制开关和行为）
  features: {
    // 启用 GitHub 风格的 Markdown（表格、删除线、任务列表等）
    enableGfm: true,
    // 自动为 Heading 生成 ID（方便锚点跳转）
    enableHeadingId: true,
    // 代码高亮
    enableHighlight: true,
    
    // rehype-pretty-code 提供的主题名称。采用 VS Code 的语法高亮设计。
    // https://shiki.style/themes
    codeThemeLight: "min-light",
    codeThemeDark: "github-dark",
    
    // 代码块 header 的背景颜色（可自定义）
    codeHeaderBgLight: "white",
    codeHeaderBgDark: "transparent",
  }
};
