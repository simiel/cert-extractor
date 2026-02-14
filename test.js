// scripts/test-renderPage.js
const { chromium } = require("playwright");

async function renderPage(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page.evaluate(() => {
      document
        .querySelectorAll("script, style, noscript")
        .forEach((el) => el.remove());
    });

    const text = await page.evaluate(() => {
      return document.body ? document.body.innerText : "";
    });

    return text.trim() || "[No visible text found]";
  } finally {
    await browser.close();
  }
}

(async () => {
  const url =
    process.argv[2] ||
    "https://www.coursera.org/account/accomplishments/professional-cert/CDY6A3Z99GQC"; // or a Coursera certificate URL

  console.log("Fetching visible text from:", url);

  try {
    const text = await renderPage(url);
    console.log("\n=== FIRST 1000 CHARS OF PAGE TEXT ===\n");
    console.log(text.slice(0, 1000));
  } catch (err) {
    console.error("Error while rendering page:", err);
    process.exit(1);
  }
})();
