import fs from 'fs';

import BaseCache, { CacheResult } from './base-cache';

export default class FsCache extends BaseCache {
  private cacheFolder: string;

  constructor(
    options: { path: string } = {
      path: './.cache',
    }
  ) {
    super();

    const isExists = fs.existsSync(options.path);
    if (!isExists) {
      fs.mkdirSync(options.path, {
        recursive: true,
      });
    }

    const isDirectory = fs.lstatSync(options.path).isDirectory();
    if (!isDirectory) {
      throw new Error("Cache path already exists and it's a file. It must be a directory.");
    }

    this.cacheFolder = options.path;
  }

  has(key: string): Promise<boolean> {
    const cacheFile = this.getCacheFile(key);
    return Promise.resolve(cacheFile !== undefined);
  }

  get(key: string): Promise<CacheResult | undefined> {
    const cacheFile = this.getCacheFile(key);
    if (!cacheFile) {
      return Promise.resolve(undefined);
    }

    const isExpired = this.isExpired(cacheFile);

    const { value } = JSON.parse(cacheFile);
    return Promise.resolve({
      data: value,
      isExpired,
    });
  }

  set(key: string, value: string, ttl: number): Promise<void> {
    const cacheFile = JSON.stringify({
      createdAt: new Date(),
      ttl,
      value,
    });

    this.setCacheFile(key, cacheFile);
    return Promise.resolve();
  }

  delete(key: string): Promise<void> {
    this.deleteCacheFile(key);
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.clearCacheFolder();
    return Promise.resolve();
  }

  removeExpired(): Promise<void> {
    // Instead of reading all the files and checking if they are expired, we
    // can hash the key, createdAt and ttl as the file name. Then we can check
    // if the file is expired by checking the file name.

    const cacheFiles = fs.readdirSync(this.cacheFolder);
    cacheFiles.forEach((cacheFile) => {
      const cacheFilePath = `${this.cacheFolder}/${cacheFile}`;
      const cacheFileContent = fs.readFileSync(cacheFilePath, 'utf-8');
      const isExpired = this.isExpired(cacheFileContent);

      if (isExpired) {
        this.deleteCacheFile(cacheFile);
      }
    });

    return Promise.resolve();
  }

  private getCacheFilePath(key: string): string {
    // ? TODO: Use a hash function to hash the key.
    return `${this.cacheFolder}/${key}`;
  }

  private getCacheFile(key: string): string | undefined {
    const cacheFilePath = this.getCacheFilePath(key);
    const isExists = fs.existsSync(cacheFilePath);
    if (!isExists) {
      return undefined;
    }

    const cacheFile = fs.readFileSync(cacheFilePath, 'utf-8');
    return cacheFile;
  }

  private setCacheFile(key: string, value: string): void {
    const cacheFilePath = this.getCacheFilePath(key);
    fs.writeFileSync(cacheFilePath, value);
  }

  private deleteCacheFile(key: string): void {
    const cacheFilePath = this.getCacheFilePath(key);

    try {
      fs.unlinkSync(cacheFilePath);
    } catch (_) {}
  }

  private clearCacheFolder(): void {
    fs.rmdirSync(this.cacheFolder, {
      recursive: true,
    });
  }

  private isExpired(cacheFile: string): boolean {
    const { createdAt, ttl } = JSON.parse(cacheFile);
    const timeElapsed = (new Date().getTime() - new Date(createdAt).getTime()) / 1000;

    return timeElapsed > ttl && ttl > 0;
  }
}
