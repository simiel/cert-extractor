// tools/renderPage.ts
import { tool } from "ai";
import { z } from "zod";
import { chromium } from "playwright";

export const renderPageFunc = async ({ url }: { url: string }) => {
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
      return document.body.innerText;
    });
    return text.trim() || "[No visible text found]";
  } finally {
    await browser.close();
  }
};

export const renderPageTool = tool({
  description:
    "Fetch and return all visible text from a fully rendered webpage.",

  inputSchema: z.object({
    url: z.string().url(),
  }),

  execute: renderPageFunc,
});
