/**
 * FlowPilot AI Rate Limiting Middleware
 * Zero-dependency in-memory sliding-window rate limiter for protecting
 * authentication and webhook endpoints against abuse (Serverless & Standalone compatible).
 */

const createRateLimiter = ({ windowMs = 60 * 1000, max = 60, message = 'Too many requests, please try again later.' } = {}) => {
  const hits = new Map();

  // Periodic cleanup with unref() so the serverless event loop is never blocked
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now - record.startTime > windowMs) {
        hits.delete(key);
      }
    }
  }, windowMs);

  if (timer.unref) {
    timer.unref();
  }

  return (req, res, next) => {
    // In test or serverless diagnostic bypass if needed
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    // Inline cleanup if map grows
    if (hits.size > 200) {
      for (const [key, record] of hits.entries()) {
        if (now - record.startTime > windowMs) {
          hits.delete(key);
        }
      }
    }

    let record = hits.get(ip);
    if (!record || now - record.startTime > windowMs) {
      record = { count: 1, startTime: now };
      hits.set(ip, record);
    } else {
      record.count++;
    }

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil((record.startTime + windowMs) / 1000));

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: Math.ceil((record.startTime + windowMs - now) / 1000)
      });
    }

    next();
  };
};

module.exports = {
  createRateLimiter,
  authRateLimiter: createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many authentication attempts. Please try again after 15 minutes.' }),
  webhookRateLimiter: createRateLimiter({ windowMs: 60 * 1000, max: 120, message: 'Webhook rate limit exceeded. Max 120 requests per minute.' })
};
