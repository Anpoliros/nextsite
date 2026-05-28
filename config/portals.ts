import type { PortalsConfig } from "@/components/portals/portal.types";

// Portals 入口面板配置
export const portalsConfig = {
  ui: {
    desktop: {
      aspectRatio: "4 / 5",
      background: { type: "image", value: "/images/portal-bg-desktop.webp", opacity: 0 },
    },
    mobile: {
      aspectRatio: "5 / 1",
      background: { type: "image", value: "/images/portal-bg-mobile.webp", opacity: 0 },
    },
  },
  grid: {
    desktop: { rows: 3, cols: 2 },
    mobile:  { rows: 1, cols: 5 },
  },
  portals: {
    git:    { href: "https://git.anpoliros.com",   logo: "/logos/gitea.svg",    label: "Git" },
    vsss:   { href: "https://vsss.anpoliros.com",         logo: "/logos/win7-monitor.png",   label: "VSSS" },
    status: { href: "https://status.anpoliros.com",  logo: "/logos/win7-status.png", label: "Status" },
  },
  placements: {
    desktop: [
      { portal: "git",    row: 2, col: 2 },
      { portal: "vsss",   row: 3, col: 1 },
      { portal: "status", row: 3, col: 2 },
    ],
    mobile: [
      { portal: "git",    row: 1, col: 2 },
      { portal: "vsss",   row: 1, col: 3 },
      { portal: "status", row: 1, col: 4 },
    ],
  },
  item: { touchScale: 0.8, logoScale: 0.5 },
} satisfies PortalsConfig;
