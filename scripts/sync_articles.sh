#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

# 强制对齐内容仓库，确保构建只使用远端已提交内容。
git -C articles fetch --prune
git -C articles reset --hard '@{u}'
git -C articles clean -fd

# 将文章图片同步到 Next.js 静态资源目录，再统一 Markdown 引用路径。
rsync -a --delete articles/images/ public/images/
python scripts/md_pic_remap.py \
  --image-dir public/images \
  --md-dir articles/content \
  --web
