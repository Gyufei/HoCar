import { z } from "zod";

import { CLIPBOARD_CONTENT_MAX_LENGTH } from "@/lib/clipboard/constants";

export const clipboardSaveSchema = z.object({
  content: z.string().max(CLIPBOARD_CONTENT_MAX_LENGTH),
});

type ClipboardResponseEntry = {
  content: string;
  updatedAt: Date;
} | null;

export function buildClipboardResponse(entry: ClipboardResponseEntry) {
  return {
    content: entry?.content ?? "",
    updated_at: entry?.updatedAt.toISOString() ?? null,
  };
}
