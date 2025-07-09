/* eslint-disable */

import { spawn } from 'child_process';
import puppeteer, { Browser, Page } from 'puppeteer';
import http from 'http';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

let serverProcess: ReturnType<typeof spawn>;
let browser: Browser;
let page: Page;

const waitForServer = (url: string, timeout = 10000): Promise<void> => {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http
        .get(url, (res) => {
          if (res.statusCode === 200) resolve();
          else if (Date.now() - start > timeout) reject(new Error('Timeout'));
          else setTimeout(check, 500);
        })
        .on('error', () => {
          if (Date.now() - start > timeout) reject(new Error('Timeout'));
          else setTimeout(check, 500);
        });
    };
    check();
  });
};

beforeAll(async () => {
  // 1. Build the Next.js app
  console.log('🔧 Building Next.js app...');
  await new Promise<void>((resolve, reject) => {
    const build = spawn('npm', ['run', 'build'], { stdio: 'inherit' });
    build.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`Build failed with code ${code}`))));
  });

  // 2. Start the Next.js app in the background
  console.log('🚀 Starting server...');
  serverProcess = spawn('npm', ['start'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: '3000' },
  });

  // 3. Wait for server to respond
  await waitForServer('http://localhost:3000/blog');

  // 4. Launch Puppeteer
  const width = 2056;
  const height = 1329;

  browser = await puppeteer.launch({
    args: [
      '--no-sandbox', // Recommended for CI/CD environments
      '--disable-setuid-sandbox', // Recommended for CI/CD environments
      `--window-size=${width},${height}`, // Set the desired width and height
    ],
  });

  page = await browser.newPage();
  await page.setViewport({ width, height }); // Example: 1280x720
}, 120000); // 2 minutes

it('renders / correctly', async () => {
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  console.log('captured screenshot of /');

  const screenshot = await page.screenshot();
  expect(screenshot).toMatchImageSnapshot({
    failureThresholdType: 'percent', // 'pixel' or 'percent'
    failureThreshold: 0.01, // Tolerance level, e.g. 1%
  });
});

it('renders / correctly in light mode', async () => {
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  const sliderSelector = '.theme-switch .slider.round';

  await page.waitForSelector(sliderSelector, { visible: true });
  await page.click(sliderSelector);

  console.log('captured screenshot of / in light mode');

  const screenshot = await page.screenshot();
  expect(screenshot).toMatchImageSnapshot({
    failureThresholdType: 'percent', // 'pixel' or 'percent'
    failureThreshold: 0.01, // Tolerance level, e.g. 1%
  });
});

it('renders /blog correctly', async () => {
  await page.goto('http://localhost:3000/blog', { waitUntil: 'networkidle0' });

  const sliderSelector = '.theme-switch .slider.round';

  await page.waitForSelector(sliderSelector, { visible: true });
  await page.click(sliderSelector);

  console.log('captured screenshot of /blog');

  const screenshot = await page.screenshot();
  expect(screenshot).toMatchImageSnapshot({
    failureThresholdType: 'percent', // 'pixel' or 'percent'
    failureThreshold: 0.01, // Tolerance level, e.g. 1%
  });
});

it('renders /blog correctly in light mode', async () => {
  await page.goto('http://localhost:3000/blog', { waitUntil: 'networkidle0' });

  const sliderSelector = '.theme-switch .slider.round';

  await page.waitForSelector(sliderSelector, { visible: true });
  await page.click(sliderSelector);

  console.log('captured screenshot of /blog in light mode');

  const screenshot = await page.screenshot();
  expect(screenshot).toMatchImageSnapshot({
    failureThresholdType: 'percent', // 'pixel' or 'percent'
    failureThreshold: 0.01, // Tolerance level, e.g. 1%
  });
});

it('renders /tags correctly', async () => {
  await page.goto('http://localhost:3000/tags', { waitUntil: 'networkidle0' });

  const sliderSelector = '.theme-switch .slider.round';

  await page.waitForSelector(sliderSelector, { visible: true });
  await page.click(sliderSelector);

  console.log('captured screenshot of /tags');

  const screenshot = await page.screenshot();
  expect(screenshot).toMatchImageSnapshot({
    failureThresholdType: 'percent', // 'pixel' or 'percent'
    failureThreshold: 0.01, // Tolerance level, e.g. 1%
  });
});

it('renders /tags correctly in light mode', async () => {
  await page.goto('http://localhost:3000/tags', { waitUntil: 'networkidle0' });

  const sliderSelector = '.theme-switch .slider.round';

  await page.waitForSelector(sliderSelector, { visible: true });
  await page.click(sliderSelector);

  console.log('captured screenshot of /tags in light mode');

  const screenshot = await page.screenshot();
  expect(screenshot).toMatchImageSnapshot({
    failureThresholdType: 'percent', // 'pixel' or 'percent'
    failureThreshold: 0.01, // Tolerance level, e.g. 1%
  });
});

// TODO add tests for rss.xml and rss.json pages

it('renders /blog/what-are-const-generics-and-how-are-they-used-in-rust correctly', async () => {
  await page.goto('http://localhost:3000/blog/what-are-const-generics-and-how-are-they-used-in-rust', {
    waitUntil: 'networkidle0',
  });

  const sliderSelector = '.theme-switch .slider.round';

  await page.waitForSelector(sliderSelector, { visible: true });
  await page.click(sliderSelector);

  console.log('captured screenshot of /blog/what-are-const-generics-and-how-are-they-used-in-rust');

  const screenshot = await page.screenshot();
  expect(screenshot).toMatchImageSnapshot({
    failureThresholdType: 'percent', // 'pixel' or 'percent'
    failureThreshold: 0.01, // Tolerance level, e.g. 1%
  });
});

it('renders /blog/what-are-const-generics-and-how-are-they-used-in-rust correctly in light mode', async () => {
  await page.goto('http://localhost:3000/blog/what-are-const-generics-and-how-are-they-used-in-rust', {
    waitUntil: 'networkidle0',
  });

  const sliderSelector = '.theme-switch .slider.round';

  await page.waitForSelector(sliderSelector, { visible: true });
  await page.click(sliderSelector);

  console.log('captured screenshot of /blog/what-are-const-generics-and-how-are-they-used-in-rust in light mode');

  const screenshot = await page.screenshot();
  expect(screenshot).toMatchImageSnapshot({
    failureThresholdType: 'percent', // 'pixel' or 'percent'
    failureThreshold: 0.01, // Tolerance level, e.g. 1%
  });
});

afterAll(async () => {
  console.log('🧹 Cleaning up...');
  await browser.close();
  serverProcess.kill();
});

/* eslint-enable */
