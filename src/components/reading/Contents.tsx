/** 正文目录共用链接；移动抽屉使用原生 dialog 获得焦点约束与 Escape 行为。 */
import { useEffect, useRef, useState } from "react";
import type { MarkdownTocItem } from "@/lib/markdown/types";
import { usePreferences } from "../journal/Preferences";
export function ContentsLinks({
  headings,
  active,
  onNavigate,
}: {
  headings: MarkdownTocItem[];
  active: string;
  onNavigate?: () => void;
}) {
  const { reduced } = usePreferences();
  return (
    <nav className="article-toc" aria-label="文章目录">
      {headings.map((heading, index) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          data-level={heading.depth}
          aria-current={active === heading.id ? "location" : undefined}
          onClick={(event) => {
            const node = document.getElementById(heading.id);
            if (!node) return;
            event.preventDefault();
            onNavigate?.();
            node.scrollIntoView({
              block: "start",
              behavior: reduced ? "instant" : "smooth",
            });
            history.replaceState(
              null,
              "",
              `#${encodeURIComponent(heading.id)}`,
            );
          }}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span className="toc-entry-title">{heading.text}</span>
        </a>
      ))}
    </nav>
  );
}
export function MobileContents({
  headings,
  active,
}: {
  headings: MarkdownTocItem[];
  active: string;
}) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  useEffect(() => {
    const media = matchMedia("(min-width: 851px)");
    const close = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", close);
    return () => media.removeEventListener("change", close);
  }, []);
  return (
    <div className="mobile-toc">
      <button
        className="toc-toggle"
        aria-expanded={open}
        aria-controls="mobile-contents"
        onClick={() => setOpen(true)}
      >
        目录 ☷
      </button>
      <dialog
        ref={dialog}
        id="mobile-contents"
        className="toc-drawer"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialog.current) setOpen(false);
        }}
      >
        <div className="drawer-inner">
          <header>
            <h2>文章目录</h2>
            <button aria-label="关闭目录" onClick={() => setOpen(false)}>
              ×
            </button>
          </header>
          <ContentsLinks
            headings={headings}
            active={active}
            onNavigate={() => setOpen(false)}
          />
        </div>
      </dialog>
    </div>
  );
}
