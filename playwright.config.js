const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: "http://127.0.0.1:5500",
    headless: true
  },
  webServer: {
    command: "node scripts/static-server.js",
    url: "http://127.0.0.1:5500",
    reuseExistingServer: true,
    timeout: 30_000
  }
});
