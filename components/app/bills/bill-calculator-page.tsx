"use client";

import { useCallback, useEffect, useState } from "react";
import { Calculator, RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
import {
  buildBillRecordPayload,
  findPreviousBillReadings,
  type BillRecordPayload,
  type BillType,
} from "@/lib/bills/record-payload";

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
  unitPrice: number | null;
  selfPreviousReading: number | null;
  selfCurrentReading: number | null;
  selfUsage: number | null;
  selfAmount: number | null;
  peerPreviousReading: number | null;
  peerCurrentReading: number | null;
  peerUsage: number | null;
  peerAmount: number | null;
  createdAt: string;
};

type BillApiItem = {
  id: string;
  year: number;
  month: number;
  amount: string | number;
  usage: string | number;
  unitPrice?: string | number | null;
  selfPreviousReading?: string | number | null;
  selfCurrentReading?: string | number | null;
  selfUsage?: string | number | null;
  selfAmount?: string | number | null;
  peerPreviousReading?: string | number | null;
  peerCurrentReading?: string | number | null;
  peerUsage?: string | number | null;
  peerAmount?: string | number | null;
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

function toAmount(value: string) {
  return Number.parseFloat(value) || 0;
}

function toNullableNumber(value: string | number | null | undefined) {
  if (value == null) {
    return null;
  }

  return Number(value);
}

function formatCurrency(value: number) {
  return value.toFixed(2);
}

function formatNullableCurrency(value: number | null) {
  return value == null ? "未记录" : `¥${formatCurrency(value)}`;
}

function formatNullableUsage(value: number | null, unit: string) {
  return value == null ? "未记录" : `${value} ${unit}`;
}

function formatReadingRange(
  previous: number | null,
  current: number | null,
  unit: string,
) {
  if (previous == null || current == null) {
    return "未记录";
  }

  return `${previous} → ${current} ${unit}`;
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

function mapBillApiItem(item: BillApiItem): BillRecord {
  return {
    id: item.id,
    year: item.year,
    month: item.month,
    amount: Number(item.amount),
    usage: Number(item.usage),
    unitPrice: toNullableNumber(item.unitPrice),
    selfPreviousReading: toNullableNumber(item.selfPreviousReading),
    selfCurrentReading: toNullableNumber(item.selfCurrentReading),
    selfUsage: toNullableNumber(item.selfUsage),
    selfAmount: toNullableNumber(item.selfAmount),
    peerPreviousReading: toNullableNumber(item.peerPreviousReading),
    peerCurrentReading: toNullableNumber(item.peerCurrentReading),
    peerUsage: toNullableNumber(item.peerUsage),
    peerAmount: toNullableNumber(item.peerAmount),
    createdAt: item.createdAt,
  };
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
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [history, setHistory] = useState<BillRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(config.storageKey);
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

      const records = data.data.filter(isBillApiItem).map(mapBillApiItem);
      setHistory(records);

      const previousReadings = findPreviousBillReadings(records, year, month);
      if (previousReadings) {
        setUserAPrevious(String(previousReadings.selfPreviousReading));
        setUserBPrevious(String(previousReadings.peerPreviousReading));
      }
    } catch (error) {
      console.error(error);
      setHistoryError("加载历史记录失败，请稍后重试。");
    } finally {
      setLoadingHistory(false);
    }
  }, [config.type, month, year]);

  const saveBillRecord = useCallback(async (payload: BillRecordPayload) => {
    const res = await fetch("/api/bills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("保存失败");
    }

    const data = (await res.json()) as { success?: boolean };
    if (!data.success) {
      throw new Error("保存失败");
    }
  }, []);

  const calculateBills = useCallback(async () => {
    setFormError(null);
    setSavingError(null);
    setSaveStatus(null);

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

    let payload: BillRecordPayload;
    try {
      payload = buildBillRecordPayload({
        type: config.type,
        year,
        month,
        selfPreviousReading: userAPreviousNum,
        selfCurrentReading: userACurrentNum,
        peerPreviousReading: userBPreviousNum,
        peerCurrentReading: userBCurrentNum,
        totalAmount: totalBillNum,
      });
    } catch {
      setFormError(config.zeroUsageError);
      return;
    }

    setResults({
      billA: payload.selfAmount,
      billB: payload.peerAmount,
      usageA: payload.selfUsage,
      usageB: payload.peerUsage,
      totalUsage: payload.usage,
    });

    setSaving(true);
    try {
      await saveBillRecord(payload);
      await loadHistory();
      setSaveStatus("已保存或更新当月记录。");
    } catch (error) {
      console.error(error);
      setSavingError("保存失败，请稍后重试。");
    } finally {
      setSaving(false);
    }
  }, [
    config.amountError,
    config.currentAError,
    config.currentBError,
    config.type,
    config.zeroUsageError,
    loadHistory,
    month,
    saveBillRecord,
    totalBill,
    userACurrent,
    userAPrevious,
    userBCurrent,
    userBPrevious,
    year,
  ]);

  const resetForm = useCallback(() => {
    setUserACurrent("");
    setUserAPrevious("");
    setUserBCurrent("");
    setUserBPrevious("");
    setTotalBill("");
    setResults(null);
    setFormError(null);
    setSavingError(null);
    setSaveStatus(null);

    const previousReadings = findPreviousBillReadings(history, year, month);
    if (previousReadings) {
      setUserAPrevious(String(previousReadings.selfPreviousReading));
      setUserBPrevious(String(previousReadings.peerPreviousReading));
    }
  }, [history, month, year]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        void calculateBills();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [calculateBills]);

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
                输入双方本次和上次读数，点击计算后会自动保存或更新当月记录。
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
                <Button
                  type="button"
                  disabled={saving}
                  onClick={() => void calculateBills()}
                >
                  <Calculator className="size-4" />
                  {saving ? "正在保存..." : "计算并保存"}
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
                  暂无记录。完成计算后会自动保存到这里。
                </div>
              ) : (
                <Accordion type="single" collapsible>
                  {history.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger>
                        <span className="flex-1 text-left font-medium">
                          {item.year}/{item.month} {item.selfAmount != null ? `¥${formatCurrency(item.selfAmount)}` : ""}
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          aria-label="删除记录"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDelete(item.id);
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                          <DetailRow label="总金额" value={`¥${formatCurrency(item.amount)}`} />
                          <DetailRow label="总用量" value={`${item.usage} ${config.usageUnit}`} />
                          
                          <div className="col-span-full border-t border-border/40 pt-2" />
                          
                          <DetailRow label="我家读数" value={formatReadingRange(item.selfPreviousReading, item.selfCurrentReading, config.usageUnit)} highlight="self" />
                          <DetailRow label="我家用量" value={formatNullableUsage(item.selfUsage, config.usageUnit)} highlight="self" />
                          <DetailRow label="我家费用" value={formatNullableCurrency(item.selfAmount)} highlight="self" />
                          
                          <div className="col-span-full border-t border-border/40 pt-2" />
                          
                          <DetailRow label="对家读数" value={formatReadingRange(item.peerPreviousReading, item.peerCurrentReading, config.usageUnit)} highlight="peer" />
                          <DetailRow label="对家用量" value={formatNullableUsage(item.peerUsage, config.usageUnit)} highlight="peer" />
                          <DetailRow label="对家费用" value={formatNullableCurrency(item.peerAmount)} highlight="peer" />
                          
                          <div className="col-span-full border-t border-border/40 pt-2" />
                          
                          <DetailRow className="sm:col-span-full" label="保存时间" value={formatDate(item.createdAt)} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>计算结果</CardTitle>
              <CardDescription>计算后会保存为当月记录。</CardDescription>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  {saveStatus ? (
                    <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
                      {saveStatus}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                  输入读数并点击计算后，结果会显示在这里，并自动保存当月记录。
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}

function DetailRow({
  label,
  value,
  highlight,
  className,
}: {
  label: string;
  value: string;
  highlight?: "self" | "peer";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-medium tabular-nums",
          highlight === "self" && "text-sky-700 dark:text-sky-400",
          highlight === "peer" && "text-amber-700 dark:text-amber-400",
          !highlight && "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
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
