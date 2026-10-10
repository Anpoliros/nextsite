#!/usr/bin/env bash
# 生产内容同步：从远端提交准备独立检出目录，保留作者工作区。
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_ARTICLES_DIR="$ROOT_DIR/.build/articles"
cd "$ROOT_DIR"

# ============================== 远端版本 ==============================
git -C articles fetch --prune
TARGET_REVISION="$(git -C articles rev-parse '@{u}^{commit}')"
COMMON_DIR="$(git -C articles rev-parse --path-format=absolute --git-common-dir)"
mkdir -p "$ROOT_DIR/.build"

# ============================== 生产检出 ==============================
if [[ -e "$DEPLOY_ARTICLES_DIR" ]]; then
  # 只操作本仓库登记的干净 worktree，避免覆盖临时目录中的其他内容。
  SNAPSHOT_COMMON_DIR="$(git -C "$DEPLOY_ARTICLES_DIR" rev-parse --path-format=absolute --git-common-dir)"
  if [[ "$SNAPSHOT_COMMON_DIR" != "$COMMON_DIR" || -n "$(git -C "$DEPLOY_ARTICLES_DIR" status --porcelain)" ]]; then
    echo "deployment checkout is unrelated or contains local changes: $DEPLOY_ARTICLES_DIR" >&2
    exit 1
  fi
  git -C "$DEPLOY_ARTICLES_DIR" checkout --detach "$TARGET_REVISION"
else
  git -C articles worktree add --detach "$DEPLOY_ARTICLES_DIR" "$TARGET_REVISION"
fi

# 文章图片使用 Git LFS；确保检出的是图片本体。
git -C "$DEPLOY_ARTICLES_DIR" lfs pull
printf 'production articles: %s (%s)\n' "$TARGET_REVISION" "$DEPLOY_ARTICLES_DIR"
