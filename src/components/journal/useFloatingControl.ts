// ============================================================
// 配置圆点在视口中独立定位。移动端支持 Pointer Events 拖动、边界约束，
// 以移动距离区分拖动和点击；resize 后将按钮夹回可见范围。
// ============================================================
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
const size = 44,
  gap = 24;
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));
// visualViewport 避免移动浏览器工具栏 / 缩放令底部留白失真。
function viewportBounds() {
  if (typeof window === "undefined") return { left: 0, top: 0, right: 1024, bottom: 768 };
  const viewport = window.visualViewport;
  const left = viewport?.offsetLeft ?? 0;
  const top = viewport?.offsetTop ?? 0;
  return {
    left,
    top,
    right: left + (viewport?.width ?? innerWidth),
    bottom: top + (viewport?.height ?? innerHeight),
  };
}
export function useFloatingControl(breakpoint: number) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 24, mobile: false });
  const [bounds, setBounds] = useState(viewportBounds);
  const dragged = useRef(false);
  const placed = useRef(false);
  const lastMobile = useRef(false);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const suppressClick = useRef(false);
  useEffect(() => {
    const update = () => {
      const bounds = viewportBounds();
      setBounds(bounds);
      const mobile = innerWidth <= breakpoint;
      if (!mobile) {
        const shell = document
          .querySelector(".page-shell")
          ?.getBoundingClientRect();
        const header = document
          .querySelector(".masthead")
          ?.getBoundingClientRect();
        setPosition({
          mobile: false,
          x: Math.max(12, (shell?.left ?? 80) - 60),
          y: Math.max(
            12,
            (header?.top ?? 24) + ((header?.height ?? 36) - size) / 2,
          ),
        });
      } else if (!lastMobile.current || !placed.current) {
        setPosition({
          mobile: true,
          x: bounds.right - size - gap,
          y: bounds.bottom - size - gap,
        });
        placed.current = true;
      } else
        setPosition((old) => ({
          ...old,
          mobile: true,
          x: clamp(old.x, bounds.left + gap, bounds.right - size - gap),
          y: clamp(old.y, bounds.top + gap, bounds.bottom - size - gap),
        }));
      lastMobile.current = mobile;
    };
    setMounted(true);
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    const observer = new ResizeObserver(update);
    const shell = document.querySelector(".page-shell");
    if (shell) observer.observe(shell);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [breakpoint]);
  // 即使鼠标在窗口外松开、捕获丢失，也必须结束拖动。
  const clearDrag = () => {
    if (!drag.current) return;
    suppressClick.current = dragged.current;
    drag.current = null;
  };
  useEffect(() => {
    window.addEventListener("pointerup", clearDrag);
    window.addEventListener("pointercancel", clearDrag);
    window.addEventListener("blur", clearDrag);
    return () => {
      window.removeEventListener("pointerup", clearDrag);
      window.removeEventListener("pointercancel", clearDrag);
      window.removeEventListener("blur", clearDrag);
    };
  }, []);
  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!position.mobile || e.button !== 0) return;
    dragged.current = false;
    suppressClick.current = false;
    drag.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      left: position.x,
      top: position.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const start = drag.current;
    if (!start || e.pointerId !== start.id) return;
    if ((e.buttons & 1) === 0) {
      clearDrag();
      return;
    }
    const bounds = viewportBounds();
    const dx = e.clientX - start.x,
      dy = e.clientY - start.y;
    if (Math.hypot(dx, dy) > 6) dragged.current = true;
    if (dragged.current)
      setPosition({
        mobile: true,
        x: clamp(start.left + dx, bounds.left + gap, bounds.right - size - gap),
        y: clamp(start.top + dy, bounds.top + gap, bounds.bottom - size - gap),
      });
  };
  const finish = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag.current || e.pointerId !== drag.current.id) return;
    suppressClick.current = dragged.current;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const allowClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return false;
    }
    return true;
  };
  // 上下展开都让 tabs 靠近入口，面板向远离入口的方向延伸。
  const direction =
    position.y + size / 2 > (bounds.top + bounds.bottom) / 2 ? "up" : "down";
  const edge = direction === "up" ? position.y - 12 : position.y + size + 12;
  return {
    mobile: position.mobile,
    direction,
    buttonStyle: { left: position.x, top: position.y, visibility: mounted ? "visible" : "hidden" } as CSSProperties,
    panelStyle: {
      left: clamp(position.x + size - 330, bounds.left + 16, bounds.right - 346),
      top: direction === "down" ? edge : "auto",
      bottom: direction === "up" ? (typeof window === "undefined" ? 768 : innerHeight) - edge : "auto",
      maxHeight: Math.max(
        0,
        direction === "up" ? edge - bounds.top - 16 : bounds.bottom - edge - 16,
      ),
    } as CSSProperties,
    dragProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
      onLostPointerCapture: clearDrag,
    },
    allowClick,
  };
}
