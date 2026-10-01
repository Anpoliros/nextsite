import { visit } from 'unist-util-visit'

type HastNode = {
  type: string
  tagName?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
  value?: string
}

// ─── SVG helpers ─────────────────────────────────────────────────────────────

function svgNode(
  extraProps: Record<string, unknown>,
  children: HastNode[]
): HastNode {
  return {
    type: 'element',
    tagName: 'svg',
    properties: {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '14',
      height: '14',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      ...extraProps,
    },
    children,
  }
}

function el(
  tagName: string,
  properties: Record<string, unknown>,
  children: HastNode[] = []
): HastNode {
  return { type: 'element', tagName, properties, children }
}

// ─── Button builders ─────────────────────────────────────────────────────────

const BTN_CLS = ['transition-colors', 'focus:outline-none', 'flex', 'items-center']

function buildWrapButton(): HastNode {
  return el('button', {
    className: ['table-wrap-btn', 'text-gray-400', 'hover:text-gray-600', 'dark:hover:text-gray-200', ...BTN_CLS],
    title: 'Toggle Wrap',
    'aria-label': 'Toggle Wrap',
  }, [
    svgNode({}, [
      el('line',     { x1: '3', y1: '6',  x2: '21', y2: '6' }),
      el('path',     { d: 'M3 12h14a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H3' }),
      el('polyline', { points: '7 14 3 18 7 22' }),
    ]),
  ])
}

function buildCopyButton(): HastNode {
  return el('button', {
    className: ['table-copy-btn', 'text-gray-400', 'hover:text-gray-600', 'dark:hover:text-gray-200', ...BTN_CLS],
    title: 'Copy Table',
    'aria-label': 'Copy Table',
  }, [
    svgNode({ className: ['copy-icon'] }, [
      el('rect', { width: '14', height: '14', x: '8', y: '8', rx: '2', ry: '2' }),
      el('path', { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' }),
    ]),
    svgNode({ className: ['check-icon', 'hidden', 'text-emerald-500'] }, [
      el('polyline', { points: '20 6 9 17 4 12' }),
    ]),
  ])
}

// ─── Plugin ──────────────────────────────────────────────────────────────────

export function applyTable(processor: unknown) {
  // @ts-expect-error bypass processor type
  processor.use(() => (tree: unknown) => {
    // @ts-expect-error bypass AST type
    visit(tree, 'element', (node: HastNode) => {
      if (node.tagName !== 'table') return
      if ((node.properties ?? {})['data-table-processed']) return

      // Snapshot original table into a real <table> child
      const tableChild: HastNode = {
        type: 'element',
        tagName: 'table',
        properties: {
          ...(node.properties ?? {}),
          className: ['table-block-table'],
          'data-table-processed': true,
        },
        children: node.children ?? [],
      }

      // Transform the current node into the wrapper <div> in-place
      node.tagName = 'div'
      node.properties = { className: ['table-block-figure', 'not-prose'] }
      node.children = [
        // Transparent header bar with action buttons
        el('div', { className: ['table-block-header'] }, [
          el('div', { className: ['flex', 'items-center', 'gap-2'] }, [
            buildWrapButton(),
            buildCopyButton(),
          ]),
        ]),
        // Horizontally scrollable container
        el('div', { className: ['table-block-scroll'] }, [tableChild]),
      ]
    })
  })
}
