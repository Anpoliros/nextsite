/** 照片来源说明：标题可截断，日期保持完整；与图片切换点击区分离。 */
import { formatDate } from "@/lib/format-date";
export default function PhotoCaption({
  title,
  href,
  date,
}: {
  title: string;
  href: string;
  date: string;
}) {
  return (
    <figcaption className="photo-caption">
      <a href={href} title={title}>
        {title}
      </a>
      <time dateTime={date}>{formatDate(date)}</time>
    </figcaption>
  );
}
