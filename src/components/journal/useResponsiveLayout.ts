// ============================================================
// 断点切换分两段：旧纸边退出后更换布局，再让新纸边进入。
// 快速往返调整窗口时取消旧计时；关闭动画和减少动态效果时直接切换。
// ============================================================
import { useEffect, useState } from "react";
export function useResponsiveLayout(
  breakpoint: number,
  enabled: boolean,
  duration: number,
) {
  const [compact, setCompact] = useState(false);
  const [phase, setPhase] = useState("idle");
  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout>;
    let frame: number;
    const update = () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      if (!enabled || reduced.matches) {
        setCompact(query.matches);
        setPhase("idle");
        return;
      }
      setPhase("exit");
      timer = setTimeout(() => {
        setCompact(query.matches);
        setPhase("prepare");
        frame = requestAnimationFrame(() => {
          frame = requestAnimationFrame(() => {
            setPhase("enter");
            timer = setTimeout(() => setPhase("idle"), duration / 2);
          });
        });
      }, duration / 2);
    };
    // 配置改变时立即同步，不为未发生的断点变化播放动画。
    setCompact(query.matches);
    setPhase("idle");
    query.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      query.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, [breakpoint, enabled, duration]);
  return { compact, phase };
}
