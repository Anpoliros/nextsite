import type { PortalDef } from "./portal.types";
import { isExternalHref, touchWidthCss } from "./portal.utils";

interface Props {
  portal: PortalDef;
  row: number;
  col: number;
  touchScale: number;
  logoScale: number;
  cellAspect: number;
}

export default function PortalItem({
  portal,
  row,
  col,
  touchScale,
  logoScale,
  cellAspect,
}: Props) {
  const external = isExternalHref(portal.href);
  const touchWidth = touchWidthCss(touchScale, cellAspect);
  const logoPct = `${logoScale * 100}%`;

  return (
    <a
      href={portal.href}
      aria-label={portal.label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex items-center justify-center w-full h-full focus-visible:outline-none rounded-sm"
      style={{ gridRowStart: row, gridColumnStart: col }}
    >
      <span
        className="flex items-center justify-center transition-opacity group-hover:opacity-80 group-focus-visible:ring-2 group-focus-visible:ring-blue-500 rounded-sm"
        style={{ width: touchWidth, aspectRatio: 1 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={portal.logo}
          alt=""
          loading="lazy"
          style={{ width: logoPct, height: logoPct, objectFit: "contain" }}
        />
      </span>
    </a>
  );
}
