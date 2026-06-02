"use client";

import type { CSSProperties, RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { homeConfig } from "@/config/home";
import type { HomeTheme } from "@/config/home";

type CloudDepth = "far" | "middle" | "near";
type CloudZone = "middle" | "bottom" | "footer";

type Cloud = {
  id: string;
  zone: CloudZone;
  depth: CloudDepth;
  className: string;
  top: number;
  left: number;
  width: number;
  fontSize: number;
  speed: number;
  drift: number;
  zIndex: number;
  opacity: number;
  seed: string;
  bumpCount: number;
};

type Star = {
  id: string;
  top: number;
  left: number;
  char: string;
  opacity: number;
  fontSize: number;
};

type Meteor = {
  id: string;
  top: number;
  left: number;
  delay: number;
  duration: number;
};

type SceneMeasurements = {
  width: number;
  height: number;
};

const STAR_CHARS = [".", "*", "+", "'"];

function createSeededRandom(seed: string) {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return function random() {
    hash += hash << 13;
    hash ^= hash >>> 7;
    hash += hash << 3;
    hash ^= hash >>> 17;
    hash += hash << 5;

    return ((hash >>> 0) % 10000) / 10000;
  };
}

function pickFrom<T>(items: T[], random: () => number) {
  return items[Math.floor(random() * items.length)];
}

function isInsideCloud(
  x: number,
  y: number,
  bottom: number,
  bumps: { center: number; radius: number; height: number }[],
) {
  if (y > bottom) {
    return false;
  }

  const baseTop = bottom - 3;
  const baseHeight = 3.6;
  const base = ((y - baseTop) / baseHeight) ** 2 + ((x - 0.5) / 0.58) ** 2 <= 1;
  const bump = bumps.some((item) => {
    const xRadius = item.radius;
    const yRadius = item.height;
    const centerY = bottom - item.height * 0.82;

    return ((x - item.center) / xRadius) ** 2 + ((y - centerY) / yRadius) ** 2 <= 1;
  });

  return base || bump;
}

function createAsciiCloud(widthChars: number, heightChars: number, bumpCount: number, seed: string) {
  const random = createSeededRandom(seed);
  const width = Math.max(42, Math.round(widthChars));
  const height = Math.max(13, Math.round(heightChars));
  const bottom = height - 3;
  const bumpLift = homeConfig.asciiScene.clouds.shape.bumpLift;
  const bumps = Array.from({ length: bumpCount }, (_, index) => {
    const slot = index / Math.max(1, bumpCount - 1);

    return {
      center: Math.min(0.88, Math.max(0.12, 0.14 + slot * 0.72 + (random() - 0.5) * 0.12)),
      radius: 0.13 + random() * 0.08,
      height: height * (0.28 + random() * 0.16) * bumpLift,
    };
  });

  const rows = Array.from({ length: height }, (_, y) => {
    const chars = Array.from({ length: width }, () => " ");

    for (let x = 0; x < width; x += 1) {
      const nx = x / Math.max(1, width - 1);
      const inside = isInsideCloud(nx, y, bottom, bumps);

      if (!inside) {
        continue;
      }

      const leftEmpty = !isInsideCloud((x - 1) / Math.max(1, width - 1), y, bottom, bumps);
      const rightEmpty = !isInsideCloud((x + 1) / Math.max(1, width - 1), y, bottom, bumps);
      const topEmpty = !isInsideCloud(nx, y - 1, bottom, bumps);
      const bottomEmpty = !isInsideCloud(nx, y + 1, bottom, bumps);

      if (y === bottom) {
        chars[x] = "_";
      } else if (leftEmpty && topEmpty) {
        chars[x] = ".";
      } else if (rightEmpty && topEmpty) {
        chars[x] = ".";
      } else if (leftEmpty) {
        chars[x] = "(";
      } else if (rightEmpty) {
        chars[x] = ")";
      } else if (topEmpty) {
        chars[x] = random() > 0.45 ? "-" : ".";
      } else if (bottomEmpty && y > bottom - 2) {
        chars[x] = "_";
      } else if (random() > 0.97 && y < bottom - 2) {
        chars[x] = ".";
      }
    }

    return chars.join("").trimEnd();
  });

  return rows.join("\n");
}

function createCloud(
  id: string,
  mode: HomeTheme,
  zone: CloudZone,
  random: () => number,
  index: number,
): Cloud {
  const isBottom = zone === "bottom";
  const depth = pickFrom<CloudDepth>(isBottom ? ["middle", "near", "near"] : ["far", "middle", "middle"], random);
  const width = isBottom ? 54 + random() * 18 : 42 + random() * 18;
  const top = zone === "middle" ? 38 + random() * 24 : 68 + random() * 21;
  const left = zone === "middle" ? -2 + random() * 58 : -10 + random() * 54;
  const speedMap: Record<CloudDepth, number> = { far: -0.03, middle: -0.075, near: -0.13 };
  const zIndexMap: Record<CloudDepth, number> = { far: 1, middle: 2, near: 3 };

  return {
    id,
    zone,
    depth,
    className: homeConfig.asciiScene.clouds.classNames[mode][depth],
    top,
    left,
    width,
    fontSize: isBottom ? 13 + random() * 2 : 12 + random() * 2,
    speed: speedMap[depth],
    drift: (random() - 0.5) * 0.04,
    zIndex: zIndexMap[depth] + index,
    opacity: 0.8 + random() * 0.2,
    seed: `${id}-${mode}`,
    bumpCount: isBottom ? 4 + Math.round(random() * 2) : 3 + Math.round(random() * 2),
  };
}

function createFooterClouds(mode: HomeTheme): Cloud[] {
  const className = homeConfig.asciiScene.clouds.classNames[mode].footer;
  const footerClouds = [
    { width: 60, left: -3, top: 99, fontSize: 13, speed: -0.012, drift: -0.006, opacity: 0.66, bumpCount: 6 },
    { width: 50, left: 27, top: 101, fontSize: 14, speed: -0.02, drift: 0.005, opacity: 0.78, bumpCount: 5 },
    { width: 40, left: 58, top: 103, fontSize: 15, speed: -0.028, drift: -0.006, opacity: 0.9, bumpCount: 4 },
  ];

  return footerClouds.map((cloud, index) => ({
    id: `footer-cloud-${index}`,
    zone: "footer",
    depth: index === 0 ? "far" : index === 1 ? "middle" : "near",
    className,
    top: cloud.top,
    left: cloud.left,
    width: cloud.width,
    fontSize: cloud.fontSize,
    speed: cloud.speed,
    drift: cloud.drift,
    zIndex: 4 + index,
    opacity: cloud.opacity,
    seed: `footer-cloud-${mode}-${index}`,
    bumpCount: cloud.bumpCount,
  }));
}

function createCloudScene(mode: HomeTheme) {
  if (!homeConfig.asciiScene.clouds.enabled) {
    return [];
  }

  const random = createSeededRandom(`${homeConfig.asciiScene.seed}-${mode}-clouds`);
  const middleCount = homeConfig.asciiScene.clouds.middleCount[mode];
  const bottomCount = homeConfig.asciiScene.clouds.bottomCount[mode];
  const clouds: Cloud[] = [];

  for (let index = 0; index < middleCount; index += 1) {
    clouds.push(createCloud(`middle-cloud-${index}`, mode, "middle", random, index));
  }

  for (let index = 0; index < bottomCount; index += 1) {
    clouds.push(createCloud(`bottom-cloud-${index}`, mode, "bottom", random, index + middleCount));
  }

  return [...clouds, ...createFooterClouds(mode)];
}

function createStarField(measurements: SceneMeasurements) {
  if (!homeConfig.asciiScene.stars.enabled || measurements.height === 0) {
    return [];
  }

  const random = createSeededRandom(`${homeConfig.asciiScene.seed}-stars-${Math.round(measurements.height)}`);
  const heightFactor = Math.max(1, measurements.height / 1200);
  const widthFactor = Math.max(0.7, measurements.width / 1000);
  const count = Math.round(homeConfig.asciiScene.stars.count * heightFactor * widthFactor);

  return Array.from({ length: count }, (_, index) => ({
    id: `star-${index}`,
    top: random() * 100,
    left: random() * 100,
    char: pickFrom(STAR_CHARS, random),
    opacity: 0.35 + random() * 0.65,
    fontSize: 9 + random() * 7,
  }));
}

function createMeteors() {
  if (!homeConfig.asciiScene.meteors.enabled) {
    return [];
  }

  const random = createSeededRandom(`${homeConfig.asciiScene.seed}-meteors`);

  return Array.from({ length: homeConfig.asciiScene.meteors.count }, (_, index) => ({
    id: `meteor-${index}`,
    top: 10 + random() * 42,
    left: 45 + random() * 42,
    delay: random() * 9,
    duration: 6 + random() * 5,
  }));
}

function getCloudStyle(
  cloud: Cloud,
  scrollOffset: number,
  reducedMotion: boolean,
  heightChars: number,
): CSSProperties {
  const motionScale = reducedMotion ? 0 : homeConfig.asciiScene.clouds.motionScale;
  const y = scrollOffset * cloud.speed * motionScale;
  const x = scrollOffset * cloud.drift * motionScale;
  const top =
    cloud.zone === "footer"
      ? `calc(100% + ${homeConfig.asciiScene.clouds.footerBleedPx}px - ${heightChars}em)`
      : `${cloud.top}%`;

  return {
    top,
    left: `${cloud.left}%`,
    width: `${cloud.width}%`,
    zIndex: cloud.zIndex,
    fontSize: `${cloud.fontSize}px`,
    opacity: cloud.opacity,
    transform: `translate3d(${x}px, ${y}px, 0)`,
  };
}

function useSceneMeasurements(ref: RefObject<HTMLDivElement | null>) {
  const [measurements, setMeasurements] = useState<SceneMeasurements>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const update = () => {
      const rect = element.getBoundingClientRect();
      setMeasurements({ width: rect.width, height: element.scrollHeight || rect.height });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [ref]);

  return measurements;
}

function useScrollOffset(ref: RefObject<HTMLDivElement | null>) {
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const element = ref.current;

      if (!element) {
        return;
      }

      setScrollOffset(Math.max(0, -element.getBoundingClientRect().top));
    };

    const requestUpdate = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [ref]);

  return scrollOffset;
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function CloudLayer({
  clouds,
  measurements,
  scrollOffset,
  reducedMotion,
}: {
  clouds: Cloud[];
  measurements: SceneMeasurements;
  scrollOffset: number;
  reducedMotion: boolean;
}) {
  return clouds.map((cloud) => {
    const cloudWidth = measurements.width * (cloud.width / 100);
    const charWidth = cloud.fontSize * 0.62;
    const widthChars = Math.max(24, Math.floor(cloudWidth / charWidth));
    const baseHeightChars = cloud.zone === "footer" ? 13 : 10 + Math.round(cloud.width / 8);
    const heightChars = Math.round(baseHeightChars * homeConfig.asciiScene.clouds.shape.heightScale);
    const ascii = createAsciiCloud(widthChars, heightChars, cloud.bumpCount, `${cloud.seed}-${widthChars}`);

    return (
      <pre
        aria-hidden="true"
        className={`absolute select-none whitespace-pre font-mono leading-none transition-colors duration-300 ${cloud.className}`}
        key={cloud.id}
        style={getCloudStyle(cloud, scrollOffset, reducedMotion, heightChars)}
      >
        {ascii}
      </pre>
    );
  });
}

function StarLayer({ stars }: { stars: Star[] }) {
  return stars.map((star) => (
    <span
      aria-hidden="true"
      className={`absolute select-none font-mono leading-none ${homeConfig.asciiScene.stars.className}`}
      key={star.id}
      style={{
        top: `${star.top}%`,
        left: `${star.left}%`,
        fontSize: `${star.fontSize}px`,
        opacity: star.opacity,
      }}
    >
      {star.char}
    </span>
  ));
}

function MeteorLayer({ meteors, reducedMotion }: { meteors: Meteor[]; reducedMotion: boolean }) {
  if (reducedMotion) {
    return null;
  }

  return meteors.map((meteor) => (
    <span
      aria-hidden="true"
      className={`ascii-scene-meteor absolute select-none whitespace-pre font-mono leading-none ${homeConfig.asciiScene.meteors.className}`}
      key={meteor.id}
      style={{
        top: `${meteor.top}%`,
        left: `${meteor.left}%`,
        animationDelay: `${meteor.delay}s`,
        animationDuration: `${meteor.duration}s`,
      }}
    >
      ----*
    </span>
  ));
}

export default function AsciiSceneBackground() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const measurements = useSceneMeasurements(sceneRef);
  const scrollOffset = useScrollOffset(sceneRef);
  const reducedMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const mode: HomeTheme = resolvedTheme === "dark" ? "dark" : "light";
  const clouds = useMemo(() => createCloudScene(mode), [mode]);
  const stars = useMemo(() => createStarField(measurements), [measurements]);
  const meteors = useMemo(() => createMeteors(), []);

  if (!homeConfig.asciiScene.enabled) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -inset-x-6 -top-8 bottom-0 z-0 overflow-hidden md:-inset-x-12"
      ref={sceneRef}
    >
      <style>
        {`
          @keyframes ascii-scene-meteor {
            0%, 72% { opacity: 0; transform: translate3d(0, 0, 0) rotate(-18deg); }
            76% { opacity: 1; }
            100% { opacity: 0; transform: translate3d(-220px, 92px, 0) rotate(-18deg); }
          }

          .ascii-scene-meteor {
            animation-name: ascii-scene-meteor;
            animation-iteration-count: infinite;
            animation-timing-function: ease-out;
          }
        `}
      </style>
      {mode === "dark" && <StarLayer stars={stars} />}
      {mode === "dark" && <MeteorLayer meteors={meteors} reducedMotion={reducedMotion} />}
      <CloudLayer
        clouds={clouds}
        measurements={measurements}
        scrollOffset={scrollOffset}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}
