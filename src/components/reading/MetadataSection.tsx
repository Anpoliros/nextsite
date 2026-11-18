/** 上下票据共用文章元信息与篇间导航；分类和标签均不生成独立列表页。 */
import type { PageData } from "@/site/types";
import { categoryName, articleTone } from "@/config/journal";
export default function MetadataSection({
  data,
  position,
}: {
  data: Extract<PageData, { kind: "article" }>;
  position: "top" | "bottom";
}) {
  return (
    <section
      className={`metadata-section ticket ${position}-section`}
      data-tone={articleTone(data.meta.post_category, data.meta.post_tag)}
      aria-label={position === "top" ? "文章顶部信息" : "文章底部信息"}
    >
      <div className="ticket-main">
        <nav className="breadcrumb" aria-label="文章位置">
          <a href="/">所有文章</a>
          <span aria-hidden="true">/</span>
          <span>{categoryName(data.meta.post_category)}</span>
        </nav>
        <div className="ticket-details">
          {data.meta.post_tag.map((tag) => (
            <span key={tag}># {tag}</span>
          ))}
        </div>
      </div>
      <nav
        className="ticket-stub"
        aria-label={position === "top" ? "顶部篇间导航" : "底部篇间导航"}
      >
        {data.randomPost && (
          <a className="random-article" href={data.randomPost.post_path}>
            随机一篇 ↗
          </a>
        )}
        <div className="ticket-neighbors">
          {data.prevPost ? (
            <a href={data.prevPost.post_path} title={data.prevPost.post_title}>
              ← 上一篇
            </a>
          ) : (
            <span />
          )}
          {data.nextPost && (
            <a href={data.nextPost.post_path} title={data.nextPost.post_title}>
              下一篇 →
            </a>
          )}
        </div>
      </nav>
    </section>
  );
}
