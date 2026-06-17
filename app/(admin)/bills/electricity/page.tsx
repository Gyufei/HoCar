import {
  BillCalculatorPage,
  electricityBillConfig,
} from "@/components/app/bills/bill-calculator-page";

export default function ElectricityBillPage() {
  return <BillCalculatorPage config={electricityBillConfig} />;
}
