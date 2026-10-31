type RateLimitOptions = { windowMs: number; max: number };
type Bucket = { startedAt: number; count: number };

export function createRateLimit({ windowMs, max }: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();
  return (req: any, res: any, next: any) => {
    const now = Date.now();
    const key = `${req.path || 'unknown'}:${req.ip || req.socket?.remoteAddress || 'unknown'}`;
    const current = buckets.get(key);
    const bucket = !current || now - current.startedAt >= windowMs ? { startedAt: now, count: 0 } : current;
    bucket.count += 1;
    buckets.set(key, bucket);
    if (bucket.count > max) return res.status(429).json({ error: 'rate_limit_exceeded' });
    next();
  };
}
