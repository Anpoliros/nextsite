/** 右边缘锚定的纸边：书签始终可见，日历和真实文章摘句随展开显示。 */
import { useEffect, useRef, useState } from "react";
import { categories, categoryName } from "@/config/journal";
import type { Article } from "@/site/types";
import Calendar from "./Calendar";
import { usePreferences } from "./Preferences";
export default function Sidebar({
  articles,
  open,
  onToggle,
  category,
  onCategory,
}: {
  articles: Article[];
  open: boolean;
  onToggle: () => void;
  category: string;
  onCategory: (category: string) => void;
}) {
  const { reduced } = usePreferences();
  const [changing, setChanging] = useState(false);
  const [quote, setQuote] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const quotes = articles.filter((article) => article.excerpt);
  const article = quotes[quote % Math.max(1, quotes.length)];
  useEffect(() => () => clearTimeout(timer.current), []);
  const toggle = () => {
    if (changing) return;
    if (reduced) {
      onToggle();
      return;
    }
    setChanging(true);
    timer.current = setTimeout(() => {
      onToggle();
      timer.current = setTimeout(() => setChanging(false), 390);
    }, 90);
  };
  return (
    <aside
      className="reading-sidebar"
      data-changing={changing}
      aria-label="文章边栏"
    >
      <button
        className="sidebar-toggle"
        aria-expanded={open}
        aria-controls="sidebar-content"
        aria-label={open ? "收起右边栏" : "展开右边栏"}
        onClick={toggle}
      >
        <span aria-hidden="true">{open ? "↗" : "↙"}</span>
      </button>
      <div id="sidebar-content" className="sidebar-content">
        <nav className="bookmark-stack" aria-label="文章分类">
          {categories.map((item) => (
            <button
              key={item.id}
              className="bookmark"
              data-tone={item.tone}
              aria-pressed={category === item.id}
              onClick={() => onCategory(category === item.id ? "" : item.id)}
            >
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        {open && (
          <>
            <Calendar articles={articles} />
            {article && (
              <section className="quote-note">
                <div className="quote-label">
                  偶然翻到<span aria-hidden="true">❝</span>
                </div>
                <blockquote>
                  {article.excerpt.slice(0, 100)}
                  {article.excerpt.length > 100 ? "…" : ""}
                </blockquote>
                <a className="quote-source" href={`/${article.id}/`}>
                  《{article.title}》↗
                </a>
                <div className="quote-actions">
                  <button
                    disabled={quotes.length < 2}
                    onClick={() =>
                      setQuote(
                        (value) =>
                          (value +
                            1 +
                            Math.floor(Math.random() * (quotes.length - 1))) %
                          quotes.length,
                      )
                    }
                  >
                    换一句 ↻
                  </button>
                  <span>
                    {categoryName(article.category)} /{" "}
                    {article.date.slice(0, 4)}
                  </span>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
