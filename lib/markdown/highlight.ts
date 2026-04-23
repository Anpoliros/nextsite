import rehypePrettyCode from 'rehype-pretty-code';
import { visit } from 'unist-util-visit';
import { mdConfig } from '@/md.config';

export function applyHighlight(processor: unknown) {
  // 1. 应用 rehype-pretty-code 给 pre, code 加色
  // @ts-expect-error bypass processor type check
  processor.use(rehypePrettyCode, {
    theme: {
      light: mdConfig.features.codeThemeLight || "github-light",
      dark: mdConfig.features.codeThemeDark || "github-dark",
    },
    keepBackground: true,
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
      // rehype-pretty-code 默认包裹的区块属性
      if (node.tagName !== 'figure') return;
      const properties = node.properties as Record<string, unknown>;
      if (!('data-rehype-pretty-code-figure' in properties)) return;

      // 给外层 figure 添加基础的样式（保持整体一块），overflow-hidden 用于圆角
      properties.className = [
        ...(Array.isArray(properties.className) ? properties.className : []),
        'relative', 'group', 'rounded-xl', 'overflow-hidden', 'my-6', 'border', 'border-gray-200', 'dark:border-white/10'
      ];

      // 解析语种
      const language = String(properties['data-language'] || properties.dataLanguage || 'text');

      // 构建整个顶部的 Header，包括语种和两颗小按键的 HTML（SVG 内联）
      const header = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['flex', 'items-center', 'justify-between', 'px-4', 'py-2', 'bg-gray-50/50', 'dark:bg-gray-800/50', 'border-b', 'border-gray-200', 'dark:border-white/10', 'text-xs', 'text-gray-400', 'z-10'],
        },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['font-mono', 'select-none', 'tracking-wider'] },
            children: [{ type: 'text', value: language }]
          },
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['flex', 'items-center', 'gap-2'] },
            children: [
              // 折行按钮
              {
                type: 'element',
                tagName: 'button',
                properties: {
                  className: ['code-wrap-btn', 'text-gray-400', 'hover:text-gray-600', 'dark:hover:text-gray-200', 'transition-colors', 'focus:outline-none'],
                  title: 'Toggle Wrap',
                  'aria-label': 'Toggle Wrap'
                },
                children: [{
                  type: 'element',
                  tagName: 'svg',
                  properties: { xmlns: 'http://www.w3.org/2000/svg', width: '14.5', height: '14.5', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
                  children: [
                    { type: 'element', tagName: 'line', properties: { x1: '3', y1: '6', x2: '21', y2: '6' }, children: [] },
                    { type: 'element', tagName: 'path', properties: { d: 'M3 12h14a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H3' }, children: [] },
                    { type: 'element', tagName: 'polyline', properties: { points: '7 14 3 18 7 22' }, children: [] }
                  ]
                }]
              },
              // 复制按钮
              {
                type: 'element',
                tagName: 'button',
                properties: {
                  className: ['code-copy-btn', 'text-gray-400', 'hover:text-gray-600', 'dark:hover:text-gray-200', 'transition-colors', 'focus:outline-none'],
                  title: 'Copy Code',
                  'aria-label': 'Copy Code'
                },
                children: [
                  {
                    type: 'element',
                    tagName: 'svg',
                    properties: { className: ['copy-icon'], xmlns: 'http://www.w3.org/2000/svg', width: '14.5', height: '14.5', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
                    children: [
                      { type: 'element', tagName: 'rect', properties: { width: '14', height: '14', x: '8', y: '8', rx: '2', ry: '2' }, children: [] },
                      { type: 'element', tagName: 'path', properties: { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' }, children: [] }
                    ]
                  },
                  {
                    type: 'element',
                    tagName: 'svg',
                    properties: { className: ['check-icon', 'hidden', 'text-emerald-500'], xmlns: 'http://www.w3.org/2000/svg', width: '14.5', height: '14.5', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
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

      // 调整内部 pre 的样式
      const preNode = (node.children as Record<string, unknown>[]).find((child: Record<string, unknown>) => child.tagName === 'pre');
      if (preNode) {
        // @ts-expect-error bypass any cast
        preNode.properties.className = [...(Array.isArray((preNode.properties as Record<string, unknown>)?.className) ? (preNode.properties as Record<string, unknown>).className as unknown[] : []), 'overflow-x-auto', 'p-5', 'pb-6', 'text-sm', 'leading-relaxed'];
        
        // 允许子包含 code 的背景继承 pre 的背景色，或使用 tailwind 定义的色值
      }

      // 将 header 推入首位
      (node.children as Record<string, unknown>[]).unshift(header);
    });
  });
}