import assert from "node:assert/strict";

import {
  buildBillRecordPayload,
  findPreviousBillReadings,
} from "@/lib/bills/record-payload";

const payload = buildBillRecordPayload({
  type: "ELE",
  year: 2026,
  month: 6,
  selfPreviousReading: 100,
  selfCurrentReading: 130,
  peerPreviousReading: 200,
  peerCurrentReading: 240,
  totalAmount: 140,
});

assert.deepEqual(payload, {
  type: "ELE",
  year: 2026,
  month: 6,
  amount: 140,
  usage: 70,
  unitPrice: 2,
  selfPreviousReading: 100,
  selfCurrentReading: 130,
  selfUsage: 30,
  selfAmount: 60,
  peerPreviousReading: 200,
  peerCurrentReading: 240,
  peerUsage: 40,
  peerAmount: 80,
});

assert.deepEqual(
  buildBillRecordPayload({
    type: "WATER",
    year: 2026,
    month: 7,
    selfPreviousReading: 0.1,
    selfCurrentReading: 0.4,
    peerPreviousReading: 1.2,
    peerCurrentReading: 1.5,
    totalAmount: 0.9,
  }),
  {
    type: "WATER",
    year: 2026,
    month: 7,
    amount: 0.9,
    usage: 0.6,
    unitPrice: 1.5,
    selfPreviousReading: 0.1,
    selfCurrentReading: 0.4,
    selfUsage: 0.3,
    selfAmount: 0.45,
    peerPreviousReading: 1.2,
    peerCurrentReading: 1.5,
    peerUsage: 0.3,
    peerAmount: 0.45,
  },
);

assert.throws(
  () =>
    buildBillRecordPayload({
      type: "WATER",
      year: 2026,
      month: 6,
      selfPreviousReading: 30,
      selfCurrentReading: 30,
      peerPreviousReading: 20,
      peerCurrentReading: 20,
      totalAmount: 80,
    }),
  /total usage must be greater than 0/,
);

assert.deepEqual(
  findPreviousBillReadings(
    [
      {
        year: 2026,
        month: 6,
        selfCurrentReading: 160,
        peerCurrentReading: 260,
      },
      {
        year: 2026,
        month: 5,
        selfCurrentReading: null,
        peerCurrentReading: 220,
      },
      {
        year: 2026,
        month: 3,
        selfCurrentReading: 130,
        peerCurrentReading: 240,
      },
      {
        year: 2025,
        month: 12,
        selfCurrentReading: 100,
        peerCurrentReading: 200,
      },
    ],
    2026,
    6,
  ),
  { selfPreviousReading: 130, peerPreviousReading: 240 },
);

assert.equal(
  findPreviousBillReadings(
    [
      {
        year: 2026,
        month: 6,
        selfCurrentReading: 160,
        peerCurrentReading: 260,
      },
    ],
    2026,
    6,
  ),
  null,
);
