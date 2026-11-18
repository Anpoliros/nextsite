/** 三张照片按身份保留 DOM；顶图侧抽后立即解锁，底图直接补齐并重抽姿态。 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Photo } from "@/site/types";
import { hashText } from "@/config/journal";
import PhotoCaption from "./PhotoCaption";
import { usePreferences } from "./Preferences";
import { useResponsiveLayout } from "./useResponsiveLayout";

type Seed = {
  angle: number;
  x: number;
  y: number;
  hover: number;
  phase: number;
};
function randomSeed(): Seed {
  return {
    angle: Math.random() * 10 - 5,
    x: (Math.random() - 0.5) * 5,
    y: (Math.random() - 0.5) * 4,
    hover: Math.random() * 2 - 1,
    phase: Math.random() * Math.PI * 2,
  };
}
function seed(value: number): Seed {
  return {
    angle: value * 10 - 5,
    x: (value - 0.5) * 5,
    y: (value - 0.5) * 4,
    hover: value * 2 - 1,
    phase: value * Math.PI * 2,
  };
}
export default function PhotoStack({ photos }: { photos: Photo[] }) {
  const { reduced } = usePreferences();
  const { compact, phase } = useResponsiveLayout(725, !reduced, 400);
  const [{ order, seeds }, setQueue] = useState(() => ({
    order: photos.map((_, i) => i),
    seeds: photos.map((photo) => seed((hashText(photo.id) % 1000) / 1000)),
  }));
  const [turning, setTurning] = useState(false);
  const [entryDone, setEntryDone] = useState(false);
  const [width, setWidth] = useState(380);
  const ref = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const count = Math.min(3, photos.length);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => () => clearTimeout(timeout.current), []);
  // 候选池在构建端按文章均衡选择；访问时随机排列，姿态只在初始化与补图时生成。
  useEffect(() => {
    setQueue((old) => {
      const order = [...old.order];
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      return { order, seeds: old.seeds.map(randomSeed) };
    });
  }, []);
  useEffect(() => {
    const photo = photos[order[count]];
    if (photo) {
      const image = new Image();
      image.src = photo.src;
      image.decode().catch(() => {});
    }
  }, [photos, order, count]);
  const finish = () => {
    if (!busy.current) return;
    clearTimeout(timeout.current);
    setQueue((old) => {
      const order = [...old.order.slice(1), old.order[0]];
      const seeds = [...old.seeds];
      if (order.length) seeds[order[count - 1]] = randomSeed();
      return { order, seeds };
    });
    setTurning(false);
    busy.current = false;
  };
  const next = () => {
    if (busy.current || photos.length < 2) return;
    setEntryDone(true);
    busy.current = true;
    if (reduced) {
      finish();
      return;
    }
    setTurning(true);
    // animationend 为正常路径；后台标签页等情况下也能恢复交互。
    timeout.current = setTimeout(finish, 400);
  };
  return (
    <section className="hero" data-hero-compact={compact}>
      <div className="hero-title">
        <h1>
          Hello from
          <br />
          <em>Shanghai.</em>
        </h1>
        <p> </p>
      </div>
      {photos.length > 0 && (
        <div
          ref={ref}
          className="hero-photo-stack"
          data-photo-phase={phase}
          data-turn={turning ? "out" : "idle"}
          data-entry={!entryDone}
        >
          <div
            className="photo-pile"
            onAnimationEnd={(event) => {
              if (event.animationName === "photo-paste") setEntryDone(true);
            }}
          >
            {order.slice(0, count).map((index, i) => {
              const photo = photos[index],
                pose = seeds[index];
              const angle = pose.angle + Math.sin(width / 120 + pose.phase);
              return (
                <div
                  className="photo-layer"
                  key={photo.id}
                  style={{ zIndex: count - i } as CSSProperties}
                  onAnimationEnd={(event) => {
                    if (
                      event.target === event.currentTarget &&
                      i === 0 &&
                      turning
                    )
                      finish();
                  }}
                >
                  <figure
                    className="hero-photo"
                    style={
                      {
                        "--angle": `${angle}deg`,
                        "--photo-x": `${pose.x}%`,
                        "--photo-y": `${pose.y}%`,
                        "--hover-angle": `${pose.hover}deg`,
                      } as CSSProperties
                    }
                  >
                    {i === 0 && (
                      <button
                        className="photo-surface"
                        aria-label="点击照片换下一张"
                        onClick={next}
                        disabled={turning || photos.length < 2}
                      />
                    )}
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      decoding="async"
                      fetchPriority={i === 0 ? "high" : "low"}
                    />
                    <PhotoCaption {...photo} />
                  </figure>
                </div>
              );
            })}
          </div>
          {photos.length > 1 && (
            <button
              className="photo-next"
              aria-label="换一张照片"
              onClick={next}
              disabled={turning}
            >
              ↻
            </button>
          )}
        </div>
      )}
    </section>
  );
}
