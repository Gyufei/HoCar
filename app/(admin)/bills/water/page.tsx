import {
  BillCalculatorPage,
  waterBillConfig,
} from "@/components/app/bills/bill-calculator-page";

export default function WaterBillPage() {
  return <BillCalculatorPage config={waterBillConfig} />;
}
