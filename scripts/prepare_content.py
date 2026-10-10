#!/usr/bin/env python3
"""只读准备文章内容：复用图片匹配规则，输出 JSON，不改写文章仓库。"""
import contextlib
import io
import json
import os
from pathlib import Path
from md_pic_remap import MarkdownImageProcessor

# ============================== 读取和转换 ==============================
root = Path(__file__).resolve().parent.parent
articles_dir = Path(os.environ.get("ARTICLES_DIR", str(root / "articles"))).resolve()
content_dir = articles_dir / "content"
processor = MarkdownImageProcessor(
    str(articles_dir / "images"), str(content_dir),
    is_web=True, custom_pattern="/images/{path}",
)
files = {}
with contextlib.redirect_stdout(io.StringIO()):
    processor.scan_images()
    for file in sorted(content_dir.rglob("*")):
        if file.is_file() and file.suffix.lower() in {".md", ".mdx"}:
            text, _ = processor.process_markdown_content(file.read_text(encoding="utf-8"), str(file))
            files[str(file.relative_to(content_dir))] = text
print(json.dumps(files, ensure_ascii=False))
