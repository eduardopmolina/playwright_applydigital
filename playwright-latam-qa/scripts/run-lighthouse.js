const fs = require("fs");
const chromeLauncher = require("chrome-launcher");

(async () => {
  const lighthouse = (await import("lighthouse")).default; // Dynamically import ES module

  const category = process.argv[2] || "accessibility"; // Default to "accessibility" if no argument is given
  const url = "https://automationexercise.com/";

  let chrome;
  try {
    // Launch Chrome in headless mode
    chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });

    const options = { port: chrome.port, output: "json" };
    const runnerResult = await lighthouse(url, options);

    const categories = runnerResult.lhr.categories;
    const result = {
      accessibility: categories.accessibility.score * 100,
      performance: categories.performance.score * 100,
      seo: categories.seo.score * 100,
    };

    // Ensure the reports directory exists
    const reportsDir = "./reports";
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    // Write results to a JSON file
    const filePath = `${reportsDir}/lighthouse-${category}.json`;
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
    console.log("Lighthouse scores:", result);
    console.log(`Report saved to ${filePath}`);
  } catch (error) {
    console.error("Lighthouse failed:", error);
    process.exit(1);
  } finally {
    // Ensure Chrome is killed even if an error occurs
    if (chrome) {
      await chrome.kill();
    }
  }
})();
