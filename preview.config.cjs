/** 手账正式版本：沿用独立进程名，占用正式端口；旧版移至 2324。 */
module.exports = {
  apps: [
    {
      name: "weblog-new",
      script: "scripts/static-server.mjs",
      cwd: __dirname,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      env: { NODE_ENV: "production", HOST: "0.0.0.0", PORT: "12121" },
    },
  ],
};
