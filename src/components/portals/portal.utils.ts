import type { PortalsConfig, PortalVariant, Placement } from "./portal.types";

export function parseAspectRatio(ar: string): number {
  const [w, h] = ar.split("/").map((s) => Number(s.trim()));
  if (!w || !h) return 1;
  return w / h;
}

export function computeCellAspect(panelAspect: number, rows: number, cols: number): number {
  if (cols === 0 || panelAspect === 0) return 1;
  return (panelAspect * rows) / cols;
}

// 闭式 min()：cellAspect<=1 时第一项胜出（按 cellW 缩放），>1 时第二项胜出（按 cellH 缩放）
export function touchWidthCss(touchScale: number, cellAspect: number): string {
  const a = touchScale * 100;
  const b = (touchScale / cellAspect) * 100;
  return `min(${a}%, ${b}%)`;
}

export function filterPlacements(
  placements: Placement[],
  portals: Record<string, unknown>,
  rows: number,
  cols: number,
): Placement[] {
  const seen = new Set<string>();
  const out: Placement[] = [];
  for (const p of placements) {
    if (p.row < 1 || p.row > rows) continue;
    if (p.col < 1 || p.col > cols) continue;
    if (!(p.portal in portals)) continue;
    const cellKey = `${p.row},${p.col}`;
    if (seen.has(cellKey)) continue;
    seen.add(cellKey);
    out.push(p);
  }
  return out;
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function getVariantConfig(config: PortalsConfig, variant: PortalVariant) {
  return {
    ui: config.ui[variant],
    grid: config.grid[variant],
    placements: config.placements[variant],
  };
}
