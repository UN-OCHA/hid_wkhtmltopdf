var bunyan = require('bunyan'),
  config = require('./config'),
  log = bunyan.createLogger({
    name: config.name,
    streams: [
      {
        level: 'info',
        stream: process.stdout
      },
      {
        level: 'info',
        path: '/var/log/wkhtmltopdf_service.log'
      }
    ]
  });

module.exports = log;
