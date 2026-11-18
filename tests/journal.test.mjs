/** 展示规则必须与分类和特殊 tag 的约定一致，。 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { tsImport } from "tsx/esm/api";
const { articleTone } = await tsImport(
  "../src/config/journal.ts",
  import.meta.url,
);

test("分类色与特殊 tag 覆盖按固定优先级选择", () => {
  for (const [category, color] of Object.entries({
    walking: "blue",
    speaking: "red",
    hardware: "yellow",
    developer: "green",
  })) {
    assert.equal(articleTone(category, ["ordinary"]), color);
    for (const [tag, tone] of Object.entries({
      anime: "orange",
      cherry: "pink",
      dairy: "white",
    })) {
      assert.equal(articleTone(category, [tag]), tone);
    }
  }
  assert.equal(articleTone("walking", ["dairy", "cherry", "anime"]), "orange");
  assert.equal(articleTone("walking", ["anime", "cherry", "dairy"]), "orange");
});
