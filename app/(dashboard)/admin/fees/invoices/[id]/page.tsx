import { notFound } from "next/navigation";

import InvoiceDetail from "@/components/fees/InvoiceDetail";
import { requirePermission } from "@/lib/auth-helpers";
import { getInvoiceDetail } from "@/lib/actions/fees";

export const metadata = { title: "Invoice · School Admin" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: Props) {
  await requirePermission("manage_fees");
  const { id } = await params;
  const invoice = await getInvoiceDetail(id);
  if (!invoice) notFound();
  return <InvoiceDetail invoice={invoice} />;
}