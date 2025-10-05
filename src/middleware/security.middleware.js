import aj from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';

export const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';
    let limit;

    // Determine the limit based on the role
    switch (role) {
      case 'admin':
        limit = 20;
        break;
      case 'user':
        limit = 10;
        break;
      default: // Catches 'guest' and any other case
        limit = 5;
        break;
    }

    // Create the dynamic rate limit rule
    const rateLimitRule = slidingWindow({
      mode: 'LIVE',
      interval: '1m',
      max: limit,
      characteristics: ['ipAddress'], // Segment the limit by IP address
    });

    // Pass the dynamic rule as a second argument to protect()
    const decision = await aj.protect(req, [rateLimitRule]);

    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        logger.warn('Bot detected:', { ip: req.ip, path: req.path });
        return res.status(403).json({ error: 'Forbidden' });
      }

      if (decision.reason.isShield()) {
        logger.warn('Shield triggered:', { ip: req.ip, path: req.path });
        return res
          .status(403)
          .json({ error: 'Request blocked by Security Policy' });
      }

      if (decision.reason.isRateLimit()) {
        logger.warn('Rate limit exceeded:', {
          role,
          ip: req.ip,
          path: req.path,
        });
        return res.status(429).json({ error: 'Too Many Requests' });
      }
    }

    next();
  } catch (e) {
    logger.error('Arcjet middleware error', { error: e.message });
    res
      .status(500)
      .json({
        error: 'Internal Server Error',
        message: 'Something went wrong with the Security Middleware',
      });
  }
};
