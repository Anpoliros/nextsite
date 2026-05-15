import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ===== Webhook 配置 =====
// Gitea 和 nextsite 在同机或同内网时，推荐只监听本机地址。
const HOST = '10.177.87.87';
const PORT = 12122;
const HOOK_PATH = '/hooks/articles';
const EXPECTED_EVENT = 'push';
// 必须和 articles 子模块实际同步的分支一致；当前 sync-articles 使用 origin/master。
const EXPECTED_REF = 'refs/heads/master';
const WEBHOOK_SECRET = '0a4102fe-506b-11f1-acd7-b70bc6e0a5b9';
const MAX_BODY_BYTES = 1024 * 1024;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DEPLOY_SCRIPT = path.join(ROOT_DIR, 'scripts', 'deploy_articles.sh');

let deploying = false;

function logDelivery(message, extra = {}) {
  const fields = Object.entries(extra)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${value}`)
    .join(' ');

  console.log(`[articles-webhook] ${message}${fields ? ` ${fields}` : ''}`);
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function timingSafeEqualText(a, b) {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');

  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function verifySignature(rawBody, signature) {
  // Secret 没改掉时拒绝所有请求，避免部署入口在未配置时被触发。
  if (!WEBHOOK_SECRET || WEBHOOK_SECRET === 'CHANGE_ME_TO_GITEA_WEBHOOK_SECRET') {
    return false;
  }

  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  return timingSafeEqualText(expected, signature || '');
}

function runDeploy() {
  deploying = true;
  logDelivery('deploy started');

  // daemon 只负责校验和触发，部署细节集中放在 shell 脚本里。
  const child = spawn(DEPLOY_SCRIPT, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });

  child.on('close', (code, signal) => {
    deploying = false;

    if (code === 0) {
      logDelivery('deploy completed');
      return;
    }

    console.error(`[articles-webhook] deploy failed code=${code} signal=${signal || ''}`);
  });
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;

      if (size > MAX_BODY_BYTES) {
        reject(new Error('request body too large'));
        req.destroy();
        return;
      }

      chunks.push(chunk);
    });

    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST' || req.url !== HOOK_PATH) {
    logDelivery('ignored request', { method: req.method, url: req.url });
    sendJson(res, 404, { ok: false, error: 'not found' });
    return;
  }

  const event = req.headers['x-gitea-event'];
  if (event !== EXPECTED_EVENT) {
    // Gitea 的测试请求或其他事件会被跳过。
    logDelivery('ignored event', { event: event || 'unknown' });
    sendJson(res, 202, { ok: true, skipped: `ignored event: ${event || 'unknown'}` });
    return;
  }

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch (error) {
    sendJson(res, 413, { ok: false, error: error.message });
    return;
  }

  if (!verifySignature(rawBody, req.headers['x-gitea-signature'])) {
    logDelivery('rejected request', { reason: 'invalid signature' });
    sendJson(res, 401, { ok: false, error: 'invalid signature' });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    logDelivery('rejected request', { reason: 'invalid json' });
    sendJson(res, 400, { ok: false, error: 'invalid json' });
    return;
  }

  logDelivery('received push', {
    ref: payload.ref,
    repo: payload.repository?.full_name,
    after: payload.after?.slice(0, 12),
  });

  if (payload.ref !== EXPECTED_REF) {
    // 只允许主内容分支触发部署，避免草稿分支误部署。
    logDelivery('ignored ref', { ref: payload.ref || 'unknown', expected: EXPECTED_REF });
    sendJson(res, 202, { ok: true, skipped: `ignored ref: ${payload.ref || 'unknown'}` });
    return;
  }

  if (deploying) {
    // 连续 push 时不并发构建；部署脚本内部也有锁作为第二层保护。
    logDelivery('ignored deploy', { reason: 'deployment already running' });
    sendJson(res, 202, { ok: true, skipped: 'deployment already running' });
    return;
  }

  runDeploy();
  sendJson(res, 202, { ok: true, queued: true });
});

server.listen(PORT, HOST, () => {
  logDelivery('listening', { url: `http://${HOST}:${PORT}${HOOK_PATH}`, expectedRef: EXPECTED_REF });
});
