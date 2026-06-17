"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calculator, RotateCcw, Save, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BillType = "ELE" | "WATER";

type BillKindConfig = {
  type: BillType;
  title: string;
  description: string;
  amountLabel: string;
  currentALabel: string;
  previousALabel: string;
  currentBLabel: string;
  previousBLabel: string;
  amountError: string;
  currentAError: string;
  currentBError: string;
  zeroUsageError: string;
  storageKey: string;
  usageUnit: string;
};

type StoredReadings = {
  userALastCurrent?: number;
  userBLastCurrent?: number;
};

type Results = {
  billA: number;
  billB: number;
  usageA: number;
  usageB: number;
  totalUsage: number;
} | null;

type BillRecord = {
  id: string;
  year: number;
  month: number;
  amount: number;
  usage: number;
  createdAt: string;
};

type BillApiItem = {
  id: string;
  year: number;
  month: number;
  amount: string | number;
  usage: string | number;
  createdAt: string;
};

function isBillApiItem(item: unknown): item is BillApiItem {
  if (!item || typeof item !== "object") {
    return false;
  }

  const record = item as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.year === "number" &&
    typeof record.month === "number" &&
    (typeof record.amount === "string" || typeof record.amount === "number") &&
    (typeof record.usage === "string" || typeof record.usage === "number") &&
    typeof record.createdAt === "string"
  );
}

function isBillListResponse(value: unknown): value is { success: true; data: BillApiItem[] } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return record.success === true && Array.isArray(record.data);
}

function readStoredReadings(storageKey: string): StoredReadings {
  if (typeof window === "undefined") {
    return {};
  }

  const stored = window.localStorage.getItem(storageKey);
  if (!stored) {
    return {};
  }

  try {
    return JSON.parse(stored) as StoredReadings;
  } catch {
    return {};
  }
}

function toAmount(value: string) {
  return Number.parseFloat(value) || 0;
}

function formatCurrency(value: number) {
  return value.toFixed(2);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function BillCalculatorPage({ config }: { config: BillKindConfig }) {
  const [userACurrent, setUserACurrent] = useState("");
  const [userAPrevious, setUserAPrevious] = useState("");
  const [userBCurrent, setUserBCurrent] = useState("");
  const [userBPrevious, setUserBPrevious] = useState("");
  const [totalBill, setTotalBill] = useState("");
  const [results, setResults] = useState<Results>(null);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [history, setHistory] = useState<BillRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const totalUsageFromResults = useMemo(
    () => (results ? results.totalUsage : 0),
    [results],
  );

  useEffect(() => {
    const readings = readStoredReadings(config.storageKey);
    if (readings.userALastCurrent != null) {
      setUserAPrevious(String(readings.userALastCurrent));
    }
    if (readings.userBLastCurrent != null) {
      setUserBPrevious(String(readings.userBLastCurrent));
    }
  }, [config.storageKey]);

  const saveReadings = useCallback(() => {
    if (typeof window === "undefined") return;

    const readings = {
      userALastCurrent: toAmount(userACurrent),
      userBLastCurrent: toAmount(userBCurrent),
      timestamp: new Date().toISOString(),
    };

    window.localStorage.setItem(config.storageKey, JSON.stringify(readings));
  }, [config.storageKey, userACurrent, userBCurrent]);

  const calculateBills = useCallback(() => {
    setFormError(null);
    const userACurrentNum = toAmount(userACurrent);
    const userAPreviousNum = toAmount(userAPrevious);
    const userBCurrentNum = toAmount(userBCurrent);
    const userBPreviousNum = toAmount(userBPrevious);
    const totalBillNum = toAmount(totalBill);

    if (userACurrentNum < userAPreviousNum) {
      setFormError(config.currentAError);
      return;
    }
    if (userBCurrentNum < userBPreviousNum) {
      setFormError(config.currentBError);
      return;
    }
    if (totalBillNum <= 0) {
      setFormError(config.amountError);
      return;
    }

    const usageA = userACurrentNum - userAPreviousNum;
    const usageB = userBCurrentNum - userBPreviousNum;
    const totalUsage = usageA + usageB;

    if (totalUsage === 0) {
      setFormError(config.zeroUsageError);
      return;
    }

    setResults({
      billA: (usageA / totalUsage) * totalBillNum,
      billB: (usageB / totalUsage) * totalBillNum,
      usageA,
      usageB,
      totalUsage,
    });

    saveReadings();
  }, [
    config.amountError,
    config.currentAError,
    config.currentBError,
    config.zeroUsageError,
    saveReadings,
    totalBill,
    userACurrent,
    userAPrevious,
    userBCurrent,
    userBPrevious,
  ]);

  const resetForm = useCallback(() => {
    setUserACurrent("");
    setUserAPrevious("");
    setUserBCurrent("");
    setUserBPrevious("");
    setTotalBill("");
    setResults(null);
    setFormError(null);

    if (typeof window === "undefined") return;

    if (window.confirm("是否同时清除浏览器中保存的上次读数记录？")) {
      window.localStorage.removeItem(config.storageKey);
      return;
    }

    const readings = readStoredReadings(config.storageKey);
    if (readings.userALastCurrent != null) {
      setUserAPrevious(String(readings.userALastCurrent));
    }
    if (readings.userBLastCurrent != null) {
      setUserBPrevious(String(readings.userBLastCurrent));
    }
  }, [config.storageKey]);

  const loadHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      setHistoryError(null);
      const res = await fetch(`/api/bills?type=${config.type}`);
      if (!res.ok) {
        throw new Error("加载历史记录失败");
      }
      const data: unknown = await res.json();
      if (!isBillListResponse(data)) {
        throw new Error("加载历史记录失败");
      }

      setHistory(
        data.data.filter(isBillApiItem).map((item) => ({
          id: item.id,
          year: item.year,
          month: item.month,
          amount: Number(item.amount),
          usage: Number(item.usage),
          createdAt: item.createdAt,
        })),
      );
    } catch (error) {
      console.error(error);
      setHistoryError("加载历史记录失败，请稍后重试。");
    } finally {
      setLoadingHistory(false);
    }
  }, [config.type]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        calculateBills();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [calculateBills]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      const userACurrentNum = Number.parseFloat(userACurrent);
      const userBCurrentNum = Number.parseFloat(userBCurrent);

      if (
        !Number.isNaN(userACurrentNum) ||
        !Number.isNaN(userBCurrentNum)
      ) {
        saveReadings();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saveReadings, userACurrent, userBCurrent]);

  const handleSaveBill = useCallback(async () => {
    if (!results) {
      setSavingError("请先完成一次计算，再保存记录。");
      return;
    }

    const amountNum = toAmount(totalBill);
    if (amountNum <= 0 || totalUsageFromResults <= 0) {
      setSavingError("总金额或总用量不合法，无法保存。");
      return;
    }

    setSaving(true);
    setSavingError(null);
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: config.type,
          year,
          month,
          amount: amountNum,
          usage: totalUsageFromResults,
        }),
      });

      if (!res.ok) {
        throw new Error("保存失败");
      }

      const data = (await res.json()) as { success?: boolean };
      if (!data.success) {
        throw new Error("保存失败");
      }

      await loadHistory();
    } catch (error) {
      console.error(error);
      setSavingError("保存失败，请稍后重试。");
    } finally {
      setSaving(false);
    }
  }, [
    config.type,
    loadHistory,
    month,
    results,
    totalBill,
    totalUsageFromResults,
    year,
  ]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("确定要删除这条记录吗？")) return;

      try {
        const res = await fetch(`/api/bills/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error("删除失败");
        }

        const data = (await res.json()) as { success?: boolean };
        if (!data.success) {
          throw new Error("删除失败");
        }

        await loadHistory();
      } catch (error) {
        console.error(error);
        setHistoryError("删除失败，请稍后再试。");
      }
    },
    [loadHistory],
  );

  return (
    <>
      <PageHeader title={config.title} description={config.description} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>读数与金额</CardTitle>
              <CardDescription>
                输入双方本次和上次读数，系统会按用量比例拆分金额。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="user-a-current">{config.currentALabel}</Label>
                  <Input
                    id="user-a-current"
                    type="number"
                    inputMode="decimal"
                    value={userACurrent}
                    onChange={(e) => setUserACurrent(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-a-previous">{config.previousALabel}</Label>
                  <Input
                    id="user-a-previous"
                    type="number"
                    inputMode="decimal"
                    value={userAPrevious}
                    onChange={(e) => setUserAPrevious(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-b-current">{config.currentBLabel}</Label>
                  <Input
                    id="user-b-current"
                    type="number"
                    inputMode="decimal"
                    value={userBCurrent}
                    onChange={(e) => setUserBCurrent(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-b-previous">{config.previousBLabel}</Label>
                  <Input
                    id="user-b-previous"
                    type="number"
                    inputMode="decimal"
                    value={userBPrevious}
                    onChange={(e) => setUserBPrevious(e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="total-bill">{config.amountLabel}</Label>
                  <Input
                    id="total-bill"
                    type="number"
                    inputMode="decimal"
                    value={totalBill}
                    onChange={(e) => setTotalBill(e.target.value)}
                  />
                </div>
              </div>

              {formError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </div>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" onClick={calculateBills}>
                  <Calculator className="size-4" />
                  计算
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <RotateCcw className="size-4" />
                  重置
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>历史记录</CardTitle>
              <CardDescription>已保存的账单记录。</CardDescription>
            </CardHeader>
            <CardContent>
              {historyError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {historyError}
                </div>
              ) : loadingHistory ? (
                <div className="text-sm text-muted-foreground">正在加载...</div>
              ) : history.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                  暂无记录。完成计算后可以保存到这里。
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead className="border-b text-left text-muted-foreground">
                      <tr>
                        <th className="py-2 pr-4 font-medium">月份</th>
                        <th className="py-2 pr-4 font-medium">金额</th>
                        <th className="py-2 pr-4 font-medium">用量</th>
                        <th className="py-2 pr-4 font-medium">保存时间</th>
                        <th className="py-2 text-right font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {history.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 pr-4">
                            {item.year} 年 {item.month} 月
                          </td>
                          <td className="py-3 pr-4">
                            ¥{formatCurrency(item.amount)}
                          </td>
                          <td className="py-3 pr-4">
                            {item.usage} {config.usageUnit}
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="py-3 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label="删除记录"
                              onClick={() => void handleDelete(item.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>计算结果</CardTitle>
              <CardDescription>计算后可保存为本月记录。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {results ? (
                <>
                  <div className="grid gap-3">
                    <ResultRow label="我家应付" value={`¥${formatCurrency(results.billA)}`} />
                    <ResultRow label="对家应付" value={`¥${formatCurrency(results.billB)}`} />
                    <ResultRow label="我家用量" value={`${results.usageA} ${config.usageUnit}`} />
                    <ResultRow label="对家用量" value={`${results.usageB} ${config.usageUnit}`} />
                    <ResultRow label="总用量" value={`${results.totalUsage} ${config.usageUnit}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="bill-year">年份</Label>
                      <Input
                        id="bill-year"
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bill-month">月份</Label>
                      <Input
                        id="bill-month"
                        type="number"
                        min={1}
                        max={12}
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  {savingError ? (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {savingError}
                    </div>
                  ) : null}
                  <Button
                    type="button"
                    className="w-full"
                    disabled={saving}
                    onClick={() => void handleSaveBill()}
                  >
                    <Save className="size-4" />
                    {saving ? "正在保存..." : "保存记录"}
                  </Button>
                </>
              ) : (
                <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                  输入读数并点击计算后，结果会显示在这里。
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

export const electricityBillConfig: BillKindConfig = {
  type: "ELE",
  title: "电费",
  description: "按两户电表读数拆分本期电费，并保存历史记录。",
  amountLabel: "总电费金额",
  currentALabel: "我家本月电表度数",
  previousALabel: "我家上月表底读数",
  currentBLabel: "对家本月电表度数",
  previousBLabel: "对家上月表底读数",
  amountError: "请输入正确的总电费金额。",
  currentAError: "我家本月电表度数不能小于上月表底读数。",
  currentBError: "对家本月电表度数不能小于上月表底读数。",
  zeroUsageError: "总用电量不能为 0。",
  storageKey: "electricityLastMonthReadings",
  usageUnit: "度",
};

export const waterBillConfig: BillKindConfig = {
  type: "WATER",
  title: "水费",
  description: "按两户水表读数拆分本期水费，并保存历史记录。",
  amountLabel: "总水费金额",
  currentALabel: "我家本次水表读数",
  previousALabel: "我家上次表底读数",
  currentBLabel: "对家本次水表读数",
  previousBLabel: "对家上次表底读数",
  amountError: "请输入正确的总水费金额。",
  currentAError: "我家本次水表读数不能小于上次表底读数。",
  currentBError: "对家本次水表读数不能小于上次表底读数。",
  zeroUsageError: "总用水量不能为 0。",
  storageKey: "waterLastReadings",
  usageUnit: "吨",
};
