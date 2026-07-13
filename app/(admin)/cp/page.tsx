"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ClipboardCopy, RefreshCw, Save } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CLIPBOARD_CONTENT_MAX_LENGTH } from "@/lib/clipboard/constants";

type ClipboardData = {
  content: string;
  updated_at: string | null;
};

export default function ClipboardPage() {
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadClipboard = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/cp");
      const json = await res.json();
      if (json.success) {
        const data = json.data as ClipboardData;
        setContent(data.content);
        setSavedContent(data.content);
        setLastUpdated(data.updated_at);
      }
    } catch {
      setMessage("加载失败，请检查网络");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClipboard();
  }, [loadClipboard]);

  const handleSave = useCallback(async () => {
    if (content.length > CLIPBOARD_CONTENT_MAX_LENGTH) {
      setMessage(`内容过长，不能超过 ${CLIPBOARD_CONTENT_MAX_LENGTH} 个字符`);
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/cp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (json.success) {
        setSavedContent(content);
        setLastUpdated(json.data.updated_at);
        setMessage("保存成功");
      } else {
        setMessage(json.error?.message ?? "保存失败");
      }
    } catch {
      setMessage("保存失败，请检查网络");
    } finally {
      setSaving(false);
    }
  }, [content]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setMessage("已复制到剪切板");
    } catch {
      textareaRef.current?.select();
      setMessage("复制失败，请手动选中复制");
    }
  }, [content]);

  const handleRefresh = useCallback(() => {
    if (content !== savedContent) {
      if (!window.confirm("当前内容未保存，刷新会覆盖本地修改，是否继续？")) {
        return;
      }
    }
    loadClipboard();
  }, [content, savedContent, loadClipboard]);

  return (
    <>
      <PageHeader
        title="共享剪切板"
        description="粘贴一段文本，跨设备传递。刷新后在其他设备查看。"
      />

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <textarea
            ref={textareaRef}
            className="w-full min-h-[200px] resize-y rounded-lg border border-border/70 bg-background p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring/50 sm:min-h-[300px]"
            placeholder="在此粘贴文本..."
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setMessage(null);
            }}
            disabled={loading}
          />

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {message ? (
              <span className="text-sm text-muted-foreground">{message}</span>
            ) : loading ? (
              <span className="text-sm text-muted-foreground">加载中...</span>
            ) : (
              <span className="text-sm text-muted-foreground">
                {content.length} / {CLIPBOARD_CONTENT_MAX_LENGTH}
                {lastUpdated ? (
                  <span className="ml-2">
                    上次保存：{new Date(lastUpdated).toLocaleString("zh-CN")}
                  </span>
                ) : (
                  <span className="ml-2">暂未保存</span>
                )}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={saving || loading}>
              <Save className="size-4" />
              {saving ? "保存中..." : "保存"}
            </Button>
            <Button variant="outline" onClick={handleCopy} disabled={loading}>
              <ClipboardCopy className="size-4" />
              复制
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className="size-4" />
              刷新
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
