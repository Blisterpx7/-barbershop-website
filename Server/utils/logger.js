const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Log colors for console
const LOG_COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[35m', // Magenta
  RESET: '\x1b[0m'   // Reset
};

class Logger {
  constructor() {
    this.logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);
  }

  // Write log to file
  writeToFile(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    const logLine = `${timestamp} [${level}] ${message}${data ? ` | ${JSON.stringify(data)}` : ''}\n`;
    
    fs.appendFileSync(this.logFile, logLine);
  }

  // Log error
  error(message, data = null) {
    console.error(`${LOG_COLORS.ERROR}[ERROR]${LOG_COLORS.RESET} ${message}`, data || '');
    this.writeToFile(LOG_LEVELS.ERROR, message, data);
  }

  // Log warning
  warn(message, data = null) {
    console.warn(`${LOG_COLORS.WARN}[WARN]${LOG_COLORS.RESET} ${message}`, data || '');
    this.writeToFile(LOG_LEVELS.WARN, message, data);
  }

  // Log info
  info(message, data = null) {
    console.info(`${LOG_COLORS.INFO}[INFO]${LOG_COLORS.RESET} ${message}`, data || '');
    this.writeToFile(LOG_LEVELS.INFO, message, data);
  }

  // Log debug (only in development)
  debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${LOG_COLORS.DEBUG}[DEBUG]${LOG_COLORS.RESET} ${message}`, data || '');
      this.writeToFile(LOG_LEVELS.DEBUG, message, data);
    }
  }

  // Log API request
  logRequest(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      };

      if (res.statusCode >= 400) {
        this.error(`${req.method} ${req.url} - ${res.statusCode}`, logData);
      } else {
        this.info(`${req.method} ${req.url} - ${res.statusCode}`, logData);
      }
    });

    next();
  }
}

module.exports = new Logger();
