import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./release-e2e",
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: "http://localhost:3001",
    channel: "chrome",
    reducedMotion: "reduce",
    viewport: { width: 1440, height: 1050 },
  },
  webServer: {
    command: "npm.cmd run start -- --port 3001",
    url: "http://localhost:3001",
    reuseExistingServer: false,
    timeout: 60000,
    env: {
      NEXT_PUBLIC_RELEASE_MODE: "standalone",
      AURORA_ACCESS_PASSWORD: "",
      SESSION_SECRET: "",
      SUPABASE_DATABASE_URL: "",
      RESEND_API_KEY: "",
      EMAIL_RETRY_SECRET: "",
    },
  },
});
