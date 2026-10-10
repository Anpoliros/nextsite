/** 内容同步回归验证：真实 Git 仓库中保留作者修改，生产检出只包含远端提交。 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
function identify(cwd) {
  git(cwd, 'config', 'user.name', 'Content sync test');
  git(cwd, 'config', 'user.email', 'content-sync@example.invalid');
}

test('同步在本地有修改时发布远端版本，并保护被修改的生产检出目录', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'weblog-content-sync-'));
  try {
    const remote = path.join(root, 'remote.git');
    const local = path.join(root, 'articles');
    const writer = path.join(root, 'writer');
    const snapshot = path.join(root, '.build/articles');
    git(root, 'init', '--bare', '--initial-branch=master', remote);
    git(root, 'clone', remote, local);
    identify(local);
    await mkdir(path.join(local, 'content'));
    await writeFile(path.join(local, 'content/story.md'), '已发布的旧正文');
    git(local, 'add', '.');
    git(local, 'commit', '-m', '初始文章');
    git(local, 'push', '-u', 'origin', 'master');
    const originalHead = git(local, 'rev-parse', 'HEAD');
    await writeFile(path.join(local, 'content/story.md'), '作者尚未提交的正文');

    git(root, 'clone', remote, writer);
    identify(writer);
    await writeFile(path.join(writer, 'content/story.md'), '远端新发布的正文');
    git(writer, 'add', '.');
    git(writer, 'commit', '-m', '发布更新');
    git(writer, 'push');
    const publishedHead = git(writer, 'rev-parse', 'HEAD');
    await mkdir(path.join(root, 'scripts'));
    await cp('scripts/sync_articles.sh', path.join(root, 'scripts/sync_articles.sh'));
    const sync = () => execFileSync('bash', ['scripts/sync_articles.sh'], {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    });

    sync();
    assert.equal(git(local, 'rev-parse', 'HEAD'), originalHead);
    assert.equal(await readFile(path.join(local, 'content/story.md'), 'utf8'), '作者尚未提交的正文');
    assert.equal(git(snapshot, 'rev-parse', 'HEAD'), publishedHead);
    assert.equal(await readFile(path.join(snapshot, 'content/story.md'), 'utf8'), '远端新发布的正文');
    // 重复部署复用干净检出；存在人工改动时停止，避免覆盖。
    sync();
    await writeFile(path.join(snapshot, 'content/story.md'), '检出目录中的临时修改');
    assert.throws(sync, /deployment checkout is unrelated or contains local changes/);
    assert.equal(await readFile(path.join(snapshot, 'content/story.md'), 'utf8'), '检出目录中的临时修改');
    assert.equal(await readFile(path.join(local, 'content/story.md'), 'utf8'), '作者尚未提交的正文');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
