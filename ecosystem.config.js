module.exports = {
  apps: [
    {
      name: 'nextsite',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 12121',
      cwd: '/home/anpoliros/nextsite',
      instances: 1,
      autorestart: true, // 崩溃自动重启
      watch: false,
      max_memory_restart: '1G', // 内存占用超过 1G 时自动重启
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
