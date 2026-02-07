// PM2 process manager config
// Usage: pm2 start ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'thisisrober',
    script: 'server/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
    instances: 1,
    autorestart: true,
    watch: ['server'],            // Auto-restart when server code changes (on deploy)
    ignore_watch: [
      'node_modules',
      'server/database/thisisrober.db',
      'server/database/thisisrober.db-shm',
      'server/database/thisisrober.db-wal',
    ],
    max_memory_restart: '512M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }],
};
