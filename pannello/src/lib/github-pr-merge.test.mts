import { test } from "node:test";
import assert from "node:assert/strict";
import { estraiMergePr, isCanaleGithub } from "./github-pr-merge.ts";

test("isCanaleGithub riconosce canale github e titoli merge", () => {
  assert.equal(isCanaleGithub("github"), true);
  assert.equal(isCanaleGithub("Merge PR #352"), true);
  assert.equal(isCanaleGithub("email"), false);
});

test("estraiMergePr dal titolo standard git-pr.mjs", () => {
  const ref = estraiMergePr("Merge PR #352 ad-mycity → main", "https://github.com/NicolaeRotaru/ad-mycity/pull/352");
  assert.deepEqual(ref, { repo: "ad-mycity", pr: 352 });
});

test("estraiMergePr dall'URL GitHub", () => {
  const ref = estraiMergePr("Mergia la fix", "Vedi https://github.com/NicolaeRotaru/mycity/pull/41");
  assert.deepEqual(ref, { repo: "mycity", pr: 41 });
});

test("estraiMergePr null se manca il numero", () => {
  assert.equal(estraiMergePr("Qualcosa senza PR", "niente qui"), null);
});
