const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  use: {
    headless: true,
    baseURL: 'http://127.0.0.1:5187',
    viewport: { width: 1440, height: 1000 },
    launchOptions: { executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] }
  },
  webServer: {
    command: 'python3 -m http.server 5187 --bind 127.0.0.1',
    url: 'http://127.0.0.1:5187',
    reuseExistingServer: false
  }
});
