const winston = require("winston");

const logConfiguration = {
  'transports': [
    new winston.transports.Console()
  ],
  'format': winston.format.printf(info => `${info.level.toUpperCase()}: ${info.message}`)
};
const logger = winston.createLogger(logConfiguration);

module.exports = logger;