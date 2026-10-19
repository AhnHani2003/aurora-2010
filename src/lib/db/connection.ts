import "server-only";
import postgres from "postgres";
import { runtimeConfig } from "../auth/config";

const globalDatabase = globalThis as unknown as {
  auroraSql?: ReturnType<typeof postgres>;
};
export function database() {
  const { databaseUrl, demo } = runtimeConfig();
  if (demo || !databaseUrl)
    throw new Error("A real database is not configured.");
  if (!globalDatabase.auroraSql)
    globalDatabase.auroraSql = postgres(databaseUrl, {
      ssl: "require",
      max: 3,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  return globalDatabase.auroraSql;
}
