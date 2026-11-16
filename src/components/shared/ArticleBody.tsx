/** 博客界面组件，供静态生成和浏览器交互共用。 */
import { memo } from "react";
import MarkdownEnhancer from "./MarkdownEnhancer";
import styles from "./ArticleBody.module.css";

type ArticleBodyProps = {
  html: string;
  className?: string;
};

function ArticleBody({ html, className = "" }: ArticleBodyProps) {
  return (
    <>
      <MarkdownEnhancer />
      <div
        className={`${styles.body} text-gray-800 dark:text-gray-200 leading-relaxed space-y-4 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}

// 正文 HTML 保持稳定，目录高亮更新不应重建标题节点或清空代码折行状态。
export default memo(ArticleBody);
