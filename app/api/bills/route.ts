import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { roundBillDecimal, roundUnitPrice } from "@/lib/bills/record-payload";
import { prisma } from "@/lib/prisma";

const billCreateSchema = z.object({
  type: z.enum(["ELE", "WATER"]),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  amount: z.number().nonnegative(),
  usage: z.number().nonnegative(),
  unitPrice: z.number().nonnegative().optional(),
  selfPreviousReading: z.number().nonnegative(),
  selfCurrentReading: z.number().nonnegative(),
  selfUsage: z.number().nonnegative(),
  selfAmount: z.number().nonnegative(),
  peerPreviousReading: z.number().nonnegative(),
  peerCurrentReading: z.number().nonnegative(),
  peerUsage: z.number().nonnegative(),
  peerAmount: z.number().nonnegative(),
});

const billQuerySchema = z.object({
  type: z.enum(["ELE", "WATER"]).optional(),
  year: z.coerce.number().int().optional(),
  month: z.coerce.number().int().optional(),
});

function getUserIdFromEnv(): string {
  const userId = process.env.SINGLE_USER_ID;
  if (!userId) {
    throw new Error("SINGLE_USER_ID is not set");
  }
  return userId;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const parsed = billQuerySchema.safeParse({
    type: searchParams.get("type") ?? undefined,
    year: searchParams.get("year") ?? undefined,
    month: searchParams.get("month") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_QUERY", message: "查询参数不合法" } },
      { status: 400 },
    );
  }

  const { type, year, month } = parsed.data;

  try {
    const userId = getUserIdFromEnv();

    const bills = await prisma.bill.findMany({
      where: {
        userId,
        type,
        year,
        month,
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ success: true, data: bills });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器内部错误" } },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_JSON", message: "请求体必须是 JSON" } },
      { status: 400 },
    );
  }

  const parsed = billCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_BODY",
          message: "请求体参数不合法",
        },
      },
      { status: 400 },
    );
  }

  const {
    type,
    year,
    month,
    amount,
    usage,
    unitPrice,
    selfPreviousReading,
    selfCurrentReading,
    selfUsage,
    selfAmount,
    peerPreviousReading,
    peerCurrentReading,
    peerUsage,
    peerAmount,
  } = parsed.data;

  try {
    const userId = getUserIdFromEnv();

    const billData = {
      amount: roundBillDecimal(amount),
      usage: roundBillDecimal(usage),
      unitPrice: unitPrice == null ? null : roundUnitPrice(unitPrice),
      selfPreviousReading: roundBillDecimal(selfPreviousReading),
      selfCurrentReading: roundBillDecimal(selfCurrentReading),
      selfUsage: roundBillDecimal(selfUsage),
      selfAmount: roundBillDecimal(selfAmount),
      peerPreviousReading: roundBillDecimal(peerPreviousReading),
      peerCurrentReading: roundBillDecimal(peerCurrentReading),
      peerUsage: roundBillDecimal(peerUsage),
      peerAmount: roundBillDecimal(peerAmount),
    };

    const bill = await prisma.bill.upsert({
      where: {
        uniq_bills_user_year_month_type: {
          userId,
          year,
          month,
          type,
        },
      },
      create: {
        userId,
        type,
        year,
        month,
        ...billData,
      },
      update: billData,
    });

    return NextResponse.json({ success: true, data: bill }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器内部错误" } },
      { status: 500 },
    );
  }
}
