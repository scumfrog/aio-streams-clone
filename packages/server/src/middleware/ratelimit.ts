import rateLimit from 'express-rate-limit';

// Generous limit for stream endpoints (Stremio polls frequently)
export const streamRateLimit = rateLimit({
  windowMs: 60_000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => {
    // Per user-ID, not IP, so shared servers/VPNs aren't penalised
    const userId = req.params['userId'];
    return (Array.isArray(userId) ? userId[0] : userId) ?? req.ip ?? 'unknown';
  },
  message: { error: 'Too many stream requests, please try again shortly.' },
});

// Stricter limit for the config API
export const apiRateLimit = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests.' },
});
