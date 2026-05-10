import type { PortalsConfig, PortalVariant } from "./portal.types";
import {
  computeCellAspect,
  filterPlacements,
  getVariantConfig,
  parseAspectRatio,
} from "./portal.utils";
import PortalItem from "./PortalItem";

interface Props {
  config: PortalsConfig;
  variant: PortalVariant;
}

export default function PortalGrid({ config, variant }: Props) {
  const { ui, grid, placements } = getVariantConfig(config, variant);
  const panelAspect = parseAspectRatio(ui.aspectRatio);
  const cellAspect = computeCellAspect(panelAspect, grid.rows, grid.cols);
  const valid = filterPlacements(placements, config.portals, grid.rows, grid.cols);

  return (
    <div
      className="grid h-full w-full"
      style={{
        gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
      }}
    >
      {valid.map((p) => (
        <PortalItem
          key={`${p.row}-${p.col}`}
          portal={config.portals[p.portal]}
          row={p.row}
          col={p.col}
          touchScale={config.item.touchScale}
          logoScale={config.item.logoScale}
          cellAspect={cellAspect}
        />
      ))}
    </div>
  );
}
