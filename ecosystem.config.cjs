/** 静态博客和文章 webhook 的 PM2 配置，旧版保留原进程名称，迁至 2324 供对照。 */
module.exports = {
  apps: [
    {
      name: 'nextsite',
      script: 'scripts/static-server.mjs',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      env: { NODE_ENV: 'production', PORT: '2324', HOST: '0.0.0.0' },
    },
    {
      name: 'nextsite-articles-hook',
      script: 'scripts/articles_webhook.mjs',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      env: { NODE_ENV: 'production' },
    },
  ],
};
