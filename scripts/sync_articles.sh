#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

# 内容仓库有本地修改时停止，避免自动部署覆盖作者的文章。
if [[ -n "$(git -C articles status --porcelain)" ]]; then
  echo "articles contains local changes; commit or preserve them before syncing" >&2
  exit 1
fi
git -C articles fetch --prune
git -C articles merge --ff-only '@{u}'

# 图片引用在构建时只读转换；同步步骤只更新已提交的文章。
