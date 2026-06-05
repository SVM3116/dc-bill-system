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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    notFound();
  }

  const { data: bill, error } = await supabase
    .from("dc_bills")
    .select("*, dc_bill_deductions(*)")
    .eq("id", id)
    .eq("school_id", user.id)
    .single();

  if (error || !bill) {
    notFound();
  }

  const formattedBill = {
    ...bill,
    deductions: bill.dc_bill_deductions ? bill.dc_bill_deductions.map((d: any) => ({
      deduction_type: d.deduction_type,
      deduction_mode: d.deduction_mode,
      deduction_value: Number(d.deduction_value) || 0,
      deduction_amount: Number(d.deduction_amount) || 0,
    })) : [],
  };

  const accountLabel = formattedBill.account_type === "salary" ? "Salary Account" : "Maintenance Account";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Edit {accountLabel} DC Bill</h2>
        <p className="text-xs text-slate-500">Modify stored variables for this {accountLabel} contingency statement</p>
      </div>
      <BillForm 
        billId={id} 
        initialData={formattedBill} 
        financialYear={financialYear} 
        accountType={formattedBill.account_type as "maintenance" | "salary"}
      />
    </div>
  );
}
