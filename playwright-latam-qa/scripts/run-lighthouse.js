// scripts/run-lighthouse.js
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { writeFileSync } from 'node:fs';

// Use top-level await as per linting suggestions
  const category = process.argv[2] || 'accessibility'; // or 'performance'
  const url = 'https://automationexercise.com/';

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = { port: chrome.port, output: 'json' };
  const runnerResult = await lighthouse(url, options);

  const categories = runnerResult.lhr.categories;
  const result = {
    accessibility: categories.accessibility.score * 100,
    performance: categories.performance.score * 100,
    seo: categories.seo.score * 100
  };

  writeFileSync(`reports/lighthouse-${category}.json`, JSON.stringify(result, null, 2));
  console.log('Lighthouse scores:', result);

  await chrome.kill();
