/** 新手账工作树预览；独立进程和端口，不接管旧 weblog 服务与 webhook。 */
module.exports = {
  apps: [{
    name: 'weblog-new', script: 'scripts/static-server.mjs', cwd: __dirname,
    exec_mode: 'fork', instances: 1, autorestart: true, watch: false,
    env: { NODE_ENV: 'production', HOST: '0.0.0.0', PORT: '2324' },
  }],
};
