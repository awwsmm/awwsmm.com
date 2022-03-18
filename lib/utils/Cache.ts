import Environment from "./Environment";
import fs from 'fs';
import path from "path";

export default class Cache<K,V> {
  readonly filename: string;
  readonly path: string;
  readonly eager: boolean;

  private inMemory: Map<K,V>;
  private onDisk: Map<K,V>;

  constructor(filename: string, eager = true) {
    this.filename = filename;
    this.path = path.join(Environment.rootdir, "caches", filename);
    this.eager = eager;

    try {
      this.onDisk = new Map<K,V>(JSON.parse(fs.readFileSync(this.path, 'utf8')));

    } catch (error) {
      console.log(`Error reading ${this.path}. Continuing with empty cache.\n  ${error}`); // eslint-disable-line no-console
      this.onDisk = new Map<K,V>();
    }

    this.inMemory = this.onDisk;
  }

  set(key: K, value: V): Cache<K,V> {
    this.inMemory.set(key, value);
    if (this.eager) this.write();
    return this;
  }

  get(key: K): V | undefined {
    return this.inMemory.get(key);
  }

  write(): void {
    fs.writeFileSync(this.path, JSON.stringify(Array.from(this.inMemory.entries()), null, 2));
  }
}