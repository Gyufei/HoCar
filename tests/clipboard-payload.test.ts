import assert from "node:assert/strict";

import {
  CLIPBOARD_CONTENT_MAX_LENGTH,
  DEFAULT_CLIPBOARD_KEY,
} from "@/lib/clipboard/constants";
import {
  buildClipboardResponse,
  clipboardSaveSchema,
} from "@/lib/clipboard/payload";

assert.equal(DEFAULT_CLIPBOARD_KEY, "default");
assert.equal(CLIPBOARD_CONTENT_MAX_LENGTH, 10000);

assert.deepEqual(clipboardSaveSchema.parse({ content: "" }), { content: "" });
assert.deepEqual(clipboardSaveSchema.parse({ content: "https://example.com" }), {
  content: "https://example.com",
});

assert.equal(
  clipboardSaveSchema.safeParse({
    content: "a".repeat(CLIPBOARD_CONTENT_MAX_LENGTH),
  }).success,
  true,
);

assert.equal(
  clipboardSaveSchema.safeParse({
    content: "a".repeat(CLIPBOARD_CONTENT_MAX_LENGTH + 1),
  }).success,
  false,
);

assert.deepEqual(buildClipboardResponse(null), {
  content: "",
  updated_at: null,
});

assert.deepEqual(
  buildClipboardResponse({
    content: "hello",
    updatedAt: new Date("2026-07-09T10:30:00.000Z"),
  }),
  {
    content: "hello",
    updated_at: "2026-07-09T10:30:00.000Z",
  },
);
