import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { DemoStore } from "./types";

const globalQueue = globalThis as unknown as {
  auroraDemoQueue?: Promise<unknown>;
};
const directory = path.join(process.cwd(), ".data");
const filename = path.join(directory, "2010-demo.json");
const empty = (): DemoStore => ({
  sessions: {},
  playthroughs: {},
  outbox: {},
  operations: {},
  limits: {},
});

/** Development-only durable store. One Node process; production always uses PostgreSQL. */
export function demoTransaction<T>(
  operation: (data: DemoStore) => T | Promise<T>,
): Promise<T> {
  const pending = (globalQueue.auroraDemoQueue || Promise.resolve())
    .catch(() => {})
    .then(async () => {
      await mkdir(directory, { recursive: true });
      let data: DemoStore;
      try {
        data = JSON.parse(await readFile(filename, "utf8")) as DemoStore;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        data = empty();
      }
      const result = await operation(data);
      const temporary = path.join(directory, `2010-demo-${randomUUID()}.tmp`);
      await writeFile(temporary, JSON.stringify(data), {
        encoding: "utf8",
        mode: 0o600,
      });
      await rename(temporary, filename);
      return result;
    });
  globalQueue.auroraDemoQueue = pending;
  return pending;
}
