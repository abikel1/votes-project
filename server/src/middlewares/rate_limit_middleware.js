const buckets = new Map();

module.exports = function rateLimit({ windowMs = 60_000, max = 5 } = {}) {
  return (req, res, next) => {
    const key = req.user?._id?.toString() || req.ip;
    const now = Date.now();
    const arr = (buckets.get(key) || []).filter(t => now - t < windowMs);
    if (arr.length >= max) return res.status(429).json({ message: 'Too many requests' });
    arr.push(now);
    buckets.set(key, arr);
    next();
  };
};
