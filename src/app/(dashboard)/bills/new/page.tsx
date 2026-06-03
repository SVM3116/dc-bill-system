import React from "react";
import { BillForm } from "@/components/bill-form";
import { createClient } from "@/lib/supabase-server";
import { getSelectedFinancialYear } from "@/lib/financial-year";

interface NewBillPageProps {
  searchParams: Promise<{
    duplicateFrom?: string;
  }>;
}

export default async function NewBillPage({ searchParams }: NewBillPageProps) {
  const resolvedSearchParams = await searchParams;
  const duplicateFrom = resolvedSearchParams.duplicateFrom;
  const financialYear = await getSelectedFinancialYear();

  let duplicateData = null;
  if (duplicateFrom) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("dc_bills")
      .select("*")
      .eq("id", duplicateFrom)
      .single();

    if (data) {
      // Clean up the data for duplication
      duplicateData = {
        cheque_number: data.cheque_number,
        cheque_date: data.cheque_date,
        payee_name: data.payee_name,
        payee_address: data.payee_address,
        amount_in_words: data.amount_in_words,
        items: data.items,
      };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">D.C. Bill Entry</h2>
        <p className="text-xs text-slate-500">Record a new school expense ledger and prepare the contingent sheet</p>
      </div>
      <BillForm initialData={duplicateData} isDuplicate={!!duplicateFrom} financialYear={financialYear} />
    </div>
  );
}

