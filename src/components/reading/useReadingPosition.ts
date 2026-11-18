// ============================================================
// 正文滚动只更新当前章节；目录使用自身 scrollTop 居中，避免带动正文。
// 读者手动翻看目录时，不会被每一次正文滚动事件强行拉回。
// ============================================================
import { useEffect, useState } from "react";
import type { MarkdownTocItem } from "@/lib/markdown/types";

export function useReadingPosition(
  headings: MarkdownTocItem[],
  tocOpen: boolean,
  followDelay: number,
  followDuration: number,
) {
  const [active, setActive] = useState(headings[0]?.id ?? "");
  useEffect(() => {
    const nodes = headings.map(({ id }) => document.getElementById(id));
    let frame = 0;
    const update = () => {
      frame = 0;
      const threshold = Math.min(180, innerHeight * 0.25);
      let current = headings[0]?.id ?? "";
      nodes.forEach((node, index) => {
        if (node && node.getBoundingClientRect().top <= threshold)
          current = headings[index].id;
      });
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [headings]);

  useEffect(() => {
    if (!tocOpen || !active) return;
    const contents = document.getElementById("desktop-contents");
    if (!contents) return;
    let frame = 0;
    const cancel = () => cancelAnimationFrame(frame);
    const center = () => {
      cancel();
      if (!matchMedia("(min-width: 851px)").matches) return;
      const entry = Array.from(
        contents.querySelectorAll<HTMLAnchorElement>("a"),
      ).find(
        (item) =>
          item.hash === `#${encodeURIComponent(active)}` ||
          item.getAttribute("href") === `#${active}`,
      );
      if (!entry) return;
      const area = contents.getBoundingClientRect(),
        item = entry.getBoundingClientRect();
      const start = contents.scrollTop;
      const target = Math.max(
        0,
        Math.min(
          contents.scrollHeight - contents.clientHeight,
          start + item.top - area.top - (area.height - item.height) / 2,
        ),
      );
      const duration = matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : followDuration;
      if (!duration) {
        contents.scrollTop = target;
        return;
      }
      // 显式控制时长，避免浏览器原生 smooth 在长距离时额外拖慢跟随。
      const started = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - started) / duration);
        contents.scrollTop =
          start + (target - start) * (1 - (1 - progress) ** 3);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    // 章节切换立即响应；仅在用户主动增加延时时才等待。
    const timer = window.setTimeout(center, followDelay);
    const layout = document.querySelector(".reading-layout");
    const afterLayout = (event: Event) => {
      if (
        event.target === layout &&
        (event as TransitionEvent).propertyName === "grid-template-columns"
      )
        center();
    };
    const manualScroll = () => {
      clearTimeout(timer);
      cancel();
    };
    layout?.addEventListener("transitionend", afterLayout);
    contents.addEventListener("wheel", manualScroll, { passive: true });
    contents.addEventListener("pointerdown", manualScroll);
    window.addEventListener("resize", center);
    return () => {
      clearTimeout(timer);
      cancel();
      layout?.removeEventListener("transitionend", afterLayout);
      contents.removeEventListener("wheel", manualScroll);
      contents.removeEventListener("pointerdown", manualScroll);
      window.removeEventListener("resize", center);
    };
  }, [active, tocOpen, followDelay, followDuration]);
  return active;
}
