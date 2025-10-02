(async () => {
  
  const lighthouse = require('lighthouse').default;
  const chromeLauncher = await import("chrome-launcher");
  const fs = require("fs");

  const category = process.argv[2] || "accessibility";
  const url = "https://automationexercise.com/";
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  const options = { port: chrome.port, output: "json" };
  const runnerResult = await lighthouse(url, options);
  const categories = runnerResult.lhr.categories;
  const result = {
    accessibility: categories.accessibility.score * 100,
    performance: categories.performance.score * 100,
    seo: categories.seo.score * 100
  };
  try {
  const result = await lighthouse(url, options);
  } catch (error) {
    console.error("Lighthouse failed:", error);
    process.exit(1);
  }
  fs.writeFileSync(`./reports/lighthouse-${category}.json`, JSON.stringify(result, null, 2));
  console.log("Lighthouse scores:", result);
  await chrome.kill();
})();



