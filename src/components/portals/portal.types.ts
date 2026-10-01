export type PortalVariant = "desktop" | "mobile";

export type BackgroundConfig =
  | { type: "image"; value: string; opacity?: number }
  | { type: "color"; value: string; opacity?: number };

export interface PortalDef {
  href: string;
  logo: string;
  label: string;
}

export interface Placement {
  portal: string;
  row: number;
  col: number;
}

export interface VariantUI {
  aspectRatio: string;
  background: BackgroundConfig;
}

export interface VariantGrid {
  rows: number;
  cols: number;
}

export interface PortalsConfig {
  ui: Record<PortalVariant, VariantUI>;
  grid: Record<PortalVariant, VariantGrid>;
  portals: Record<string, PortalDef>;
  placements: Record<PortalVariant, Placement[]>;
  item: { touchScale: number; logoScale: number };
}
