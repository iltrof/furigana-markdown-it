try {
  const root = require("child_process")
    .execSync("npm root -g")
    .toString()
    .trim();
  var puppeteer = require(root + "/puppeteer");
} catch (err) {
  console.error(
    `Install puppeteer globally first with: npm install -g puppeteer`
  );
  process.exit(1);
}

const html = require("fs")
  .readFileSync("examples.html", { encoding: "utf8" })
  .split("\n");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (let i = 0; i < html.length; i++) {
    if (html[i] == "") {
      continue;
    }

    await page.setContent(
      `<div style='display:inline-block; font-size: 2em; font-family: meiryo'>${html[i]}</ruby></div>`
    );

    const rect = await page.evaluate(selector => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const { x, y, width, height } = element.getBoundingClientRect();
      return { left: x, top: y, width, height, id: element.id };
    }, "div");

    await page.screenshot({
      path: `${i + 1}.png`,
      clip: {
        x: rect.left - 5,
        y: rect.top - 3,
        width: rect.width + 10,
        height: rect.height
      }
    });
  }

  await browser.close();
})();
