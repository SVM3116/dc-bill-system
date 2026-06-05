import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { getSelectedFinancialYear } from "@/lib/financial-year";
import { ChequeRegisterClient } from "@/components/cheque-register-client";

export const revalidate = 0; // Disable server-side caching for this page

interface PageProps {
  searchParams: Promise<{
    financial_year?: string;
    account_type?: string;
    from_date?: string;
    to_date?: string;
  }>;
}

export default async function ChequeRegisterPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  // Determine filters
  const financialYear = resolvedSearchParams.financial_year || await getSelectedFinancialYear();
  const accountType = resolvedSearchParams.account_type || "all";
  const fromDate = resolvedSearchParams.from_date || "";
  const toDate = resolvedSearchParams.to_date || "";

  // Query generated DC Bills for the current school
  let query = supabase
    .from("dc_bills")
    .select("id, dc_bill_number, cheque_number, cheque_date, payee_name, amount, net_payable_amount, items, account_type")
    .eq("school_id", user.id)
    .eq("status", "generated")
    .not("cheque_number", "is", null);

  // Apply financial year filter
  query = query.ilike("dc_bill_number", `%${financialYear}`);

  // Apply account type filter
  if (accountType === "maintenance") {
    query = query.eq("account_type", "maintenance");
  } else if (accountType === "salary") {
    query = query.eq("account_type", "salary");
  }

  // Apply date range filters
  if (fromDate) {
    query = query.gte("cheque_date", fromDate);
  }
  if (toDate) {
    query = query.lte("cheque_date", toDate);
  }

  // Order by cheque date
  query = query.order("cheque_date", { ascending: true });

  const { data: bills, error } = await query;

  if (error) {
    console.error("Failed to query cheque register bills:", error);
  }

  // Map database rows to expected client properties, converting items array to serial-wise particulars list
  const formattedBills = (bills || []).map((bill: any) => {
    const items = (bill.items as any[]) || [];
    const particulars = items
      .map((item, idx) => `${idx + 1}. ${item.purpose || ""}`)
      .join("\n");

    return {
      dc_bill_number: bill.dc_bill_number,
      cheque_number: bill.cheque_number,
      cheque_date: bill.cheque_date,
      payee_name: bill.payee_name,
      amount: Number(bill.amount),
      net_payable_amount: bill.net_payable_amount ? Number(bill.net_payable_amount) : null,
      account_type: bill.account_type,
      particulars,
    };
  });

  return (
    <ChequeRegisterClient
      initialBills={formattedBills}
      financialYear={financialYear}
      initialAccountType={accountType}
      initialFromDate={fromDate}
      initialToDate={toDate}
    />
  );
}
