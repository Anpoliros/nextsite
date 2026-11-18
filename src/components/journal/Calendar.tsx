/** 月历从真实文章日期建立链接；当前月份在浏览器初始化，避免 SSG 时区不一致。 */
import { useEffect, useState } from "react";
import type { Article } from "@/site/types";
export default function Calendar({ articles }: { articles: Article[] }) {
  const [month, setMonth] = useState<Date | null>(null);
  const [today, setToday] = useState("");
  useEffect(() => {
    const now = new Date();
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setToday(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
    );
  }, []);
  if (!month) return <section className="calendar" aria-label="月历" />;
  const year = month.getFullYear(),
    m = month.getMonth();
  const offset = (new Date(year, m, 1).getDay() + 6) % 7;
  const days = new Date(year, m + 1, 0).getDate();
  return (
    <section className="calendar" aria-label="月历">
      <header>
        <button
          aria-label="上个月"
          onClick={() => setMonth(new Date(year, m - 1, 1))}
        >
          ‹
        </button>
        <strong>
          {year} 年 {m + 1} 月
        </strong>
        <button
          aria-label="下个月"
          onClick={() => setMonth(new Date(year, m + 1, 1))}
        >
          ›
        </button>
      </header>
      <div className="calendar-grid">
        {["一", "二", "三", "四", "五", "六", "日"].map((day) => (
          <span className="weekday" key={day}>
            {day}
          </span>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`empty-${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const date = `${year}-${String(m + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
          const posts = articles.filter(
            (article) => article.date.slice(0, 10) === date,
          );
          return posts.length ? (
            <a
              key={date}
              className="has-article"
              href={`/${posts[0].id}/`}
              title={posts.map((post) => post.title).join(" / ")}
              aria-label={`${date}：${posts.map((post) => post.title).join(" / ")}`}
            >
              {i + 1}
            </a>
          ) : (
            <span key={date} aria-current={date === today ? "date" : undefined}>
              {i + 1}
            </span>
          );
        })}
      </div>
      <button
        className="calendar-reset"
        onClick={() => {
          const now = new Date();
          setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
        }}
      >
        回到本月
      </button>
    </section>
  );
}
