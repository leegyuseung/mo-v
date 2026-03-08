const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

type ConsumeRouteRateLimitParams = {
  key: string;
  limit: number;
  windowMs: number;
};

export function getRequestClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

// Best-effort in-memory limiter. In multi-instance/serverless 환경에서는 완전한 분산 제한이 아니다.
export function consumeRouteRateLimit({
  key,
  limit,
  windowMs,
}: ConsumeRouteRateLimitParams) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      ok: true,
      remaining: limit - 1,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    } as const;
  }

  if (entry.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    } as const;
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);

  return {
    ok: true,
    remaining: Math.max(0, limit - entry.count),
    retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  } as const;
}
