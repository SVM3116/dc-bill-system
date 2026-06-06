import React from "react";
import { BillForm } from "@/components/bill-form";
import { createClient } from "@/lib/supabase-server";
import { getSelectedFinancialYear } from "@/lib/financial-year";
import { getBillTemplateById } from "@/app/actions/bill-template-actions";

interface NewBillPageProps {
  searchParams: Promise<{
    duplicateFrom?: string;
    account_type?: string;
    templateId?: string;
  }>;
}

export default async function NewBillPage({ searchParams }: NewBillPageProps) {
  const resolvedSearchParams = await searchParams;
  const duplicateFrom = resolvedSearchParams.duplicateFrom;
  const accountType = resolvedSearchParams.account_type || "maintenance";
  const templateId = resolvedSearchParams.templateId;
  const financialYear = await getSelectedFinancialYear();

  let initialData = null;
  if (duplicateFrom) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("dc_bills")
        .select("*, dc_bill_deductions(*)")
        .eq("id", duplicateFrom)
        .eq("school_id", user.id)
        .single();

      if (data) {
        // Clean up the data for duplication
        initialData = {
          cheque_number: data.cheque_number,
          cheque_date: data.cheque_date,
          payee_name: data.payee_name,
          payee_address: data.payee_address,
          amount_in_words: data.amount_in_words,
          items: data.items,
          account_type: data.account_type, // duplicate same account type
          deductions: data.dc_bill_deductions ? data.dc_bill_deductions.map((d: any) => ({
            deduction_type: d.deduction_type,
            deduction_mode: d.deduction_mode,
            deduction_value: Number(d.deduction_value) || 0,
            deduction_amount: Number(d.deduction_amount) || 0,
          })) : [],
        };
      }
    }
  } else if (templateId) {
    try {
      const template = await getBillTemplateById(templateId);
      if (template) {
        initialData = {
          payee_name: template.payee_name,
          payee_address: template.payee_address,
          items: template.items || [],
          account_type: template.account_type,
          deductions: template.deductions || [],
        };
      }
    } catch (err) {
      console.error("Failed to load bill template:", err);
    }
  }

  const accountLabel = accountType === "salary" ? "Salary Account" : "Maintenance Account";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">{accountLabel} D.C. Bill Entry</h2>
        <p className="text-xs text-slate-500">Record a new school expense ledger and prepare the contingent sheet for {accountLabel}</p>
      </div>
      <BillForm 
        initialData={initialData} 
        isDuplicate={!!duplicateFrom} 
        financialYear={financialYear} 
        accountType={accountType as "maintenance" | "salary"} 
      />
    </div>
  );
}


