module.exports = {
  apps: [
    {
      name: 'logbot',
      script: 'npm',
      node_args: '-r dotenv/config',
      args: 'start',
      max_memory_restart: '300M',

      // Logging
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'DD-MM HH:mm:ss Z',
      log_type: 'json',

      // Env Specific Config
      env_production: {
        NODE_ENV: 'production',
        PORT: 3300,
      },
    },
  ],
};
