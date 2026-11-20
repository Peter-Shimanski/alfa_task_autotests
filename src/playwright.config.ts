import { defineConfig } from '@playwright/test';
import { WAITING_TIME } from './constants';
import { testParams } from './test-params';

export default defineConfig({
  timeout: 2 * WAITING_TIME.XXXXL,
  maxFailures: 15,
  expect: {
    timeout: WAITING_TIME.XXL
  },
  workers: 3,
  reporter: [
    ['list'],
    ['json', { outputFile: '../json-report/_results.json' }],
    ['html', { open: 'never', outputFolder: '../playwright-report' }],
    [
      'allure-playwright',
      {
        outputFolder: '../allure-results',
        suiteTitle: false,
        detail: false
      }
    ]
  ],
  outputDir: '../results',
  use: {
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: { mode: 'retain-on-failure', size: { width: 1280, height: 720 } },
    actionTimeout: WAITING_TIME.XXXL,
    navigationTimeout: WAITING_TIME.XXXL
  },
  reportSlowTests: {
    max: 10,
    threshold: 2 * WAITING_TIME.XXXXL
  },
  projects: [
    {
      name: 'Google Chrome',
      testMatch: /.*\.spec\.ts/,
      use: {
        baseURL: testParams.BASE_URL,
        browserName: 'chromium',
        viewport: {
          width: 1920,
          height: 1080
        },
        headless: true,
        serviceWorkers: 'allow',
        launchOptions: {
          channel: 'chrome'
        }
      }
    }
  ]
});
