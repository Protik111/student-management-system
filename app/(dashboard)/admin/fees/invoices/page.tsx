import { requirePermission } from "@/lib/auth-helpers";
import { listInvoices } from "@/lib/actions/fees";
import InvoicesList from "@/components/fees/InvoicesList";

export const metadata = { title: "Invoices · School Admin" };

export default async function SchoolAdminInvoicesPage() {
  await requirePermission("manage_fees");
  const initial = await listInvoices();
  return <InvoicesList initialInvoices={initial} />;
}