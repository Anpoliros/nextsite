import Image from "next/image";
import type { PortalsConfig, PortalVariant } from "./portal.types";
import PortalGrid from "./PortalGrid";

interface Props {
  config: PortalsConfig;
  variant: PortalVariant;
  className?: string;
}

export default function Portals({ config, variant, className = "" }: Props) {
  const ui = config.ui[variant];
  const bg = ui.background;
  const opacity = bg.opacity ?? 1;

  return (
    <section
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: ui.aspectRatio }}
    >
      <div className="absolute inset-0" style={{ opacity }}>
        {bg.type === "image" ? (
          <Image
            src={bg.value}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 30vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: bg.value }} />
        )}
      </div>

      <div className="relative h-full w-full">
        <PortalGrid config={config} variant={variant} />
      </div>
    </section>
  );
}
