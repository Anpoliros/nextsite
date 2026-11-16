/** 阅读页：真实 Markdown 纸面、对齐正文的上下票据、稳定内部宽度的跟随目录。 */
import { formatDate } from "@/lib/format-date";
import { useState } from "react";
import ArticleBody from "@/components/shared/ArticleBody";
import MetadataSection from "@/components/reading/MetadataSection";
import { ContentsLinks, MobileContents } from "@/components/reading/Contents";
import { useReadingPosition } from "@/components/reading/useReadingPosition";
import { usePreferences } from "@/components/journal/Preferences";
import type { PageData } from "@/site/types";
export default function ArticlePage({
  data,
}: {
  data: Extract<PageData, { kind: "article" }>;
}) {
  const [tocOpen, setTocOpen] = useState(true);
  const { reduced } = usePreferences();
  const hasToc = data.rendered.toc.length > 0;
  const active = useReadingPosition(
    data.rendered.toc,
    tocOpen,
    0,
    reduced ? 0 : 120,
  );
  return (
    <main
      id="main-content"
      className="article-page"
      data-desktop-toc-open={tocOpen && hasToc}
      data-has-toc={hasToc}
    >
      <MetadataSection data={data} position="top" />
      <div className="reading-layout">
        <article className="reading-sheet">
          <div className="markdown-heading">
            <h1>{data.meta.post_title}</h1>
            {data.meta.post_datetime && (
              <time className="reading-date" dateTime={data.meta.post_datetime}>
                {formatDate(data.meta.post_datetime, "long")}
              </time>
            )}
          </div>
          <ArticleBody html={data.rendered.html} className="reading-body" />
        </article>
        {hasToc && (
          <>
            <button
              className="desktop-toc-restore"
              aria-label="展开文章目录"
              onClick={() => setTocOpen(true)}
            >
              ☷
            </button>
            <aside className="toc-rail" aria-label="目录侧栏" inert={!tocOpen}>
              <div className="toc-heading">
                <h2>文章目录</h2>
                <button
                  aria-label="收起文章目录"
                  aria-expanded={tocOpen}
                  onClick={() => setTocOpen(false)}
                >
                  ↗
                </button>
              </div>
              <div id="desktop-contents">
                <ContentsLinks headings={data.rendered.toc} active={active} />
              </div>
            </aside>
          </>
        )}
      </div>
      <MetadataSection data={data} position="bottom" />
      {hasToc && (
        <MobileContents headings={data.rendered.toc} active={active} />
      )}
    </main>
  );
}
