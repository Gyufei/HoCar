import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { roundBillDecimal, roundUnitPrice } from "@/lib/bills/record-payload";
import { prisma } from "@/lib/prisma";

const billUpdateSchema = z.object({
  amount: z.number().nonnegative().optional(),
  usage: z.number().nonnegative().optional(),
  unitPrice: z.number().nonnegative().optional().nullable(),
  selfPreviousReading: z.number().nonnegative().optional(),
  selfCurrentReading: z.number().nonnegative().optional(),
  selfUsage: z.number().nonnegative().optional(),
  selfAmount: z.number().nonnegative().optional(),
  peerPreviousReading: z.number().nonnegative().optional(),
  peerCurrentReading: z.number().nonnegative().optional(),
  peerUsage: z.number().nonnegative().optional(),
  peerAmount: z.number().nonnegative().optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  month: z.number().int().min(1).max(12).optional(),
});

const idSchema = z.string().min(1);

function getUserIdFromEnv(): string {
  const userId = process.env.SINGLE_USER_ID;
  if (!userId) {
    throw new Error("SINGLE_USER_ID is not set");
  }
  return userId;
}

function roundOptionalBillDecimal(value: number | undefined) {
  return value === undefined ? undefined : roundBillDecimal(value);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_ID", message: "ID 不合法" } },
      { status: 400 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_JSON", message: "请求体必须是 JSON" } },
      { status: 400 },
    );
  }

  const parsedBody = billUpdateSchema.safeParse(json);
  if (!parsedBody.success) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_BODY", message: "请求体参数不合法" } },
      { status: 400 },
    );
  }

  try {
    const userId = getUserIdFromEnv();
    const {
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
      year,
      month,
    } = parsedBody.data;

    const bill = await prisma.bill.update({
      where: {
        id: parsedId.data,
        userId,
      },
      data: {
        amount: roundOptionalBillDecimal(amount),
        usage: roundOptionalBillDecimal(usage),
        unitPrice: unitPrice == null ? unitPrice : roundUnitPrice(unitPrice),
        selfPreviousReading: roundOptionalBillDecimal(selfPreviousReading),
        selfCurrentReading: roundOptionalBillDecimal(selfCurrentReading),
        selfUsage: roundOptionalBillDecimal(selfUsage),
        selfAmount: roundOptionalBillDecimal(selfAmount),
        peerPreviousReading: roundOptionalBillDecimal(peerPreviousReading),
        peerCurrentReading: roundOptionalBillDecimal(peerCurrentReading),
        peerUsage: roundOptionalBillDecimal(peerUsage),
        peerAmount: roundOptionalBillDecimal(peerAmount),
        year,
        month,
      },
    });

    return NextResponse.json({ success: true, data: bill });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器内部错误" } },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_ID", message: "ID 不合法" } },
      { status: 400 },
    );
  }

  try {
    const userId = getUserIdFromEnv();
    await prisma.bill.delete({
      where: {
        id: parsedId.data,
        userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器内部错误" } },
      { status: 500 },
    );
  }
}
