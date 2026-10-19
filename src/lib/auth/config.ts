import "server-only";

export const SESSION_COOKIE = "aurora_session";
export const SESSION_DAYS = 30;

export function runtimeConfig() {
  const password = process.env.AURORA_ACCESS_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  const databaseUrl = process.env.SUPABASE_DATABASE_URL;
  const missing = [
    !password && "AURORA_ACCESS_PASSWORD",
    (!secret || secret.length < 32) && "SESSION_SECRET (32+ characters)",
    !databaseUrl && "SUPABASE_DATABASE_URL",
  ].filter(Boolean);
  const demo = missing.length > 0;
  if (demo && process.env.NODE_ENV === "production") {
    throw new Error(
      `Secure configuration is incomplete: ${missing.join(", ")}.`,
    );
  }
  return {
    demo,
    password: password || "aurora",
    secret: secret || "local-demo-only-do-not-deploy-this-secret",
    databaseUrl,
  };
}
