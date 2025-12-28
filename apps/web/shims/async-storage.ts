type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  key: (index: number) => string | null;
  length: number;
};

const memoryStore = new Map<string, string>();

const memoryStorage: StorageLike = {
  getItem: (key) => (memoryStore.has(key) ? memoryStore.get(key) ?? null : null),
  setItem: (key, value) => {
    memoryStore.set(key, value);
  },
  removeItem: (key) => {
    memoryStore.delete(key);
  },
  clear: () => {
    memoryStore.clear();
  },
  key: (index) => Array.from(memoryStore.keys())[index] ?? null,
  get length() {
    return memoryStore.size;
  },
};

const getStorage = (): StorageLike => {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  return memoryStorage;
};

const getAllKeys = (): string[] => {
  if (typeof window === "undefined" || !window.localStorage) {
    return Array.from(memoryStore.keys());
  }

  const keys: string[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key) {
      keys.push(key);
    }
  }

  return keys;
};

const AsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    return getStorage().getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    getStorage().setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    getStorage().removeItem(key);
  },
  async clear(): Promise<void> {
    getStorage().clear();
  },
  async getAllKeys(): Promise<string[]> {
    return getAllKeys();
  },
  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    const values = await Promise.all(
      keys.map(async (key) => [key, await AsyncStorage.getItem(key)] as [string, string | null]),
    );
    return values;
  },
  async multiSet(pairs: [string, string][]): Promise<void> {
    await Promise.all(pairs.map(([key, value]) => AsyncStorage.setItem(key, value)));
  },
  async multiRemove(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => AsyncStorage.removeItem(key)));
  },
};

export default AsyncStorage;
