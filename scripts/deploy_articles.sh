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

# PM2 重启会保留已有进程的脚本路径，首次迁移需要重新注册。
# 只输出目标进程的脚本路径，不将进程环境写入日志。
CURRENT_SCRIPT="$(pm2 jlist | node --input-type=module -e '
  let input = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) input += chunk;
  const app = JSON.parse(input).find(item => item.name === "nextsite");
  process.stdout.write(app?.pm2_env?.pm_exec_path || "");
')"
if [[ -n "$CURRENT_SCRIPT" && "$CURRENT_SCRIPT" != "$ROOT_DIR/scripts/static-server.mjs" ]]; then
  pm2 delete nextsite
fi

# 构建失败会提前退出；常规更新继续复用静态服务的配置。
pm2 startOrRestart ecosystem.static.cjs --only nextsite --update-env
