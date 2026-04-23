"use client";

import { useEffect } from "react";

export default function MarkdownEnhancer() {
  useEffect(() => {
    // 采用事件委托，捕获点击事件处理复制和折行
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // 折行 (Wrap) 处理
      const wrapBtn = target.closest('button.code-wrap-btn');
      if (wrapBtn) {
        const figure = wrapBtn.closest('figure');
        // rehype-pretty-code 默认是在 pre 里有个 code
        const pre = figure?.querySelector('pre');
        const codeElement = figure?.querySelector('code');
        if (pre) {
          if (pre.style.whiteSpace === "pre-wrap") {
            pre.style.whiteSpace = "pre";
            if (codeElement) codeElement.style.whiteSpace = "pre";
          } else {
            pre.style.whiteSpace = "pre-wrap";
            if (codeElement) codeElement.style.whiteSpace = "pre-wrap";
          }
        }
        return;
      }

      // 复制 (Copy) 处理
      const copyBtn = target.closest('button.code-copy-btn');
      if (copyBtn) {
        const figure = copyBtn.closest('figure');
        const codeElement = figure?.querySelector('pre code');
        const copyIcon = copyBtn.querySelector('.copy-icon');
        const checkIcon = copyBtn.querySelector('.check-icon');

        if (codeElement) {
          navigator.clipboard.writeText((codeElement as HTMLElement).innerText).then(() => {
            // 切换图标
            if (copyIcon && checkIcon) {
              copyIcon.classList.add('hidden');
              checkIcon.classList.remove('hidden');
              
              // 鼠标移出以后再切换回来
              const handleMouseLeave = () => {
                setTimeout(() => {
                  copyIcon.classList.remove('hidden');
                  checkIcon.classList.add('hidden');
                }, 300);
                copyBtn.removeEventListener('mouseleave', handleMouseLeave);
              };
              copyBtn.addEventListener('mouseleave', handleMouseLeave);
            }
          });
        }
        return;
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}
