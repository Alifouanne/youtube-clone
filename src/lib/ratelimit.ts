// Import the Ratelimit class from Upstash for setting up rate limiting
import { Ratelimit } from "@upstash/ratelimit";

// Import the Redis client instance configured elsewhere in the project
import { redis } from "./redis";

// Create a new rate limiter using a sliding window algorithm
// This limiter allows a maximum of 10 requests per 10 seconds for each identity key
// 'analytics: true' enables analytics for rate limiter usage
export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10s"),
  analytics: true,
});
