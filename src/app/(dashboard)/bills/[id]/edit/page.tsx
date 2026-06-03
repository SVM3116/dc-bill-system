import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { BillForm } from "@/components/bill-form";
import { getSelectedFinancialYear } from "@/lib/financial-year";

interface EditBillPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 0; // Fresh fetch

export default async function EditBillPage({ params }: EditBillPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = await createClient();
  const financialYear = await getSelectedFinancialYear();

  const { data: bill, error } = await supabase
    .from("dc_bills")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !bill) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Edit DC Bill</h2>
        <p className="text-xs text-slate-500">Modify stored variables for this contingency statement</p>
      </div>
      <BillForm billId={id} initialData={bill} financialYear={financialYear} />
    </div>
  );
}
