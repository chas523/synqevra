import { IClientStorage } from '@medplum/core';

export class InMemoryStorage implements IClientStorage {
  private storage: Record<string, string> = {};

  clear(): void {
    this.storage = {};
  }

  getString(key: string): string | undefined {
    return this.storage[key];
  }

  setString(key: string, value: string | undefined): void {
    if (value === undefined) {
      delete this.storage[key];
    } else {
      this.storage[key] = value;
    }
  }

  getObject<T>(key: string): T | undefined {
    const str = this.getString(key);
    if (!str) {
      return undefined;
    }
    try {
      return JSON.parse(str) as T;
    } catch (err) {
      return undefined;
    }
  }

  setObject<T>(key: string, value: T): void {
    this.setString(key, JSON.stringify(value));
  }
}
