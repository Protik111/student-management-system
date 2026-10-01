import { requireRole } from "@/lib/auth-helpers";
import StudentFeesList from "@/components/fees/StudentFeesList";
import { listMyInvoices } from "@/lib/actions/fees";

export const metadata = { title: "My Fees · Student" };

export default async function StudentFeesPage() {
  await requireRole("STUDENT");
  const invoices = await listMyInvoices();
  return <StudentFeesList initialInvoices={invoices} />;
}