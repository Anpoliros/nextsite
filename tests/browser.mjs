/** 真实静态服务上的浏览器回归；先运行 build 和 preview:new。 */
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:2324";
const output = ".build/browser";
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1160, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
const wait = (ms) => page.waitForTimeout(ms);
const noOverflow = async () =>
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    `横向溢出: ${page.url()}`,
  );
const menu = async () =>
  page.getByRole("button", { name: "阅读偏好", exact: true }).click();
try {
  await page.goto(base);
  await wait(1200);
  assert.equal(
    await page.locator(".main-layout").getAttribute("data-open"),
    "false",
  );
  assert.equal(await page.locator("footer span").count(), 1);
  assert.equal(await page.locator(".photo-caption").count(), 3);
  const closedWidth = await page
    .locator(".card-slot")
    .first()
    .evaluate((node) => node.getBoundingClientRect().width);
  assert.equal(closedWidth, 640);
  const centered = await page.locator(".article-list").evaluate((node) => {
    const list = node.getBoundingClientRect(),
      main = node.parentElement.getBoundingClientRect();
    return Math.abs(list.left + list.right - (main.left + main.right)) < 1;
  });
  assert(centered, "收起侧栏时列表在主内容列居中");
  assert.equal(
    await page
      .locator(".masthead")
      .evaluate((node) => node.getBoundingClientRect().height),
    36,
  );
  assert.equal(
    await page
      .locator(".page-shell")
      .evaluate((node) => getComputedStyle(node).paddingTop),
    "36px",
  );
  assert.match(
    await page.locator(".article-content time").first().textContent(),
    /^[A-Z][a-z]{2} \d{2}, \d{4}$/,
  );
  await page.screenshot({ path: `${output}/home-light.png` });
  for (let i = 0; i < 4; i++) {
    const below = await page
      .locator(".photo-layer")
      .nth(1)
      .evaluate((element) => {
        window.retainedPhoto = element;
        return element.querySelector("img").src;
      });
    await page.getByRole("button", { name: "换一张照片", exact: true }).click();
    await wait(350);
    assert.equal(
      await page.locator(".hero-photo-stack").getAttribute("data-turn"),
      "idle",
    );
    assert.equal(
      await page
        .locator(".photo-layer")
        .first()
        .evaluate((element) => element === window.retainedPhoto),
      true,
    );
    assert.equal(
      await page.locator(".photo-layer img").first().getAttribute("src"),
      new URL(below).pathname,
    );
    assert.equal(
      await page
        .locator(".photo-layer")
        .last()
        .evaluate((element) => getComputedStyle(element).animationName),
      "none",
    );
  }
  const right = await page
    .locator(".bookmark")
    .first()
    .evaluate((element) => element.getBoundingClientRect().right);
  await page.getByRole("button", { name: "展开右边栏", exact: true }).click();
  await wait(550);
  assert(
    (await page
      .locator(".card-slot")
      .first()
      .evaluate((node) => node.getBoundingClientRect().width)) < closedWidth,
  );
  const openedRight = await page
    .locator(".bookmark")
    .first()
    .evaluate((element) => element.getBoundingClientRect().right);
  assert(Math.abs(right - openedRight) < 1, "书签右边缘收展固定");
  await page.getByRole("button", { name: "行走", exact: true }).click();
  assert.equal(
    await page.evaluate(() => scrollY),
    0,
    "已能看到列表顶部时不强行滚动",
  );
  await page.evaluate(() =>
    scrollTo(0, document.querySelector(".main-layout").offsetTop + 350),
  );
  await page.getByRole("button", { name: "开发", exact: true }).click();
  await wait(1000);
  assert(
    Math.abs(
      await page
        .locator(".main-layout")
        .evaluate((element) => element.getBoundingClientRect().top),
    ) < 3,
    "筛选滚动到 main-layout 顶部",
  );
  await page.evaluate(() => scrollTo(0, 0));
  await menu();
  await page.getByLabel("外观", { exact: true }).selectOption("dark");
  await page.getByLabel("纸张底纹", { exact: true }).selectOption("grid");
  await page.keyboard.press("Escape");
  assert(
    await page
      .locator("html")
      .evaluate((element) => element.classList.contains("dark")),
  );
  for (const selector of [".hero-photo", ".photo-caption"]) {
    assert.equal(
      await page
        .locator(selector)
        .first()
        .evaluate((node) => getComputedStyle(node).backgroundColor),
      "rgb(255, 255, 255)",
    );
  }
  assert.equal(
    await page
      .locator(".hashtag")
      .first()
      .evaluate((node) => getComputedStyle(node).color),
    "rgb(0, 0, 0)",
  );
  assert.equal(
    await page
      .locator(".article-card")
      .first()
      .evaluate((node) => getComputedStyle(node).backgroundColor),
    "rgb(27, 30, 35)",
  );
  await page.screenshot({ path: `${output}/home-dark.png` });
  for (const width of [800, 725, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await wait(600);
    await noOverflow();
  }
  const dot = page.locator(".floating-trigger");
  await page.reload();
  await wait(600);
  let bounds = await dot.boundingBox();
  assert.equal(Math.round(320 - bounds.x - bounds.width), 24);
  assert.equal(Math.round(844 - bounds.y - bounds.height), 24);
  await page.mouse.move(bounds.x + 22, bounds.y + 22);
  await page.mouse.move(bounds.x + 18, bounds.y + 18);
  assert.deepEqual(await dot.boundingBox(), bounds);
  await page.mouse.down();
  await page.mouse.move(100, 500, { steps: 10 });
  await page.mouse.up();
  assert.equal(await page.locator("#reader-menu").count(), 0);
  bounds = await dot.boundingBox();
  await page.mouse.move(120, 510);
  await page.mouse.move(160, 530);
  assert.deepEqual(await dot.boundingBox(), bounds);
  await menu();
  const tabs = await page.locator(".menu-tabs").boundingBox();
  assert(Math.abs(tabs.y + tabs.height + 12 - bounds.y) < 1);
  await page.keyboard.press("Escape");
  await page.screenshot({ path: `${output}/home-mobile.png` });
  await page.goto(`${base}/developer/auto-deploy/`);
  await wait(600);
  assert(
    await page
      .locator("html")
      .evaluate((element) => element.classList.contains("dark")),
  );
  assert.equal(
    await page.locator(".site").getAttribute("data-pattern"),
    "grid",
  );
  await noOverflow();
  await page.getByRole("button", { name: "目录 ☷", exact: true }).click();
  assert.equal(
    await page.locator("#mobile-contents").evaluate((element) => element.open),
    true,
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.locator("#mobile-contents").evaluate((element) => element.open),
    false,
  );
  await menu();
  await page.getByRole("button", { name: "阅读", exact: true }).click();
  const fontSize = page.getByLabel("正文字号", { exact: true });
  await fontSize.focus();
  await fontSize.press("Home");
  for (let i = 0; i < 4; i++) await fontSize.press("ArrowRight");
  await page.keyboard.press("Escape");
  await page.reload();
  await wait(500);
  assert.equal(
    await page
      .locator(".reading-body")
      .evaluate((element) => getComputedStyle(element).fontSize),
    "18px",
  );
  await page.screenshot({ path: `${output}/article-mobile.png` });
  await page.setViewportSize({ width: 1160, height: 900 });
  await wait(500);
  const second = page.locator("#desktop-contents a").nth(1);
  await page
    .locator(".reading-body h2")
    .first()
    .evaluate((node) => {
      window.originalHeading = node;
    });
  await second.click();
  await wait(700);
  assert.equal(await second.getAttribute("aria-current"), "location");
  assert(
    await page.evaluate(() => window.originalHeading.isConnected),
    "目录高亮不重建正文 DOM",
  );
  await page.evaluate(() => scrollTo(0, 0));
  await wait(200);
  await page.getByRole("button", { name: "收起文章目录", exact: true }).click();
  await wait(450);
  assert.equal(
    await page.locator(".article-page").getAttribute("data-desktop-toc-open"),
    "false",
  );
  await page.getByRole("button", { name: "展开文章目录", exact: true }).click();
  await wait(450);
  await page.screenshot({ path: `${output}/article-desktop.png` });
  const wrap = page.locator(".code-wrap-btn").first();
  if (await wrap.count()) {
    await wrap.click();
    assert.equal(
      await wrap.evaluate(
        (element) =>
          element.closest("figure").querySelector("pre").style.whiteSpace,
      ),
      "pre-wrap",
    );
  }
  // 真实长目录文章与图片文章，在桌面/中屏/手机都不能撑出页面。
  const routes = JSON.parse(await readFile("dist/routes.json", "utf8"));
  let longest = { route: "", count: 0 };
  for (const route of routes.filter((route) =>
    route.startsWith("/developer/"),
  )) {
    const html = await readFile(
      `dist${decodeURIComponent(route)}index.html`,
      "utf8",
    );
    const data = JSON.parse(
      html.match(
        /<script id="page-data" type="application\/json">([\s\S]*?)<\/script>/,
      )[1],
    );
    if (data.rendered.toc.length > longest.count)
      longest = { route, count: data.rendered.toc.length };
  }
  for (const route of [longest.route, "/walking/june26/", "/about/"]) {
    for (const width of [1160, 820, 390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(base + route);
      await wait(350);
      await noOverflow();
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base);
  await wait(500);
  assert.equal(
    await page.locator(".site").getAttribute("data-reduced"),
    "true",
  );
  await page.getByRole("button", { name: "换一张照片", exact: true }).click();
  assert.equal(
    await page.locator(".hero-photo-stack").getAttribute("data-turn"),
    "idle",
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS 主页/文章、相片连续切换、书签锚点/筛选滚动、拖动与菜单、主题与阅读偏好持久化、目录抽屉/跟随/收展、代码折行、长目录/图片与窄屏、减少动效",
  );
} finally {
  await browser.close();
}
