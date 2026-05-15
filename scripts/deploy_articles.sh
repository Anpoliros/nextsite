#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCK_DIR="$ROOT_DIR/.logs/deploy_articles.lock"

mkdir -p "$ROOT_DIR/.logs"

# 用目录锁避免连续 webhook 触发多个构建同时运行。
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "articles deployment is already running"
  exit 75
fi

cleanup() {
  rmdir "$LOCK_DIR"
}
trap cleanup EXIT

cd "$ROOT_DIR"

# build 会先执行 sync-articles：
# 1. 更新并强制对齐 articles 子模块
# 2. 同步 articles/images 到 public/images
# 3. 运行 scripts/md_pic_remap.py 重写 Markdown 图片路径
npm run build

# 构建成功后再切换线上进程；构建失败时旧进程继续服务。
if pm2 describe nextsite >/dev/null 2>&1; then
  pm2 reload nextsite --update-env
else
  pm2 start ecosystem.config.js --only nextsite
fi
