const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting middleware
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Apply security middleware
const applySecurityMiddleware = (app) => {
  // Basic security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Rate limiting for different endpoints
  app.use('/api/auth/', createRateLimiter(15 * 60 * 1000, 5)); // 5 requests per 15 minutes for auth
  app.use('/api/', createRateLimiter(15 * 60 * 1000, 100)); // 100 requests per 15 minutes for general API
  
  // Stricter rate limiting for sensitive operations
  app.use('/api/appointments/', createRateLimiter(15 * 60 * 1000, 20)); // 20 appointment operations per 15 minutes
};

module.exports = { applySecurityMiddleware, createRateLimiter };
