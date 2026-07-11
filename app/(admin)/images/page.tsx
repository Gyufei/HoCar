"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Copy,
  Check,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Types

type UploadFileData = {
  url: string;
  filename: string;
  storename: string;
  size: number;
  width: number;
  height: number;
  hash: string;
  delete: string;
};

type UploadResp = {
  code: number;
  data: UploadFileData;
  message: string;
};

type HistoryItem = {
  file_id: number;
  url: string;
  filename: string;
  storename: string;
  size: number;
  width: number;
  height: number;
  hash: string;
  delete: string;
  created_at: number;
};

type HistoryResp = {
  success: boolean;
  data: HistoryItem[];
  CurrentPage: number;
  TotalPages: number;
  PerPage: number;
};

// Helpers

function formatSize(bytes: number): string {
  if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}

function formatTs(ts: number): string {
  return new Date(ts * 1000).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Main component

export default function ImagesPage() {
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadFileData | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [deletingHash, setDeletingHash] = useState<string | null>(null);

  // Copy feedback
  const [copied, setCopied] = useState<string | null>(null);

  // ---- Upload logic ----

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("只支持图片文件");
      return;
    }

    setUploading(true);
    setUploadResult(null);
    setUploadError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/images/upload", { method: "POST", body: fd });
      const json: UploadResp = await res.json();

      if (!res.ok || json.code !== 200) {
        setUploadError(json.message || "上传失败");
        return;
      }

      setUploadResult(json.data);

      // Copy markdown to clipboard automatically
      const md = `![](${json.data.url})`;
      try {
        await navigator.clipboard.writeText(md);
        setCopied("markdown");
        setTimeout(() => setCopied(null), 2000);
      } catch {
        // clipboard not available, silently skip
      }

      // Refresh history
      fetchHistory(1);
      setCurrentPage(1);
    } catch {
      setUploadError("上传请求失败，请检查网络");
    } finally {
      setUploading(false);
    }
  }, []);

  // ---- Drag & drop handlers ----

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);

      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      // Reset so selecting the same file again triggers onChange
      e.target.value = "";
    },
    [uploadFile]
  );

  // ---- Copy handler ----

  const handleCopy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
    }
  }, []);

  // ---- History logic ----

  const fetchHistory = useCallback(async (page: number) => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await fetch(`/api/images/history?page=${page}`);
      const json: HistoryResp = await res.json();

      if (!res.ok || !json.success) {
        setHistoryError("获取历史记录失败");
        return;
      }

      setHistory(json.data || []);
      setTotalPages(json.TotalPages || 1);
    } catch {
      setHistoryError("获取历史记录失败，请检查网络");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage, fetchHistory]);

  const handleDelete = useCallback(
    async (hash: string) => {
      if (!window.confirm("确定要删除这张图片吗？删除后无法恢复。")) return;

      setDeletingHash(hash);
      try {
        const res = await fetch(`/api/images/delete/${hash}`, { method: "DELETE" });
        const json = await res.json();

        if (!res.ok || !json.success) {
          alert(json.message || "删除失败");
          return;
        }

        // Refresh current page
        fetchHistory(currentPage);
      } catch {
        alert("删除请求失败，请检查网络");
      } finally {
        setDeletingHash(null);
      }
    },
    [currentPage, fetchHistory]
  );

  // ---- Render helpers ----

  const renderUploadZone = () => {
    if (uploading) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/[0.02] px-4 py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">正在上传...</p>
        </div>
      );
    }

    return (
      <div
        className={
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-12 transition-colors " +
          (dragOver
            ? "border-primary bg-primary/5"
            : "border-border/70 bg-muted/30 hover:border-primary/40 hover:bg-primary/[0.03]")
        }
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Upload className="size-6" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            拖拽图片到此处，或<span className="text-primary">点击选择</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PNG / JPG / WebP / GIF
          </p>
        </div>
      </div>
    );
  };

  const renderUploadResult = () => {
    if (!uploadResult) return null;

    const d = uploadResult;
    const md = `![](${d.url})`;

    return (
      <div className="mt-4 rounded-xl border border-border/70 bg-card p-4">
        <div className="flex gap-4">
          {/* Preview */}
          <div className="size-24 shrink-0 overflow-hidden rounded-lg border bg-muted/30">
            <img
              src={d.url}
              alt={d.filename}
              className="size-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="truncate text-sm font-medium">{d.filename}</p>
            <p className="text-xs text-muted-foreground">
              {formatSize(d.size)} &middot; {d.width}&times;{d.height}
            </p>

            {/* Markdown */}
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1 text-xs">
                {md}
              </code>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleCopy(md, "md-result")}
              >
                {copied === "md-result" ? (
                  <Check className="size-3.5 text-success" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>

            {/* Raw URL */}
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1 text-xs">
                {d.url}
              </code>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleCopy(d.url, "url-result")}
              >
                {copied === "url-result" ? (
                  <Check className="size-3.5 text-success" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUploadError = () => {
    if (!uploadError) return null;
    return (
      <p className="mt-3 text-sm text-destructive">{uploadError}</p>
    );
  };

  const renderHistory = () => {
    if (historyLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (historyError) {
      return (
        <div className="py-8 text-center text-sm text-destructive">
          {historyError}
        </div>
      );
    }

    if (history.length === 0) {
      return (
        <div className="flex flex-col items-center gap-2 py-16 text-sm text-muted-foreground">
          <ImageIcon className="size-8" />
          <p>还没有上传记录</p>
        </div>
      );
    }

    return (
      <>
        <div className="divide-y divide-border/50">
          {history.map((item) => {
            const md = `![](${item.url})`;
            return (
              <div
                key={item.hash}
                className="flex items-center gap-3 px-2 py-3"
              >
                {/* Thumbnail */}
                <div className="size-10 shrink-0 overflow-hidden rounded-md border bg-muted/30">
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="size-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{item.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(item.size)}
                    {item.width ? ` · ${item.width}×${item.height}` : ""}
                    {item.created_at ? ` · ${formatTs(item.created_at)}` : ""}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleCopy(md, `md-${item.hash}`)}
                  >
                    {copied === `md-${item.hash}` ? (
                      <Check className="size-3 text-success" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground hover:text-destructive"
                    disabled={deletingHash === item.hash}
                    onClick={() => handleDelete(item.hash)}
                  >
                    {deletingHash === item.hash ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Trash2 className="size-3" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-border/50 px-2 py-3">
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-xs tabular-nums text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <PageHeader
        title="图床服务"
        description="上传图片到公共图床，获取外链和 Markdown 格式。"
      />

      {/* Upload Section */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          {renderUploadZone()}
          {renderUploadError()}
          {renderUploadResult()}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* History Section */}
      <Card>
        <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3 sm:px-6">
          <ImageIcon className="size-4 text-primary" />
          <h2 className="text-sm font-medium">上传历史</h2>
        </div>
        {renderHistory()}
      </Card>
    </>
  );
}
