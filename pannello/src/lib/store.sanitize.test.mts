import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeDbText } from "./store.ts";

test("sanitizeDbText rimuove NUL e surrogate isolati", () => {
  assert.equal(sanitizeDbText("ciao\u0000mondo"), "ciaomondo");
  assert.equal(sanitizeDbText("ok \uD800 test"), "ok  test");
  assert.ok(JSON.stringify({ t: sanitizeDbText("x\u0000y") }));
});
