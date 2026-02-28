const { chromium } = require("playwright");

const START_SEED = 51;
const END_SEED = 60;

function sumNumbersInText(text) {
  const matches = text.match(/-?\d+(?:,\d{3})*(?:\.\d+)?/g) || [];
  return matches.reduce((acc, raw) => acc + Number(raw.replace(/,/g, "")), 0);
}

async function sumTablesForSeed(page, seed) {
  const url = `https://sanand0.github.io/tdsdata/js_table/?seed=${seed}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("table");
  await page.waitForFunction(() => document.querySelectorAll("table tr").length > 0);

  return page.$$eval("table", (tables) => {
    const parse = (text) => {
      const matches = text.match(/-?\d+(?:,\d{3})*(?:\.\d+)?/g) || [];
      return matches.reduce((acc, raw) => acc + Number(raw.replace(/,/g, "")), 0);
    };

    return tables.reduce((total, table) => total + parse(table.innerText), 0);
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let grandTotal = 0;
  for (let seed = START_SEED; seed <= END_SEED; seed += 1) {
    const seedTotal = await sumTablesForSeed(page, seed);
    grandTotal += seedTotal;
    console.log(`Seed ${seed}: ${seedTotal}`);
  }

  console.log(`TOTAL_SUM=${grandTotal}`);
  await browser.close();
}

main().catch((error) => {
  console.error("Failed to compute table totals:", error);
  process.exit(1);
});
