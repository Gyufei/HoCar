export type BillType = "ELE" | "WATER";

export type BillRecordPayloadInput = {
  type: BillType;
  year: number;
  month: number;
  selfPreviousReading: number;
  selfCurrentReading: number;
  peerPreviousReading: number;
  peerCurrentReading: number;
  totalAmount: number;
};

export type BillRecordPayload = {
  type: BillType;
  year: number;
  month: number;
  amount: number;
  usage: number;
  unitPrice: number;
  selfPreviousReading: number;
  selfCurrentReading: number;
  selfUsage: number;
  selfAmount: number;
  peerPreviousReading: number;
  peerCurrentReading: number;
  peerUsage: number;
  peerAmount: number;
};

export type BillReadingSnapshot = {
  year: number;
  month: number;
  selfCurrentReading: number | null;
  peerCurrentReading: number | null;
};

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundUnitPrice(value: number) {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}

export function buildBillRecordPayload(
  input: BillRecordPayloadInput,
): BillRecordPayload {
  const selfUsage = input.selfCurrentReading - input.selfPreviousReading;
  const peerUsage = input.peerCurrentReading - input.peerPreviousReading;
  const usage = selfUsage + peerUsage;

  if (selfUsage < 0 || peerUsage < 0) {
    throw new Error("current reading must be greater than previous reading");
  }

  if (input.totalAmount <= 0) {
    throw new Error("total amount must be greater than 0");
  }

  if (usage <= 0) {
    throw new Error("total usage must be greater than 0");
  }

  const unitPrice = input.totalAmount / usage;
  const selfAmount = roundCurrency(selfUsage * unitPrice);

  return {
    type: input.type,
    year: input.year,
    month: input.month,
    amount: input.totalAmount,
    usage,
    unitPrice: roundUnitPrice(unitPrice),
    selfPreviousReading: input.selfPreviousReading,
    selfCurrentReading: input.selfCurrentReading,
    selfUsage,
    selfAmount,
    peerPreviousReading: input.peerPreviousReading,
    peerCurrentReading: input.peerCurrentReading,
    peerUsage,
    peerAmount: roundCurrency(input.totalAmount - selfAmount),
  };
}

export function findPreviousBillReadings(
  records: BillReadingSnapshot[],
  year: number,
  month: number,
) {
  const currentPeriod = year * 100 + month;

  const previous = records
    .filter((record) => record.year * 100 + record.month < currentPeriod)
    .filter(
      (record) =>
        record.selfCurrentReading != null && record.peerCurrentReading != null,
    )
    .sort((a, b) => b.year * 100 + b.month - (a.year * 100 + a.month))[0];

  if (!previous) {
    return null;
  }

  return {
    selfPreviousReading: previous.selfCurrentReading,
    peerPreviousReading: previous.peerCurrentReading,
  };
}
