/** 静态博客和文章 webhook 的 PM2 配置，沿用现有服务名称和端口。 */
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
      env: { NODE_ENV: 'production', PORT: '12121', HOST: '127.0.0.1' },
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
