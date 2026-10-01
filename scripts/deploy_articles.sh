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

# 显式同步远端文章；普通 dev/build 使用本地内容。
npm run sync-articles
npm run build

# 应用新配置，首次迁移时将原 Next 进程替换为静态文件服务。
# 构建失败会提前退出，已有 dist 和线上进程继续服务。
pm2 startOrRestart ecosystem.static.cjs --only nextsite --update-env
