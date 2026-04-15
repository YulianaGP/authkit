import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// 5 attempts per 15 minutes per IP
export const loginRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "authkit:login",
  analytics: true,
})

// 3 password reset requests per hour per IP
export const passwordResetRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "authkit:password-reset",
  analytics: true,
})
