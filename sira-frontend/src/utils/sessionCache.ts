interface SessionCacheEntry<T> {
  createdAt: number;
  expiresAt: number;
  value: T;
}

interface SessionCacheOptions {
  namespace: string;
  version: string;
  ttlMs?: number;
  maxEntries?: number;
}

const DEFAULT_TTL_MS = 10 * 60 * 1000;
const DEFAULT_MAX_ENTRIES = 40;

const now = () => Date.now();

export const createSessionCache = <T>({
  namespace,
  version,
  ttlMs = DEFAULT_TTL_MS,
  maxEntries = DEFAULT_MAX_ENTRIES,
}: SessionCacheOptions) => {
  const prefix = `@sira:${namespace}:${version}:cache:`;
  const keyFor = (key: string) => `${prefix}${key}`;

  const remove = (key: string) => {
    try {
      sessionStorage.removeItem(keyFor(key));
    } catch {
      // sessionStorage can be unavailable in private browsing modes.
    }
  };

  const get = (key: string): T | null => {
    try {
      const raw = sessionStorage.getItem(keyFor(key));
      if (!raw) return null;

      const entry = JSON.parse(raw) as SessionCacheEntry<T>;
      if (entry.expiresAt <= now()) {
        remove(key);
        return null;
      }

      return entry.value;
    } catch {
      remove(key);
      return null;
    }
  };

  const prune = () => {
    try {
      const entries = Object.keys(sessionStorage)
        .filter(key => key.startsWith(prefix))
        .map(key => {
          try {
            const entry = JSON.parse(sessionStorage.getItem(key) ?? '') as SessionCacheEntry<T>;
            return { key, createdAt: entry.createdAt, expiresAt: entry.expiresAt };
          } catch {
            return { key, createdAt: 0, expiresAt: 0 };
          }
        });

      const timestamp = now();
      entries
        .filter(entry => entry.expiresAt <= timestamp)
        .forEach(entry => sessionStorage.removeItem(entry.key));

      const validEntries = entries
        .filter(entry => entry.expiresAt > timestamp)
        .sort((a, b) => b.createdAt - a.createdAt);

      validEntries
        .slice(maxEntries)
        .forEach(entry => sessionStorage.removeItem(entry.key));
    } catch {
      // sessionStorage can be unavailable in private browsing modes.
    }
  };

  const set = (key: string, value: T) => {
    try {
      const timestamp = now();
      const entry: SessionCacheEntry<T> = {
        createdAt: timestamp,
        expiresAt: timestamp + ttlMs,
        value,
      };
      sessionStorage.setItem(keyFor(key), JSON.stringify(entry));
      prune();
    } catch {
      // sessionStorage can be unavailable in private browsing modes.
    }
  };

  return { get, set, remove };
};
