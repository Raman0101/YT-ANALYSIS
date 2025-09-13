import { LRUCache } from 'lru-cache';

export type CacheKey = string;

const ttlMs = Number(process.env.CACHE_TTL_MS || 600_000); // 10 minutes

// In-memory LRU cache. In production you may replace with Redis using the same interface.
const cache = new LRUCache<CacheKey, any>({
  max: 500,
  ttl: ttlMs,
});

export function getCached<T>(key: CacheKey): T | undefined {
  return cache.get(key) as T | undefined;
}

export function setCached<T>(key: CacheKey, value: T): void {
  cache.set(key, value);
}

export function makeKey(parts: Array<string | number>): CacheKey {
  return parts.join('::');
}


