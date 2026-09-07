import { defineUnlighthouseConfig } from "unlighthouse/config";

export default defineUnlighthouseConfig({
  site: "https://dillonsmedley.com/",
  puppeteerOptions: {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  ci: {
    budget: {
      performance: 90,
      accessibility: 95,
    },
  },
});
