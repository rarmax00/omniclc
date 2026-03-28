export function createTTLCache() {
    const map = new Map();
  
    return {
      get(key) {
        const item = map.get(key);
        if (!item) return null;
  
        if (Date.now() > item.expiresAt) {
          map.delete(key);
          return null;
        }
  
        return item.value;
      },
  
      set(key, value, ttlMs) {
        map.set(key, {
          value,
          expiresAt: Date.now() + ttlMs,
        });
      },
  
      delete(key) {
        map.delete(key);
      },
  
      clear() {
        map.clear();
      },
    };
  }