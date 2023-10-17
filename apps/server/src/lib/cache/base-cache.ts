export type CacheResult = {
  data: string;
  isExpired: boolean;
};

export type CacheInterface = {
  get: (key: string) => Promise<CacheResult | undefined>;
  set: (key: string, value: string, ttl: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  has: (key: string) => Promise<boolean>;
  removeExpired: () => Promise<void>;
};

export default class BaseCache implements CacheInterface {
  get(key: string): Promise<CacheResult | undefined> {
    throw new Error('Do not use BaseCache directly. Use a derived class instead.');
  }

  set(key: string, value: string, ttl: number): Promise<void> {
    throw new Error('Do not use BaseCache directly. Use a derived class instead.');
  }

  delete(key: string): Promise<void> {
    throw new Error('Do not use BaseCache directly. Use a derived class instead.');
  }

  clear(): Promise<void> {
    throw new Error('Do not use BaseCache directly. Use a derived class instead.');
  }

  has(key: string): Promise<boolean> {
    throw new Error('Do not use BaseCache directly. Use a derived class instead.');
  }

  removeExpired(): Promise<void> {
    throw new Error('Do not use BaseCache directly. Use a derived class instead.');
  }
}
