import rehypePrettyCode from 'rehype-pretty-code';
import { visit } from 'unist-util-visit';
import { mdConfig } from '@/md.config';

// ---- 辅助函数：提取语种 ----
function extractLanguage(preNode: Record<string, unknown> | null): string {
  if (!preNode || !preNode.properties) return '';
  
  const props = preNode.properties as Record<string, unknown>;
  const langProp = props['data-language'];
  
  if (langProp && langProp !== 'text' && langProp !== 'plaintext') {
    return String(langProp);
  }
  
  const classes = props.className as string[];
  if (Array.isArray(classes)) {
    const langClass = classes.find(c => c.startsWith('language-'));
    if (langClass) {
      const cleaned = langClass.replace('language-', '');
      if (cleaned !== 'text' && cleaned !== 'plaintext') return cleaned;
    }
  }
  
  return '';
}

// ---- 辅助函数：构建顶部 Header DOM ----
function buildHeaderNode(language: string) {
  return {
    type: 'element',
    tagName: 'div',
    properties: {
      className: ['code-block-header'],
      style: `background: var(--code-header-bg, transparent);`
    },
    children: [
      {
        type: 'element',
        tagName: 'div',
        properties: { className: ['flex', 'items-center', 'gap-4'] },
        children: [
          // 语种 Label
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['font-mono', 'select-none', 'tracking-wider'] },
            children: [{ type: 'text', value: language }]
          },
          // 折行按钮
          {
            type: 'element',
            tagName: 'button',
            properties: {
              className: ['code-wrap-btn', 'text-gray-400', 'hover:text-gray-600', 'dark:hover:text-gray-200', 'transition-colors', 'focus:outline-none', 'flex', 'items-center', 'gap-1'],
              title: 'Toggle Wrap',
              'aria-label': 'Toggle Wrap'
            },
            children: [
              {
                type: 'element',
                tagName: 'svg',
                properties: { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
                children: [
                  { type: 'element', tagName: 'line', properties: { x1: '3', y1: '6', x2: '21', y2: '6' }, children: [] },
                  { type: 'element', tagName: 'path', properties: { d: 'M3 12h14a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H3' }, children: [] },
                  { type: 'element', tagName: 'polyline', properties: { points: '7 14 3 18 7 22' }, children: [] }
                ]
              }
            ]
          },
          // 复制按钮
          {
            type: 'element',
            tagName: 'button',
            properties: {
              className: ['code-copy-btn', 'text-gray-400', 'hover:text-gray-600', 'dark:hover:text-gray-200', 'transition-colors', 'focus:outline-none', 'flex', 'items-center', 'gap-1'],
              title: 'Copy Code',
              'aria-label': 'Copy Code'
            },
            children: [
              {
                type: 'element',
                tagName: 'svg',
                properties: { className: ['copy-icon'], xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
                children: [
                  { type: 'element', tagName: 'rect', properties: { width: '14', height: '14', x: '8', y: '8', rx: '2', ry: '2' }, children: [] },
                  { type: 'element', tagName: 'path', properties: { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' }, children: [] }
                ]
              },
              {
                type: 'element',
                tagName: 'svg',
                properties: { className: ['check-icon', 'hidden', 'text-emerald-500'], xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
                children: [
                  { type: 'element', tagName: 'polyline', properties: { points: '20 6 9 17 4 12' }, children: [] }
                ]
              }
            ]
          }
        ]
      }
    ]
  };
}

export function applyHighlight(processor: unknown) {
  // 1. 应用 rehype-pretty-code 给 pre, code 加色
  // @ts-expect-error bypass processor type check
  processor.use(rehypePrettyCode, {
    theme: {
      light: mdConfig.features.codeThemeLight || "github-light",
      dark: mdConfig.features.codeThemeDark || "github-dark",
    },
    keepBackground: true,
    defaultLang: {
      block: 'text',
      inline: 'plaintext'
    },
    onVisitLine(node: { children: unknown[] }) {
      if (node.children.length === 0) {
        node.children = [{ type: 'text', value: ' ' }];
      }
    },
  });

  // 2. 自定义插件：在构建期将包含语种、复制、折行按键的 header DOM 节点写入 figure
  // @ts-expect-error bypass processor type check
  processor.use(() => (tree: unknown) => {
    // @ts-expect-error bypass AST search type
    visit(tree, 'element', (node: Record<string, unknown>) => {
      // 兼容某些未指定语言的代码块（rehype-pretty-code 或 remark 可能会将其呈现为 pre），如果有需要我们可以统一在包裹外层
      let isCodeBlock = false;
      let preNode: Record<string, unknown> | null = null;
      let preNodeIndex = -1;

      if (node.tagName === 'figure' && 'data-rehype-pretty-code-figure' in (node.properties as Record<string, unknown>)) {
        if ((node.properties as Record<string, unknown>)?.['data-processed']) return; // 避免重复处理
        (node.properties as Record<string, unknown>)['data-processed'] = true;

        isCodeBlock = true;
        preNodeIndex = (node.children as Record<string, unknown>[]).findIndex((child: Record<string, unknown>) => child.tagName === 'pre');
        preNode = preNodeIndex !== -1 ? (node.children as Record<string, unknown>[])[preNodeIndex] : null;
        if (preNode) {
          if (!preNode.properties) preNode.properties = {};
          (preNode.properties as Record<string, unknown>)['data-processed'] = true;
        }
      } else if (node.tagName === 'pre' && !(node.properties as Record<string, unknown>)?.['data-processed']) {
        const hasCodeChild = (node.children as Record<string, unknown>[]).some((child: Record<string, unknown>) => child.tagName === 'code');
        if (hasCodeChild) {
           // 处理原生的 pre 节点（通常对应没有写语言或未经过 pretty-code figure 包裹的代码块）
           // 我们可以把这个节点伪装转换成外层 container
           isCodeBlock = true;
           preNodeIndex = 0;
           // 将自身的数据转移给内部
           preNode = {
             type: 'element',
             tagName: 'pre',
             properties: { ...((node.properties || {}) as Record<string, unknown>), 'data-processed': true },
             children: [...(node.children as Record<string, unknown>[])]
           };
           node.tagName = 'figure';
           node.children = [preNode];
           if (!node.properties) node.properties = {};
        }
      }

      if (!isCodeBlock) return;

      const properties = node.properties as Record<string, unknown>;

      // 给外层 figure 添加基础的样式（保持整体一块），这部分类名定义已移动到 globals.css 的 .code-block-figure 中
      properties.className = [
        ...(Array.isArray(properties.className) ? properties.className : []),
        'code-block-figure', 'group'
      ];

      // 解析语种
      const language = extractLanguage(preNode);
      if (preNode && preNode.properties) {
        // 提取 pre 的内联 style，转移给外层 figure
        const preProps = preNode.properties as Record<string, unknown>;
        if (preProps.style) {
          properties.style = preProps.style;
          delete preProps.style; // 移除 pre 原有内联以防止遮盖 padding 造成的背景缺失
        }
      }

      // 构建整个顶部的 Header
      const header = buildHeaderNode(language);

      if (preNode) {
        // 创建代码container，增加空隙（padding）
        const codeContainer = {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['code-block-container']
          },
          children: [preNode]
        };

        // 调整内部 pre 的样式，移除背景以便继承外层
        // @ts-expect-error bypass any cast
        preNode.properties.className = [...(Array.isArray((preNode.properties as Record<string, unknown>)?.className) ? (preNode.properties as Record<string, unknown>).className as unknown[] : []), 'code-block-pre'];

        // 替换原有的 preNode 为 container
        (node.children as Record<string, unknown>[])[preNodeIndex] = codeContainer;
      }

      // 将 header 推入首位
      (node.children as Record<string, unknown>[]).unshift(header);
    });
  });
}