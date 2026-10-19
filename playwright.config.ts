import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 8000 },
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    channel: "chrome",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1050 },
      },
    },
  ],
  webServer: {
    command: "npm.cmd run dev",
    env: { NEXT_PUBLIC_RELEASE_MODE: "backend" },
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60000,
  },
});
