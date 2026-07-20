import test from "node:test";
import assert from "node:assert/strict";
import { redigiTesto } from "../segreti-pattern.mjs";

test("redigiTesto rimuove un PAT GitHub intero", () => {
  const fakePat = `github_pat_11${"X".repeat(25)}`;
  const t = `leak ${fakePat} qui`;
  const r = redigiTesto(t);
  assert.ok(!r.includes("XXXX"));
  assert.match(r, /github_pat_11…\[REDATTO\]/);
});
